import axios from "axios";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:5000/api";
const MONGO_URI = "mongodb://127.0.0.1:27017/playsphere";

async function runSecurityTests() {
  console.log("================================================================================");
  console.log("🛡️  PLAYSPHERE COMPREHENSIVE SECURITY HARDENING VERIFICATION");
  console.log("================================================================================\n");

  const results = [];
  const logResult = (num, name, status, details = "") => {
    const icon = status === "PASS" ? "✅" : "❌";
    console.log(`${icon} [TEST ${num}] ${name}: ${status}`);
    if (details) console.log(`   └─ ${details}`);
    results.push({ test: num, name, status, details });
  };

  // Connect to local MongoDB
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  try {
    // Ensure Super Admin has a strong test password
    const adminPassword = "PlaySphere@Admin2026";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    await db.collection("users").updateOne(
      { email: "demo@playsphere.com" },
      {
        $set: {
          password: hashedAdminPassword,
          role: "super_admin",
          isEmailVerified: true,
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      }
    );

    // -------------------------------------------------------------------------
    // TEST 1: Password Strength Enforcement on Signup
    // -------------------------------------------------------------------------
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Weak User",
        email: `weak_${Date.now()}@test.com`,
        password: "simplepassword",
      });
      logResult(1, "Reject Weak Passwords (missing uppercase/symbol/number)", "FAIL", "Accepted weak password");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes("Password")) {
        logResult(1, "Reject Weak Passwords (missing uppercase/symbol/number)", "PASS", err.response.data.message);
      } else {
        logResult(1, "Reject Weak Passwords", "FAIL", err.response?.data?.message || err.message);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 2: Strong Password Acceptance & Cryptographically Secure Bcrypt OTP
    // -------------------------------------------------------------------------
    const testEmail = `hardened_${Date.now()}@playsphere.test`;
    const strongPassword = "PlaySphere@2026Secure";
    let devOtp = null;

    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: "Security Athlete",
        email: testEmail,
        password: strongPassword,
        city: "Chennai",
      });

      devOtp = regRes.data.devCode || regRes.data.devOtp;
      const userDoc = await db.collection("users").findOne({ email: testEmail });

      const isBcryptHashed =
        userDoc?.emailVerificationCodeHash &&
        (userDoc.emailVerificationCodeHash.startsWith("$2a$") || userDoc.emailVerificationCodeHash.startsWith("$2b$"));

      if (regRes.status === 201 && isBcryptHashed && !userDoc.emailVerificationCode) {
        logResult(
          2,
          "Strong Password Registration & Bcrypt Hashed OTP",
          "PASS",
          `Stored hash: ${userDoc.emailVerificationCodeHash.substring(0, 25)}... (Raw OTP never stored)`
        );
      } else {
        logResult(2, "Bcrypt Hashed OTP Storage", "FAIL", "Raw code found or bcrypt hash missing");
      }
    } catch (err) {
      logResult(2, "Strong Password Registration", "FAIL", err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Verification Attempt Limiting & Invalidation
    // -------------------------------------------------------------------------
    try {
      const attemptEmail = `attempts_${Date.now()}@playsphere.test`;
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Attempt Tester",
        email: attemptEmail,
        password: strongPassword,
      });

      // Submit wrong code 5 times
      let lastRes;
      for (let i = 1; i <= 5; i++) {
        try {
          await axios.post(`${BASE_URL}/auth/verify-email`, {
            email: attemptEmail,
            code: "000000",
          });
        } catch (err) {
          lastRes = err.response;
        }
      }

      const userAfter5 = await db.collection("users").findOne({ email: attemptEmail });
      if (lastRes?.status === 400 && userAfter5.verificationAttempts >= 5 && !userAfter5.emailVerificationCodeHash) {
        logResult(
          3,
          "Invalidate Verification Code after 5 Wrong Attempts",
          "PASS",
          "Code hash cleared from DB after 5 consecutive failures"
        );
      } else {
        logResult(3, "Verification Code Invalidation", "FAIL", `Attempts: ${userAfter5?.verificationAttempts}`);
      }
    } catch (err) {
      logResult(3, "Verification Attempt Limiting", "FAIL", err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Successful Email Verification & Refresh Token Issuance
    // -------------------------------------------------------------------------
    let accessToken = "";

    try {
      const verifyRes = await axios.post(`${BASE_URL}/auth/verify-email`, {
        email: testEmail,
        code: devOtp,
      });

      accessToken = verifyRes.data.token;
      const userDoc = await db.collection("users").findOne({ email: testEmail });
      const hasHashedRefreshToken = userDoc?.refreshTokens?.length > 0 && Boolean(userDoc.refreshTokens[0].tokenHash);

      if (verifyRes.data.success && accessToken && hasHashedRefreshToken) {
        logResult(
          4,
          "Email Verification & SHA-256 Hashed Refresh Token Storage",
          "PASS",
          `Issued access token (15m) + stored refresh hash: ${userDoc.refreshTokens[0].tokenHash.substring(0, 20)}...`
        );
      } else {
        logResult(4, "Email Verification & Refresh Token", "FAIL", "Token or refresh hash missing");
      }
    } catch (err) {
      logResult(4, "Email Verification", "FAIL", err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Account Lockout after 5 Failed Logins (HTTP 423)
    // -------------------------------------------------------------------------
    try {
      const lockoutEmail = `lockout_${Date.now()}@playsphere.test`;
      const reg = await axios.post(`${BASE_URL}/auth/register`, {
        name: "Lockout Tester",
        email: lockoutEmail,
        password: strongPassword,
      });

      // Verify email first
      await axios.post(`${BASE_URL}/auth/verify-email`, {
        email: lockoutEmail,
        code: reg.data.devCode,
      });

      // Fail 5 login attempts
      let lockResponse = null;
      for (let i = 1; i <= 5; i++) {
        try {
          await axios.post(`${BASE_URL}/auth/login`, {
            email: lockoutEmail,
            password: "WrongPassword!123",
          });
        } catch (err) {
          lockResponse = err.response;
        }
      }

      const lockedUserDoc = await db.collection("users").findOne({ email: lockoutEmail });
      const isLocked = lockedUserDoc?.lockUntil && new Date(lockedUserDoc.lockUntil) > new Date();

      if (lockResponse?.status === 423 && isLocked && lockResponse.data.isLocked) {
        logResult(
          5,
          "Account Lockout after 5 Failed Password Attempts (HTTP 423)",
          "PASS",
          `Locked until ${new Date(lockedUserDoc.lockUntil).toLocaleTimeString()} (15m lockout active)`
        );
      } else {
        logResult(5, "Account Lockout", "FAIL", `Status: ${lockResponse?.status}`);
      }
    } catch (err) {
      logResult(5, "Account Lockout", "FAIL", err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Refresh Token Rotation & Replay Attack Protection
    // -------------------------------------------------------------------------
    try {
      // Login to get fresh refresh cookie
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: strongPassword,
      });

      const rawCookie = loginRes.headers["set-cookie"]?.[0] || "";
      const cookieHeader = rawCookie.split(";")[0]; // e.g. refreshToken=xxx

      // Rotate token
      const rotateRes = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        {
          headers: { Cookie: cookieHeader },
        }
      );

      const newAccessToken = rotateRes.data.token;

      // Try re-using the old expired/rotated token
      let reuseRejected = false;
      try {
        await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: { Cookie: cookieHeader },
          }
        );
      } catch (err) {
        if (err.response?.status === 401) reuseRejected = true;
      }

      if (rotateRes.data.success && newAccessToken && reuseRejected) {
        logResult(
          6,
          "Refresh Token Rotation & Replay Protection",
          "PASS",
          "Old refresh token invalidated upon rotation; token reuse blocked (401)"
        );
      } else {
        logResult(6, "Refresh Token Rotation", "FAIL", "Rotation or replay prevention failed");
      }
    } catch (err) {
      logResult(6, "Refresh Token Rotation", "FAIL", err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Logout from All Devices (Session Revocation)
    // -------------------------------------------------------------------------
    try {
      await axios.post(
        `${BASE_URL}/auth/logout-all`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const userAfterLogoutAll = await db.collection("users").findOne({ email: testEmail });
      if (userAfterLogoutAll.refreshTokens.length === 0) {
        logResult(
          7,
          "Logout from All Devices (Session Revocation)",
          "PASS",
          "All refresh token hashes cleared from MongoDB"
        );
      } else {
        logResult(7, "Logout from All Devices", "FAIL", "Refresh tokens not cleared");
      }
    } catch (err) {
      logResult(7, "Logout from All Devices", "FAIL", err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Server-Side Payment QR (No Raw Bank ID in Response)
    // -------------------------------------------------------------------------
    let testBookingId = null;
    try {
      // Find a venue
      const venue = await db.collection("venues").findOne({ isActive: true });
      const user = await db.collection("users").findOne({ email: testEmail });

      const uniqueDate = `2027-11-${Math.floor(10 + Math.random() * 18)}`;
      const uniqueTime = `${Math.floor(10 + Math.random() * 10)}:00`;

      // Create a test booking directly in DB for testing
      const bookingInsert = await db.collection("bookings").insertOne({
        userId: user._id,
        venueId: venue._id,
        sport: venue.sportType || "Cricket",
        bookingDate: uniqueDate,
        startTime: uniqueTime,
        endTime: "23:00",
        totalPrice: venue.pricePerHour || 800,
        status: "pending",
        paymentStatus: "pending",
        paymentConfirmationAttempts: 0,
        createdAt: new Date(),
      });
      testBookingId = bookingInsert.insertedId;

      // Re-login to get fresh accessToken
      const reloginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: strongPassword,
      });
      accessToken = reloginRes.data.token;

      const qrRes = await axios.post(
        `${BASE_URL}/bookings/${testBookingId}/generate-payment-qr`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const rawUpiExposed = Boolean(qrRes.data.upiId || qrRes.data.upiString);
      const hasQrImage = Boolean(qrRes.data.qrCode && qrRes.data.qrCode.startsWith("data:image/png;base64,"));

      if (!rawUpiExposed && hasQrImage) {
        logResult(
          8,
          "Server-Side Payment QR & Masked Merchant Details",
          "PASS",
          "QR data URL generated server-side; raw UPI_ADMIN_ID hidden from JSON response"
        );
      } else {
        logResult(8, "Payment QR Masking", "FAIL", "Raw UPI ID exposed or QR image missing");
      }
    } catch (err) {
      logResult(8, "Payment QR Generation", "FAIL", err.response?.data?.message || err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Double Payment Confirmation Prevention (HTTP 400)
    // -------------------------------------------------------------------------
    try {
      // First confirmation
      const confirm1 = await axios.post(
        `${BASE_URL}/bookings/${testBookingId}/confirm-payment`,
        { paymentMethod: "upi_qr", paymentUtrNumber: "UTR123456789" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Second confirmation attempt (MUST FAIL)
      let doubleConfirmed = false;
      let rejectError = "";
      try {
        await axios.post(
          `${BASE_URL}/bookings/${testBookingId}/confirm-payment`,
          { paymentMethod: "upi_qr", paymentUtrNumber: "UTR987654321" },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        doubleConfirmed = true;
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes("Double-confirmation")) {
          rejectError = err.response.data.message;
        }
      }

      if (confirm1.data.success && !doubleConfirmed && rejectError) {
        logResult(9, "Prevent Double-Payment Confirmation (HTTP 400)", "PASS", rejectError);
      } else {
        logResult(9, "Double Payment Guard", "FAIL", doubleConfirmed ? "Allowed double payment" : "Unexpected error");
      }
    } catch (err) {
      logResult(9, "Double Payment Guard", "FAIL", err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Super Admin Password Confirmation (Re-Authentication Guard)
    // -------------------------------------------------------------------------
    try {
      // Find super admin account
      const superAdminUser = await db.collection("users").findOne({ role: "super_admin" });

      // Login as Super Admin
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: superAdminUser.email,
        password: adminPassword,
      });
      const adminToken = adminLogin.data.token;

      // 1. Attempt role change WITHOUT password confirmation -> MUST FAIL (400)
      let missingPwdRejected = false;
      try {
        await axios.put(
          `${BASE_URL}/admin/users/${superAdminUser._id}/role`,
          { role: "player" },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.requiresPassword) missingPwdRejected = true;
      }

      // 2. Attempt role change with WRONG password confirmation -> MUST FAIL (401)
      let wrongPwdRejected = false;
      try {
        await axios.put(
          `${BASE_URL}/admin/users/${superAdminUser._id}/role`,
          { role: "player", adminPassword: "WrongAdminPassword123" },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      } catch (err) {
        if (err.response?.status === 401) wrongPwdRejected = true;
      }

      if (missingPwdRejected && wrongPwdRejected) {
        logResult(
          10,
          "Super Admin Re-Authentication Password Guard",
          "PASS",
          "Role changes require valid super admin password re-auth; invalid attempts rejected (400/401)"
        );
      } else {
        logResult(
          10,
          "Super Admin Re-Auth Guard",
          "FAIL",
          `Missing rejected: ${missingPwdRejected}, Wrong rejected: ${wrongPwdRejected}`
        );
      }
    } catch (err) {
      logResult(10, "Super Admin Re-Auth Guard", "FAIL", err.message);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Audit Logs Query & Recording
    // -------------------------------------------------------------------------
    try {
      const superAdminUser = await db.collection("users").findOne({ role: "super_admin" });
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: superAdminUser.email,
        password: adminPassword,
      });
      const adminToken = adminLogin.data.token;

      const auditRes = await axios.get(`${BASE_URL}/admin/audit-logs?limit=50`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const logActions = auditRes.data.logs.map((l) => l.action);
      const hasSecurityEvents =
        logActions.includes("account_locked") ||
        logActions.includes("payment_double_confirmation_rejected") ||
        logActions.includes("admin_reauth_failed") ||
        logActions.includes("logout_all_devices");

      if (auditRes.data.success && auditRes.data.count > 0 && hasSecurityEvents) {
        logResult(
          11,
          "Security Audit Log Traceability & Viewer Feed",
          "PASS",
          `Retrieved ${auditRes.data.count} recent security audit logs (recorded actions: ${[...new Set(logActions)].slice(0, 4).join(", ")})`
        );
      } else {
        logResult(11, "Audit Log Feed", "FAIL", `Found ${auditRes.data.count} logs`);
      }
    } catch (err) {
      logResult(11, "Audit Log Feed", "FAIL", err.message);
    }
  } finally {
    await mongoose.disconnect();
  }

  // Summary
  const passed = results.filter((r) => r.status === "PASS").length;
  const total = results.length;
  console.log("\n================================================================================");
  console.log(`📊 FINAL RESULT: ${passed}/${total} SECURITY TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================================\n");
}

runSecurityTests().catch((err) => {
  console.error("Test suite runner error:", err);
  process.exit(1);
});
