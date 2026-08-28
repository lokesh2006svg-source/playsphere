import OfficialSportBody from "../models/OfficialSportBody.js";

// @desc    Get all official sports bodies with hierarchical tree structure
// @route   GET /api/official-bodies
// @access  Public
export const getOfficialBodies = async (req, res) => {
  try {
    const { sport, city, level } = req.query;
    const query = {};

    if (sport && sport !== "All" && sport !== "All Sports") {
      query.sport = new RegExp(sport, "i");
    }
    if (city && city !== "All") {
      query.city = new RegExp(city, "i");
    }
    if (level && level !== "All") {
      query.level = level;
    }

    const bodies = await OfficialSportBody.find(query)
      .populate("parentBodyId", "name shortName city")
      .sort({ level: 1, name: 1 });

    // Construct hierarchy (State bodies as roots, district bodies as children)
    const stateBodies = bodies.filter((b) => b.level === "state");
    const districtBodies = bodies.filter((b) => b.level === "district");

    const hierarchy = stateBodies.map((state) => {
      const children = districtBodies.filter(
        (dist) =>
          dist.parentBodyId &&
          dist.parentBodyId._id.toString() === state._id.toString()
      );
      return {
        ...state.toObject(),
        districts: children,
      };
    });

    res.json({
      success: true,
      count: bodies.length,
      bodies,
      hierarchy,
    });
  } catch (error) {
    console.error("Get official bodies error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch official bodies." });
  }
};

// @desc    Get single official body details
// @route   GET /api/official-bodies/:id
// @access  Public
export const getOfficialBodyById = async (req, res) => {
  try {
    const body = await OfficialSportBody.findById(req.params.id).populate(
      "parentBodyId"
    );

    if (!body) {
      return res.status(404).json({ message: "Official sports body not found." });
    }

    // Find child district bodies if this is a state body
    const districtBodies = await OfficialSportBody.find({ parentBodyId: body._id });

    res.json({
      success: true,
      body,
      districtBodies,
    });
  } catch (error) {
    console.error("Get official body error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch official body." });
  }
};
