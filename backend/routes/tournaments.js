import express from "express";
import {
  createTournament,
  getTournaments,
  getTournamentById,
  registerForTournament,
  generateBracket,
  getBracket,
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createTournament);
router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.get("/:id/bracket", getBracket);
router.post("/:id/register", protect, registerForTournament);
router.post("/:id/generate-bracket", protect, generateBracket);

export default router;
