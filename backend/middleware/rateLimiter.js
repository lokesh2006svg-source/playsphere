import rateLimit from "express-rate-limit";

/**
 * Login Rate Limiter: Max 5 attempts per 15 minutes per IP
 * Prevents credential stuffing & brute-force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 60, // Production: 5/15m; Development: 60/15m
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: false,
});

/**
 * Register Rate Limiter:
 * Production: 5 accounts created per hour per IP
 * Development: 20 accounts created per hour per IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "production" ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many accounts registered from this IP. Please try again in an hour.",
  },
});

/**
 * OTP Resend Rate Limiter: Max 5 requests per 15 minutes per IP
 */
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification code requests. Please wait a few minutes before trying again.",
  },
});

/**
 * Chatbot AI Rate Limiter: Max 20 queries per hour per IP
 * Prevents API cost abuse and automated bot spam
 */
export const chatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Hourly chatbot query limit reached (20 questions/hr). Please explore the official Game Rules tab directly.",
  },
});

/**
 * Payment Confirmation Rate Limiter: Max 5 confirmation requests per 10 minutes per IP
 * Works alongside per-booking attempt counters in the database (max 3 per booking ID)
 */
export const paymentConfirmLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment confirmation requests. Please wait a few minutes before trying again.",
  },
});

/**
 * Global API Rate Limiter: Max 300 requests per 15 minutes per IP
 */
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
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
