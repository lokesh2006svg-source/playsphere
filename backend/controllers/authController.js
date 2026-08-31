import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PlayerProfile from "../models/PlayerProfile.js";
import GroundOwnerProfile from "../models/GroundOwnerProfile.js";
import CoachProfile from "../models/CoachProfile.js";
import { TN_DISTRICT_COORDINATES } from "../constants/tnDistricts.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenCookieOptions,
  getClearRefreshTokenCookieOptions,
} from "../middleware/auth.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import { syncPendingUserInvites } from "./teamController.js";

// Helper: Fetch profile according to role
export const fetchProfileForUser = async (userId, role) => {
  if (!userId) return null;
  if (role === "ground_owner") {
    return await GroundOwnerProfile.findOne({ userId });
  } else if (role === "coach") {
    return await CoachProfile.findOne({ userId });
  } else {
    return await PlayerProfile.findOne({ userId });
  }
};

// Helper: Check password policy (minimum 6 characters)
export const isStrongPassword = (pwd) => {
  if (!pwd || typeof pwd !== "string" || pwd.length < 6) return false;
  return true;
};

// Helper: Cryptographically secure 6-digit OTP generator
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// @desc    Register a new user (with strong password validation)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      city,
      location,
      accountType,
      role,
      sport,
      businessName,
      contactPhone,
      phone,
      yearsOfExperience,
      certifications,
      bio,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists. Please log in." });
    }

    // Role assignment strictly from permitted public types
    let assignedRole = "player";
    if (accountType === "ground_owner" || role === "ground_owner") {
      assignedRole = "ground_owner";
    } else if (accountType === "coach" || role === "coach") {
      assignedRole = "coach";
    } else {
      assignedRole = "player";
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      city: city || "Chennai",
      location: location || `${city || "Chennai"}, Tamil Nadu`,
      hasCompletedProfile: true,
      isEmailVerified: true,
      role: assignedRole,
    });

    let profile = null;
    let resolvedCoordinates = [80.2707, 13.0827]; // Chennai default
    if (user.city && TN_DISTRICT_COORDINATES[user.city]) {
      resolvedCoordinates = TN_DISTRICT_COORDINATES[user.city];
    }

    if (assignedRole === "ground_owner") {
      profile = await GroundOwnerProfile.create({
        userId: user._id,
        businessName: (businessName || `${name.trim()}'s Sports Venue`).trim(),
        contactPhone: (contactPhone || phone || "+91 98765 43210").trim(),
        city: user.city,
      });
    } else if (assignedRole === "coach") {
      profile = await CoachProfile.create({
        userId: user._id,
        sport: (sport || "Cricket").trim(),
        yearsOfExperience: Number(yearsOfExperience) || 0,
        certifications: certifications ? (Array.isArray(certifications) ? certifications : [certifications]) : [],
        city: user.city,
        phone: (phone || "").trim(),
        bio: (bio || "").trim(),
      });
    } else {
      profile = await PlayerProfile.create({
        userId: user._id,
        sport: (sport || "Cricket").trim(),
        city: user.city,
        location: {
          type: "Point",
          coordinates: resolvedCoordinates,
        },
        bio: (bio || "").trim(),
      });
    }

    // Generate 15-minute access token + 7-day refresh token
    const accessToken = generateAccessToken(user._id, user.role);
    const { rawToken: rawRefresh, tokenHash, expiresAt } = generateRefreshToken();

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      userAgent: req.headers?.["user-agent"] || "",
      ip: req.ip || "",
    });
    await user.save();

    res.cookie("refreshToken", rawRefresh, getRefreshTokenCookieOptions());

    // Sync any pending team invites sent to this email address
    syncPendingUserInvites(user).catch(() => {});

    // Emit real-time newPlayerJoined event for live directories
    try {
      const io = req.app?.get("io");
      if (io) {
        io.emit("newPlayerJoined", {
          userId: user._id,
          name: user.name,
          sport: profile?.sport || "Multi-Sport",
          city: user.city,
          role: user.role,
        });
      }
    } catch (err) {
      console.warn("Socket emit error:", err.message);
    }

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken: rawRefresh,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        location: user.location,
        hasCompletedProfile: user.hasCompletedProfile,
        role: user.role,
        isEmailVerified: true,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || user.createdAt,
      },
      profile: profile || null,
      message: `Registration successful as ${assignedRole.replace("_", " ")}! Welcome to PlaySphere.`,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Server registration error." });
  }
};

