import rateLimit from "express-rate-limit";

/**
 * Login Rate Limiter: Max 100 attempts per 15 minutes per IP
 * skipSuccessfulRequests: true ensures legitimate user logins are not counted against rate limits.
 * Prevents credential stuffing & brute-force attacks while allowing multiple users on same Wi-Fi / proxy.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Too many failed login attempts from this network. Please try again after 15 minutes.",
  },
});

/**
 * Register Rate Limiter:
 * Allows multiple users/devices on the same Wi-Fi / NAT network / demo environment to register smoothly.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Too many accounts registered from this network recently. Please try again later.",
  },
});

/**
 * OTP Resend Rate Limiter: Max 30 requests per 15 minutes per IP
 */
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Too many verification code requests. Please wait a few minutes before trying again.",
  },
});

/**
 * Chatbot AI Rate Limiter: Max 60 queries per hour per IP
 * Prevents API cost abuse and automated bot spam
 */
export const chatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Hourly chatbot query limit reached. Please explore the official Game Rules tab directly.",
  },
});

/**
 * Payment Confirmation Rate Limiter: Max 30 confirmation requests per 10 minutes per IP
 * Works alongside per-booking attempt counters in the database (max 3 per booking ID)
 */
export const paymentConfirmLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Too many payment confirmation requests. Please wait a few minutes before trying again.",
  },
});

/**
 * Global API Rate Limiter: Max 5000 requests per 15 minutes per IP
 * Supports high concurrent user traffic across matches, venues, leaderboards
 */
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_API_MAX) || 5000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: "Too many requests from your network. Please slow down.",
  },
});

export default {
  loginLimiter,
  registerLimiter,
  resendOtpLimiter,
  chatbotLimiter,
  paymentConfirmLimiter,
  apiGlobalLimiter,
};
