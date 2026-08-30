import Club from "../models/Club.js";

// Helper to check if a filter value represents 'All'
const isAllFilter = (val) => {
  if (!val) return true;
  const s = String(val).trim().toLowerCase();
  return (
    s === "all" ||
    s === "all sports" ||
    s === "all districts" ||
    s === "all tamil nadu" ||
    s.startsWith("all ")
  );
};

// @desc    Get all sports clubs
// @route   GET /api/clubs
// @access  Public
export const getClubs = async (req, res) => {
  try {
    const { sport, city, search } = req.query;
    const query = {};

    if (!isAllFilter(sport)) {
      query.sport = new RegExp(`^${sport.trim()}$`, "i");
    }

    if (!isAllFilter(city)) {
      query.city = new RegExp(city.trim(), "i");
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: sRegex },
        { description: sRegex },
        { homeGround: sRegex },
        { city: sRegex },
        { sport: sRegex },
      ];
    }

    const clubs = await Club.find(query)
      .populate("stateBodyId", "name shortName website contactEmail")
      .populate("districtBodyId", "name shortName website contactEmail")
      .sort({ foundedYear: 1 });

    res.json({ success: true, count: clubs.length, clubs });
  } catch (error) {
    console.error("Get clubs error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch clubs." });
  }
};

// @desc    Get single club by ID
// @route   GET /api/clubs/:id
// @access  Public
export const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("stateBodyId")
      .populate("districtBodyId");

    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    res.json({ success: true, club });
  } catch (error) {
    console.error("Get club error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch club." });
  }
};

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private (Admin / Club Representative)
export const createClub = async (req, res) => {
  try {
    const { name, sport, city, homeGround, foundedYear, description, contactEmail } = req.body;

    if (!name || !sport) {
      return res.status(400).json({ message: "Club name and sport are required." });
    }

    const club = await Club.create({
      name,
      sport,
      city: city || req.user.city || "Chennai",
      homeGround: homeGround || "Local Sports Ground",
      foundedYear: foundedYear || new Date().getFullYear(),
      description: description || "",
      contactEmail: contactEmail || req.user.email,
      isVerified: true,
    });

    res.status(201).json({ success: true, message: "Club registered successfully.", club });
  } catch (error) {
    console.error("Create club error:", error);
    res.status(500).json({ message: error.message || "Failed to create club." });
  }
};
