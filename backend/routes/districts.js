import express from "express";
import { TN_DISTRICTS, TN_DISTRICT_COORDINATES } from "../constants/tnDistricts.js";

const router = express.Router();

// @desc    Get all 38 official districts of Tamil Nadu
// @route   GET /api/districts
// @access  Public
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: TN_DISTRICTS.length,
    districts: TN_DISTRICTS,
    coordinates: TN_DISTRICT_COORDINATES,
  });
});

export default router;
