import express from "express";
import {
  getOfficialBodies,
  getOfficialBodyById,
} from "../controllers/officialBodyController.js";

const router = express.Router();

router.get("/", getOfficialBodies);
router.get("/:id", getOfficialBodyById);

export default router;
