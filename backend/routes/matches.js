import express from "express";
import {
  getMatches,
  getMatchById,
  getLiveMatches,
  getNextMatch,
  getTodayMatches,
  updateMatchScore,
  assignScorer,
  updateStreamLink,
  getBrokenStreamLinks,
} from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Specific query endpoints first
router.get("/live", getLiveMatches);
router.get("/next", getNextMatch);
router.get("/today", getTodayMatches);
router.get("/broken-links", protect, getBrokenStreamLinks);

// General match endpoints
router.get("/", getMatches);
router.get("/:id", getMatchById);

// Match scoring and stream updates
router.put("/:id/score", protect, updateMatchScore);
router.put("/:id/assign-scorer", protect, assignScorer);
router.put("/:id/stream-link", protect, updateStreamLink);

export default router;
