import GameRule from "../models/GameRule.js";

// @desc    Get all sports rules
// @route   GET /api/rules
// @access  Public
export const getRules = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { sport: new RegExp(search, "i") },
        { summary: new RegExp(search, "i") },
        { keyRules: new RegExp(search, "i") },
      ];
    }

    const rules = await GameRule.find(query).sort({ sport: 1 });
    res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    console.error("Get rules error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch rules." });
  }
};

// @desc    Get rules for a specific sport
// @route   GET /api/rules/:sport
// @access  Public
export const getRuleBySport = async (req, res) => {
  try {
    const rule = await GameRule.findOne({
      sport: new RegExp(`^${req.params.sport}$`, "i"),
    });

    if (!rule) {
      return res.status(404).json({ message: `Rules not found for sport '${req.params.sport}'.` });
    }

    res.json({ success: true, rule });
  } catch (error) {
    console.error("Get rule by sport error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch rule." });
  }
};

// @desc    Admin create or update sport rule
// @route   POST /api/rules
// @access  Private (Admin)
export const saveRule = async (req, res) => {
  try {
    const { sport, summary, keyRules, playerCount, duration, officialSourceName, officialSourceUrl, category } = req.body;

    if (!sport || !summary || !keyRules) {
      return res.status(400).json({ message: "Sport, summary, and keyRules are required." });
    }

    const rule = await GameRule.findOneAndUpdate(
      { sport: new RegExp(`^${sport}$`, "i") },
      {
        sport,
        category: category || "Team Sport",
        summary,
        keyRules,
        playerCount: playerCount || "Standard team format",
        duration: duration || "Standard match duration",
        officialSourceName: officialSourceName || "Official Sports Federation Rulebook 2026",
        officialSourceUrl: officialSourceUrl || "",
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Rule saved successfully.", rule });
  } catch (error) {
    console.error("Save rule error:", error);
    res.status(500).json({ message: error.message || "Failed to save rule." });
  }
};
