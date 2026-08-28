import express from "express";
import {
  getRules,
  getRuleBySport,
  saveRule,
} from "../controllers/ruleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getRules);
router.get("/:sport", getRuleBySport);
router.post("/", protect, saveRule);

export default router;
