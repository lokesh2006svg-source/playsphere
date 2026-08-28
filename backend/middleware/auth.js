import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "playsphere_jwt_secret_key_2026_sports_super_safe_and_random_token_99";
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 Minutes
const REFRESH_TOKEN_DAYS = 7; // 7 Days

/**
 * Generates a short-lived access token (15 Minutes)
 * @param {string} id - User ID
 * @param {string} role - User Role
 */
export const generateAccessToken = (id, role = "user") => {
  return jwt.sign(
    { id, role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Backwards compatibility alias
export const generateToken = (id, role) => generateAccessToken(id, role);

/**
 * Hashes a token string using SHA-256 (Never store raw refresh tokens)
 * @param {string} token
 * @returns {string}
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generates a secure random refresh token string and its SHA-256 hash
 * @returns {{ rawToken: string, tokenHash: string, expiresAt: Date }}
 */
export const generateRefreshToken = () => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
};

/**
 * Standard secure cookie options for httpOnly refresh tokens
 */
export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  path: "/api/auth",
});

export const getClearRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/auth",
});

/**
 * Protect middleware for private endpoints
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: "User not found with this token." });
      }

      // Check if account was locked
      if (req.user.isLocked()) {
        const remainingMins = Math.ceil((req.user.lockUntil - Date.now()) / 60000);
        return res.status(423).json({
          message: `Account is temporarily locked. Please try again in ${remainingMins} minute(s).`,
          lockUntil: req.user.lockUntil,
        });
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          code: "TOKEN_EXPIRED",
          message: "Access token expired. Please refresh your session.",
        });
      }
      return res.status(401).json({ message: "Not authorized, token invalid or malformed." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no authorization token provided." });
  }
};

/**
 * Optional protect middleware
 */
export const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      req.user = null;
    }
  }
  next();
};

export default {
  generateAccessToken,
  generateToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenCookieOptions,
  protect,
  optionalProtect,
};
