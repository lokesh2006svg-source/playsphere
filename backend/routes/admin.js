import express from "express";
import {
  getAdminOverview,
  getPlatformStats,
  getAllAdminVenues,
  createAdminVenue,
  updateAdminVenue,
  deleteAdminVenue,
  getAllAdminMatches,
  createAdminMatch,
  updateAdminMatch,
  deleteAdminMatch,
  getStreamLinksHealth,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSyncStatus,
  triggerManualSync,
  getAuditLogs,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { requireVenueAdmin, requireSuperAdmin } from "../middleware/adminMiddleware.js";
import { validateVenue } from "../middleware/sanitizer.js";

const router = express.Router();

// ==========================================
// VENUE ADMIN & SUPER ADMIN ROUTES
// ==========================================

// High-level overview KPIs
router.get("/overview", protect, requireVenueAdmin, getAdminOverview);

// Venue Management (with input validation and authorization)
router.get("/venues", protect, requireVenueAdmin, getAllAdminVenues);
router.post("/venues", protect, requireVenueAdmin, validateVenue, createAdminVenue);
router.put("/venues/:id", protect, requireVenueAdmin, validateVenue, updateAdminVenue);
router.delete("/venues/:id", protect, requireVenueAdmin, deleteAdminVenue);

// Match & Score Management
router.get("/matches", protect, requireVenueAdmin, getAllAdminMatches);
router.post("/matches", protect, requireVenueAdmin, createAdminMatch);
router.put("/matches/:id", protect, requireVenueAdmin, updateAdminMatch);
router.delete("/matches/:id", protect, requireVenueAdmin, deleteAdminMatch);

// Stream links & health
router.get("/broken-links", protect, requireVenueAdmin, getStreamLinksHealth);

// Daily Sync routines
router.get("/sync-status", getSyncStatus);
router.post("/trigger-sync", protect, requireVenueAdmin, triggerManualSync);

// ==========================================
// SUPER ADMIN ONLY ROUTES (Platform Owner)
// ==========================================

// Platform-wide detailed stats
router.get("/stats", protect, requireSuperAdmin, getPlatformStats);

// User & Role Management (Security Audited)
router.get("/users", protect, requireSuperAdmin, getAllUsers);
router.put("/users/:id/role", protect, requireSuperAdmin, updateUserRole);
router.delete("/users/:id", protect, requireSuperAdmin, deleteUser);

// Audit Logs View (Super Admin Only)
router.get("/audit-logs", protect, requireSuperAdmin, getAuditLogs);

export default router;
