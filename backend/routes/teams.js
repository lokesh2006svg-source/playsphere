import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  invitePlayerToTeam,
  getMyInvites,
  respondToInvite,
  removeTeamMember,
} from "../controllers/teamController.js";
import { protect, optionalProtect } from "../middleware/auth.js";
import { validateTeam } from "../middleware/sanitizer.js";

const router = express.Router();

router.post("/", protect, validateTeam, createTeam);
router.get("/", optionalProtect, getTeams);
router.get("/invites/my", protect, getMyInvites);
router.get("/:id", getTeamById);
router.post("/:id/invite", protect, invitePlayerToTeam);
router.post("/invites/:id/respond", protect, respondToInvite);
router.put("/invites/:id/respond", protect, respondToInvite);
router.delete("/:id/members/:userId", protect, removeTeamMember);

export default router;
