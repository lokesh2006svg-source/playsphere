import express from "express";
import { getClubs, getClubById, createClub } from "../controllers/clubController.js";
import { protect } from "../middleware/auth.js";
import { requireSuperAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getClubs);
router.get("/:id", getClubById);
router.post("/", protect, requireSuperAdmin, createClub);

export default router;
