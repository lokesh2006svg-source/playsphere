import express from "express";
import {
  generateInvite,
  getInviteByCode,
  redeemInvite,
} from "../controllers/inviteController.js";
import {
  getMyInvites,
  respondToInvite,
} from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// General community invite codes
router.post("/generate", protect, generateInvite);
router.get("/code/:inviteCode", getInviteByCode);
router.post("/code/:inviteCode/redeem", redeemInvite);

// Squad player team invites
router.get("/my", protect, getMyInvites);
router.post("/:id/respond", protect, respondToInvite);
router.put("/:id/respond", protect, respondToInvite);

// Backwards compatibility with /:inviteCode
router.get("/:inviteCode", getInviteByCode);
router.post("/:inviteCode/redeem", redeemInvite);

export default router;
