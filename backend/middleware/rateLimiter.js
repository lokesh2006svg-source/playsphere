import rateLimit from "express-rate-limit";

/**
 * Login Rate Limiter:
 * Keyed strictly on the specific user's EMAIL address (not IP).
 * - Unlimited different users can log in simultaneously from the same IP/Wi-Fi without interference.
 * - Only counts FAILED login attempts (skipSuccessfulRequests: true).
 * - Max 5 failed attempts per account within a 15-minute window.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5, // 5 failed attempts per account
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts; successful logins are free
  validate: { trustProxy: false, keyGeneratorIpFallback: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    if (req.body && req.body.email && typeof req.body.email === "string") {
      return `login_email_${req.body.email.toLowerCase().trim()}`;
    }
    return `login_ip_${req.ip || "unknown"}`;
  },
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
  message: {
    success: false,
    message: "Too many failed login attempts on this account. Please wait 15 minutes before trying again.",
  },
});

/**
 * Register Rate Limiter:
 * Generous threshold per IP (30 signups/hr) to allow multiple real users on college Wi-Fi / shared NAT networks.
 * Prevents automated registration spam while keeping normal multi-user onboarding seamless.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 30, // 30 accounts/hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
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
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
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
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
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
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
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
  skip: () => process.env.RATE_LIMIT_DISABLED === "true",
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
