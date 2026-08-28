import express from "express";
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  refreshSessionToken,
  logout,
  logoutAllDevices,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { loginLimiter, registerLimiter, resendOtpLimiter } from "../middleware/rateLimiter.js";
import { validateRegister } from "../middleware/sanitizer.js";

const router = express.Router();

// Registration & Login
router.post("/register", registerLimiter, validateRegister, register);
router.post("/login", loginLimiter, login);

// Email Verification (Hashed OTP)
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendOtpLimiter, resendVerification);

// Token Refresh & Session Management
router.post("/refresh-token", refreshSessionToken);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAllDevices);

// Current User Profile
router.get("/me", protect, getMe);

export default router;
