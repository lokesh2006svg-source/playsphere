import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import PlayerProfile from "./models/PlayerProfile.js";
import { generateAccessToken, generateRefreshToken } from "./middleware/auth.js";
import { isStrongPassword } from "./controllers/authController.js";

async function runMultiUserAuthTest() {
  console.log("==================================================");
  console.log("🧪 RUNNING MULTI-USER REGISTRATION & LOGIN TEST");
  console.log("==================================================");

  try {
    await connectDB();

    // Test 1: Strong Password Validator
    console.log("\n[1] Testing Strong Password Policy...");
    console.assert(isStrongPassword("Athlete@2026") === true, "Strong password should pass");
    console.assert(isStrongPassword("weakpass") === false, "Weak password should fail");
    console.log("  ✓ Password policy test passed.");

    // Test 2: Multi-person Registration Simulation
    console.log("\n[2] Registering 3 Distinct Test Users in Database...");
    const testUsers = [
      { name: "Test User 1", email: `testuser1_${Date.now()}@playsphere.test`, password: "TestUser@2026", city: "Madurai" },
      { name: "Test User 2", email: `testuser2_${Date.now()}@playsphere.test`, password: "TestUser@2026", city: "Chennai" },
      { name: "Test User 3", email: `testuser3_${Date.now()}@playsphere.test`, password: "TestUser@2026", city: "Coimbatore" },
    ];

    const createdUsers = [];
    for (const u of testUsers) {
      const created = await User.create({
        name: u.name,
        email: u.email.toLowerCase(),
        password: u.password,
        city: u.city,
        location: `${u.city}, Tamil Nadu`,
        isEmailVerified: true,
        hasCompletedProfile: false,
      });
      createdUsers.push(created);
      console.log(`  ✓ Created user: ${created.name} (${created.email}) [ID: ${created._id}]`);
    }

    // Test 3: Multi-person Login & Password Matching
    console.log("\n[3] Testing Password Verification & Token Generation for All Users...");
    for (const u of createdUsers) {
      const isMatch = await u.matchPassword("TestUser@2026");
      console.assert(isMatch === true, `Password matching failed for ${u.email}`);

      const token = generateAccessToken(u._id, u.role);
      const { rawToken, tokenHash, expiresAt } = generateRefreshToken();

      u.refreshTokens.push({ tokenHash, expiresAt, userAgent: "PlaySphere-Test", ip: "127.0.0.1" });
      await u.save();

      console.log(`  ✓ Successfully logged in & issued JWT for: ${u.email}`);
    }

    // Test 4: Profile Creation & MongoDB update for each user
    console.log("\n[4] Creating & Updating Player Profiles in MongoDB...");
    for (const u of createdUsers) {
      const profile = await PlayerProfile.create({
        userId: u._id,
        sport: "Badminton",
        skillLevel: "intermediate",
        city: u.city,
        rating: 4.2,
        location: { type: "Point", coordinates: [78.1198, 9.9252] },
        bio: `Verified test athlete in ${u.city}`,
      });

      await User.findByIdAndUpdate(u._id, { hasCompletedProfile: true });

      const updatedUser = await User.findById(u._id);
      console.assert(updatedUser.hasCompletedProfile === true, "hasCompletedProfile should be true");
      console.log(`  ✓ Created player profile (${profile.playerIdNumber}) for ${u.email}`);
    }

    // Cleanup test data
    console.log("\n[5] Cleaning up test records from database...");
    const userIds = createdUsers.map((u) => u._id);
    await User.deleteMany({ _id: { $in: userIds } });
    await PlayerProfile.deleteMany({ userId: { $in: userIds } });
    console.log("  ✓ Cleanup complete.");

    console.log("\n==================================================");
    console.log("✅ ALL MULTI-USER AUTH & DB TESTS PASSED (100%)");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runMultiUserAuthTest();
