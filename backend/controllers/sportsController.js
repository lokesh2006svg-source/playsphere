import { SPORTS_LIST, CATEGORIES, getSportsGroupedByCategory } from "../constants/sports.js";

// @desc    Get full list of 33+ sports grouped by category
// @route   GET /api/sports
// @access  Public
export const getSports = async (req, res) => {
  try {
    const grouped = getSportsGroupedByCategory();

    res.json({
      success: true,
      totalCount: SPORTS_LIST.length,
      categories: CATEGORIES,
      sports: SPORTS_LIST,
      grouped,
    });
  } catch (error) {
    console.error("Get sports error:", error);
    res.status(500).json({ message: "Failed to retrieve sports list." });
  }
};
