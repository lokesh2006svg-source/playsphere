import express from "express";
import {
  getVenues,
  searchVenuesByCity,
  getVenueById,
  getVenueAvailability,
  updateVenue,
} from "../controllers/venueController.js";
import { protect, optionalProtect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalProtect, getVenues);
router.get("/search", optionalProtect, searchVenuesByCity);
router.get("/:id", optionalProtect, getVenueById);
router.get("/:id/availability", getVenueAvailability);
router.put("/:id", protect, updateVenue);

export default router;
