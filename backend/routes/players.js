import express from "express";
import {
  getNearbyPlayers,
  getPlayerLeaderboard,
  getPlayerById,
} from "../controllers/playerController.js";
import { optionalProtect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/players & GET /api/players/nearby
router.get("/", optionalProtect, getNearbyPlayers);
router.get("/nearby", optionalProtect, getNearbyPlayers);

// GET /api/players/leaderboard
router.get("/leaderboard", getPlayerLeaderboard);

// GET /api/players/:id
router.get("/:id", getPlayerById);

export default router;