// @desc    Verify email address using 6-digit OTP code (with bcrypt comparison & attempt limiting)
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Please provide email and 6-digit verification code." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // If already verified
    if (user.isEmailVerified) {
      const accessToken = generateAccessToken(user._id, user.role);
      const { rawToken: rawRefresh, tokenHash, expiresAt } = generateRefreshToken();

      user.refreshTokens.push({
        tokenHash,
        expiresAt,
        userAgent: req.headers["user-agent"] || "",
        ip: req.ip || "",
      });
      await user.save();

      res.cookie("refreshToken", rawRefresh, getRefreshTokenCookieOptions());

      const profile = await fetchProfileForUser(user._id, user.role);
      return res.json({
        success: true,
        message: "Email is already verified. Proceeding to your account...",
        token: accessToken,
        refreshToken: rawRefresh,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          location: user.location,
          hasCompletedProfile: user.hasCompletedProfile,
          role: user.role,
          isEmailVerified: true,
          createdAt: user.createdAt,
        },
        profile: profile || null,
      });
    }

    // Check verification attempt limits (Max 5 attempts)
    if ((user.verificationAttempts || 0) >= 5 || !user.emailVerificationCodeHash) {
      user.emailVerificationCodeHash = null;
      user.emailVerificationExpiry = null;
      await user.save();
      return res.status(400).json({
        success: false,
        isInvalidated: true,
        message: "Maximum verification attempts exceeded (5/5). Verification code has been invalidated. Please request a new verification code.",
      });
    }

    // Verify expiry (10 minutes)
    if (!user.emailVerificationExpiry || new Date() > new Date(user.emailVerificationExpiry)) {
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "Verification code has expired. Please click 'Resend Code' to receive a fresh code.",
      });
    }

    // Compare code using bcrypt
    const isMatch = user.emailVerificationCodeHash
      ? await bcrypt.compare(code.trim(), user.emailVerificationCodeHash)
      : false;

    if (!isMatch) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      const remainingAttempts = Math.max(0, 5 - user.verificationAttempts);

      if (user.verificationAttempts >= 5) {
        user.emailVerificationCodeHash = null;
        user.emailVerificationExpiry = null;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        isInvalidated: user.verificationAttempts >= 5,
        message:
          user.verificationAttempts >= 5
            ? "Maximum verification attempts exceeded (5/5). Verification code has been invalidated. Please request a new code."
            : `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts,
      });
    }

    // Mark as verified & clear code hash
    user.isEmailVerified = true;
    user.emailVerificationCodeHash = null;
    user.emailVerificationExpiry = null;
    user.verificationAttempts = 0;

    // Issue 15-minute access token + 7-day refresh token
    const accessToken = generateAccessToken(user._id, user.role);
    const { rawToken: rawRefresh, tokenHash, expiresAt } = generateRefreshToken();

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });
    await user.save();

    res.cookie("refreshToken", rawRefresh, getRefreshTokenCookieOptions());

    const profile = await fetchProfileForUser(user._id, user.role);

    res.json({
      success: true,
      message: "Email verified successfully! Welcome to PlaySphere.",
      token: accessToken,
      refreshToken: rawRefresh,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        location: user.location,
        hasCompletedProfile: user.hasCompletedProfile,
        role: user.role,
        isEmailVerified: true,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: error.message || "Failed to verify email." });
  }
};

// @desc    Resend 6-digit verification code with 60-second rate limiting & bcrypt hashing
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Your email is already verified. You can log in directly." });
    }

    // 60-second cooldown between resends
    if (user.lastVerificationResendAt) {
      const timeElapsed = Date.now() - new Date(user.lastVerificationResendAt).getTime();
      if (timeElapsed < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeElapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
          retryAfterSeconds: waitSeconds,
        });
      }
    }

    // Generate fresh cryptographically secure 6-digit code
    const rawOtp = generateSecureOtp();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    user.emailVerificationCodeHash = hashedOtp;
    user.emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationAttempts = 0;
    user.lastVerificationResendAt = new Date();
    await user.save();

    await sendVerificationEmail(user.email, rawOtp);

    res.json({
      success: true,
      message: "A new 6-digit verification code has been sent to your email.",
      // TEMPORARY: Code shown on-screen for testing since email sending isn't configured. Remove this before production and rely on real email delivery only.
      devCode: rawOtp,
      devOtp: rawOtp,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: error.message || "Failed to resend verification code." });
  }
};

// @desc    Authenticate user, handle 5-attempt account lockout, issue access token (15m) + refresh token (7d)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    const normalizedIdentifier = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedIdentifier });

    // Fallback: If not found by email, try searching by PlayerProfile playerIdNumber or alias
    if (!user) {
      const playerProfile = await PlayerProfile.findOne({
        playerIdNumber: { $regex: new RegExp(`^${normalizedIdentifier}$`, "i") },
      });
      if (playerProfile && playerProfile.userId) {
        user = await User.findById(playerProfile.userId);
      }
    }

    // Role alias fallback (e.g. entering "coach", "owner", "admin", "player")
    if (!user) {
      if (normalizedIdentifier === "coach") {
        user = await User.findOne({ email: "coach@playsphere.com" });
      } else if (normalizedIdentifier === "owner" || normalizedIdentifier === "ground_owner") {
        user = await User.findOne({ email: "owner@playsphere.com" });
      } else if (normalizedIdentifier === "admin" || normalizedIdentifier === "superadmin") {
        user = await User.findOne({ email: "demo@playsphere.com" });
      } else if (normalizedIdentifier === "player") {
        user = await User.findOne({ email: "ananya@playsphere.com" }) || await User.findOne({ email: "karthik@playsphere.com" });
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email, login ID, or password." });
    }

    // Check account lockout status
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        isLocked: true,
        message: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        lockUntil: user.lockUntil,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
        await user.save();

        await recordAuditLog({
          req,
          action: "account_locked",
          targetId: user._id,
          targetCollection: "users",
          details: { email: user.email, reason: "5 consecutive failed login attempts", lockDuration: "15 minutes" },
        });

        return res.status(423).json({
          success: false,
          isLocked: true,
          message: "Account locked for 15 minutes due to 5 consecutive failed login attempts.",
          lockUntil: user.lockUntil,
        });
      }

      await user.save();
      const remaining = 5 - user.failedLoginAttempts;

      return res.status(401).json({
        message: `Invalid email or password. ${remaining} attempt(s) remaining before account lockout.`,
        remainingAttempts: remaining,
      });
    }

    // Reset failed login attempts on successful password
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    // Generate 15-minute access token + 7-day refresh token
    const accessToken = generateAccessToken(user._id, user.role);
    const { rawToken: rawRefresh, tokenHash, expiresAt } = generateRefreshToken();

    // Clean expired tokens & append new refresh token hash
    const now = new Date();
    user.lastLoginAt = now;
    user.refreshTokens = (user.refreshTokens || []).filter((t) => new Date(t.expiresAt) > now);
    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      userAgent: req.headers?.["user-agent"] || "",
      ip: req.ip || "",
    });
    await user.save();

    // Set secure httpOnly cookie
    res.cookie("refreshToken", rawRefresh, getRefreshTokenCookieOptions());

    // Sync any pending team invites sent to this email address
    syncPendingUserInvites(user).catch(() => {});

    const profile = await fetchProfileForUser(user._id, user.role);

    res.json({
      success: true,
      token: accessToken,
      refreshToken: rawRefresh,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        location: user.location,
        hasCompletedProfile: user.hasCompletedProfile,
        role: user.role,
        isEmailVerified: true,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server login error." });
  }
};

// @desc    Rotate Refresh Token & Issue fresh 15-minute Access Token
// @route   POST /api/auth/refresh-token
// @access  Public (Cookie / Body based)
export const refreshSessionToken = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({ message: "Refresh token missing. Please log in again." });
    }

    const incomingHash = hashToken(rawRefreshToken);
    const user = await User.findOne({ "refreshTokens.tokenHash": incomingHash });

    if (!user) {
      // Possible token reuse attack or invalid token -> clear cookie
      res.clearCookie("refreshToken", getClearRefreshTokenCookieOptions());
      return res.status(401).json({ message: "Invalid or revoked refresh token. Please log in again." });
    }

    const matchingToken = user.refreshTokens.find((t) => t.tokenHash === incomingHash);
    if (!matchingToken || new Date() > new Date(matchingToken.expiresAt)) {
      // Token expired -> remove it
      user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);
      await user.save();
      res.clearCookie("refreshToken", getClearRefreshTokenCookieOptions());
      return res.status(401).json({ message: "Refresh token expired. Please log in again." });
    }

    // Rotation: Invalidate the used refresh token and issue a fresh pair
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);
    const { rawToken: newRawRefresh, tokenHash: newHash, expiresAt: newExpiresAt } = generateRefreshToken();

    user.refreshTokens.push({
      tokenHash: newHash,
      expiresAt: newExpiresAt,
      userAgent: req.headers?.["user-agent"] || "",
      ip: req.ip || "",
    });
    await user.save();

    res.cookie("refreshToken", newRawRefresh, getRefreshTokenCookieOptions());
    const newAccessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRawRefresh,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Failed to refresh session." });
  }
};

// @desc    Logout current session (clears cookie & revokes current refresh token)
// @route   POST /api/auth/logout
// @access  Public / Private
export const logout = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawRefreshToken) {
      const incomingHash = hashToken(rawRefreshToken);
      await User.updateOne(
        { "refreshTokens.tokenHash": incomingHash },
        { $pull: { refreshTokens: { tokenHash: incomingHash } } }
      );
    }

    res.clearCookie("refreshToken", getClearRefreshTokenCookieOptions());

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to log out." });
  }
};

// @desc    Logout from all devices (revokes ALL refresh tokens for the user)
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAllDevices = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });

    res.clearCookie("refreshToken", getClearRefreshTokenCookieOptions());

    await recordAuditLog({
      req,
      action: "logout_all_devices",
      targetId: req.user._id,
      targetCollection: "users",
      details: { email: req.user.email, message: "All sessions revoked" },
    });

    res.json({
      success: true,
      message: "Successfully logged out from all devices.",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({ message: "Failed to log out from all devices." });
  }
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await fetchProfileForUser(req.user._id, user?.role || req.user.role);

    res.json({
      success: true,
      user,
      profile: profile || null,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: error.message || "Server error fetching user." });
  }
};
