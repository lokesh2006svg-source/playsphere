import { body, validationResult } from "express-validator";

/**
 * Strips script tags, HTML tags, and dangerous javascript: payloads to prevent Stored & Reflected XSS.
 * @param {string} str
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:[^\s"'>]+/gi, "")
    .replace(/<[^>]+>/g, "") // Strip raw HTML tags
    .trim();
};

/**
 * Middleware that recursively sanitizes all string fields in req.body, req.query, and req.params
 */
export const sanitizeRequest = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

/**
 * Middleware to handle express-validator validation results and return clean error response
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || "Validation error.",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{};:'",.<>/?\\|]).+$/)
    .withMessage("Password must contain at least one uppercase letter (A-Z), one number (0-9), and one special character."),
  body("city").optional().trim().isLength({ max: 50 }),
  body("location").optional().trim().isLength({ max: 100 }),
  handleValidationErrors,
];

/**
 * Validation rules for user profile
 */
export const validateProfile = [
  body("sport").optional().trim().isLength({ max: 50 }),
  body("skillLevel")
    .optional()
    .customSanitizer((v) => (typeof v === "string" ? v.toLowerCase() : v))
    .isIn(["beginner", "intermediate", "advanced", "pro"])
    .withMessage("Invalid skill level."),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters."),
  body("phone").optional().trim().isLength({ max: 25 }),
  body("city").optional().trim().isLength({ max: 50 }),
  handleValidationErrors,
];

/**
 * Validation rules for team creation
 */
export const validateTeam = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Team name is required.")
    .isLength({ min: 2, max: 80 })
    .withMessage("Team name must be between 2 and 80 characters."),
  body("sport").trim().notEmpty().withMessage("Sport is required."),
  body("city").optional().trim().isLength({ max: 50 }),
  body("bio").optional().trim().isLength({ max: 500 }),
  handleValidationErrors,
];

/**
 * Validation rules for venue creation
 */
export const validateVenue = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Venue name is required.")
    .isLength({ min: 2, max: 100 }),
  body("sportType").trim().notEmpty().withMessage("Sport type is required."),
  body("address").trim().notEmpty().withMessage("Address is required."),
  body("pricePerHour")
    .optional()
    .isNumeric()
    .withMessage("Price per hour must be a numeric value."),
  handleValidationErrors,
];

export default {
  sanitizeString,
  sanitizeRequest,
  handleValidationErrors,
  validateRegister,
  validateProfile,
  validateTeam,
  validateVenue,
};
