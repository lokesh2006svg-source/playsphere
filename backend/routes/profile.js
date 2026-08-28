import express from "express";
import {
  createOrUpdateProfile,
  getProfileByUserId,
  updateLocation,
  updatePhoto,
  deletePhoto,
  getPlayerCard,
  getPublicProfile,
} from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { uploadProfilePhoto } from "../middleware/uploadMiddleware.js";
import { validateProfile } from "../middleware/sanitizer.js";

const router = express.Router();

// Public route (no auth required)
router.get("/public/:userId", getPublicProfile);

// Authenticated profile routes (validated and sanitized)
router.post("/", protect, validateProfile, createOrUpdateProfile);
router.put("/", protect, validateProfile, createOrUpdateProfile);
router.put("/location", protect, updateLocation);
router.post("/photo", protect, uploadProfilePhoto.single("photo"), updatePhoto);
router.delete("/photo", protect, deletePhoto);
router.get("/:userId/card", protect, getPlayerCard);
router.get("/:userId", protect, getProfileByUserId);

export default router;
