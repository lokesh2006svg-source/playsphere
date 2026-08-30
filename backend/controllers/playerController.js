import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile.js";
import User from "../models/User.js";
import { CITY_COORDINATES } from "./profileController.js";

// Helper to look up city coordinates case-insensitively
export const getCityCoordinates = (cityName) => {
  if (!cityName || cityName === "All" || cityName === "all") return null;
  const matchKey = Object.keys(CITY_COORDINATES).find(
    (k) => k.toLowerCase() === cityName.trim().toLowerCase()
  );
  return matchKey ? CITY_COORDINATES[matchKey] : null;
};

// Helper to check if a filter value means 'All'
const isAllFilter = (val) => {
  if (!val) return true;
  const s = String(val).trim().toLowerCase();
  return (
    s === "all" ||
    s === "all sports" ||
    s === "all districts" ||
    s === "all tamil nadu" ||
    s === "all skill levels" ||
    s.startsWith("all ")
  );
};

// @desc    Search for nearby/all players with geospatial proximity and city filters
// @route   GET /api/players AND GET /api/players/nearby
// @access  Public / Private (supports optional auth)
export const getNearbyPlayers = async (req, res) => {
  try {
    let {
      lat,
      lng,
      maxDistanceKm = 50,
      sport,
      skillLevel,
      city,
      search,
      excludeSelf,
      limit = 100,
      page = 1,
    } = req.query;

    const maxDistanceMeters = (parseFloat(maxDistanceKm) || 50) * 1000;
    const currentUserId = req.user ? req.user._id : null;
    const shouldExcludeSelf = excludeSelf === "true" || excludeSelf === true;

    let players = [];
    let usedCityFallback = false;

    // Check if client explicitly sent GPS coordinates (e.g. from "Use Current Location")
    const hasExplicitGps =
      lat !== undefined &&
      lng !== undefined &&
      lat !== null &&
      lng !== null &&
      lat !== "" &&
      lng !== "" &&
      !isNaN(parseFloat(lat)) &&
      !isNaN(parseFloat(lng));

    if (hasExplicitGps) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      const geoNearStage = {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distanceMeters",
          maxDistance: maxDistanceMeters,
          spherical: true,
        },
      };

      const matchStage = {};

      if (currentUserId && shouldExcludeSelf) {
        matchStage.userId = { $ne: new mongoose.Types.ObjectId(currentUserId) };
      }

      if (!isAllFilter(sport)) {
        matchStage.$or = [
          { sport: new RegExp(`^${sport.trim()}$`, "i") },
          { secondarySports: new RegExp(`^${sport.trim()}$`, "i") },
        ];
      }

      if (!isAllFilter(city)) {
        matchStage.city = new RegExp(city.trim(), "i");
      }

      if (!isAllFilter(skillLevel)) {
        matchStage.skillLevel = skillLevel.toLowerCase().trim();
      }

      const pipeline = [
        geoNearStage,
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ];

      // If text search filter applied
      if (search && search.trim()) {
        const sRegex = new RegExp(search.trim(), "i");
        pipeline.push({
          $match: {
            $or: [
              { "user.name": sRegex },
              { "user.email": sRegex },
              { city: sRegex },
              { sport: sRegex },
              { bio: sRegex },
              { playerIdNumber: sRegex },
            ],
          },
        });
      }

      pipeline.push(
        {
          $project: {
            _id: 1,
            userId: "$user._id",
            name: "$user.name",
            email: "$user.email",
            city: 1,
            sport: 1,
            secondarySports: 1,
            skillLevel: 1,
            rating: 1,
            profilePhoto: 1,
            playerIdNumber: 1,
            badges: 1,
            bio: 1,
            preferredPlayTime: 1,
            matchesPlayed: 1,
            matchesWon: 1,
            createdAt: 1,
            distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] },
          },
        },
        { $sort: { distanceKm: 1, rating: -1, createdAt: -1 } },
        { $limit: parseInt(limit, 10) || 100 }
      );

      try {
        players = await PlayerProfile.aggregate(pipeline);
      } catch (geoErr) {
        console.warn("[PlayerDirectory] Aggregate geoNear error, falling back to standard query:", geoErr.message);
      }
    }

    // Standard Direct MongoDB Query (when browsing by district/all, or if GPS yielded 0 results)
    if (players.length === 0) {
      usedCityFallback = true;
      const query = {};

      if (currentUserId && shouldExcludeSelf) {
        query.userId = { $ne: currentUserId };
      }

      if (!isAllFilter(city)) {
        query.city = new RegExp(city.trim(), "i");
      }

      if (!isAllFilter(sport)) {
        query.$or = [
          { sport: new RegExp(sport.trim(), "i") },
          { secondarySports: new RegExp(sport.trim(), "i") },
        ];
      }

      if (!isAllFilter(skillLevel)) {
        query.skillLevel = skillLevel.toLowerCase().trim();
      }

      const rawProfiles = await PlayerProfile.find(query)
        .populate("userId", "name email city location role profilePhoto")
        .sort({ rating: -1, matchesWon: -1, createdAt: -1 })
        .limit(parseInt(limit, 10) || 100);

      let mapped = rawProfiles
        .filter((p) => p.userId)
        .map((p) => ({
          _id: p._id,
          userId: p.userId._id,
          name: p.userId.name,
          email: p.userId.email,
          city: p.city || p.userId.city || "Tamil Nadu",
          sport: p.sport,
          secondarySports: p.secondarySports || [],
          skillLevel: p.skillLevel,
          rating: p.rating,
          profilePhoto: p.profilePhoto || p.userId.profilePhoto || "",
          playerIdNumber: p.playerIdNumber,
          badges: p.badges || [],
          bio: p.bio || "",
          preferredPlayTime: p.preferredPlayTime || "Evenings",
          matchesPlayed: p.matchesPlayed || 0,
          matchesWon: p.matchesWon || 0,
          createdAt: p.createdAt,
          distanceKm: null,
        }));

      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        mapped = mapped.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.email?.toLowerCase().includes(term) ||
            p.city?.toLowerCase().includes(term) ||
            p.sport?.toLowerCase().includes(term) ||
            p.bio?.toLowerCase().includes(term) ||
            p.playerIdNumber?.toLowerCase().includes(term)
        );
      }

      players = mapped;
    }

    res.json({
      success: true,
      count: players.length,
      usedCityFallback,
      searchCenter: {
        lat: hasExplicitGps ? parseFloat(lat) : null,
        lng: hasExplicitGps ? parseFloat(lng) : null,
        city: isAllFilter(city) ? "All" : city,
      },
      players,
    });
  } catch (error) {
    console.error("Get players directory error:", error);
    res.status(500).json({ message: error.message || "Failed to search players." });
  }
};

// @desc    Get top athletes leaderboard sorted by rating & wins
// @route   GET /api/players/leaderboard
// @access  Public
export const getPlayerLeaderboard = async (req, res) => {
  try {
    const { sport, city, limit = 20 } = req.query;
    const query = {};

    if (sport && sport !== "All" && sport !== "all") {
      query.sport = new RegExp(sport.trim(), "i");
    }
    if (city && city !== "All" && city !== "all") {
      query.city = new RegExp(city.trim(), "i");
    }

    const profiles = await PlayerProfile.find(query)
      .populate("userId", "name email city role")
      .sort({ rating: -1, matchesWon: -1, matchesPlayed: -1 })
      .limit(parseInt(limit, 10) || 20);

    const leaderboard = profiles
      .filter((p) => p.userId)
      .map((p, idx) => ({
        rank: idx + 1,
        _id: p._id,
        userId: p.userId._id,
        name: p.userId.name,
        sport: p.sport,
        city: p.city,
        skillLevel: p.skillLevel,
        rating: p.rating,
        matchesPlayed: p.matchesPlayed,
        matchesWon: p.matchesWon,
        winRate:
          p.matchesPlayed > 0 ? Math.round((p.matchesWon / p.matchesPlayed) * 100) : 0,
        playerIdNumber: p.playerIdNumber,
        profilePhoto: p.profilePhoto,
        badges: p.badges,
      }));

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch leaderboard." });
  }
};

// @desc    Get individual player profile by ID
// @route   GET /api/players/:id
// @access  Public
export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    let profile = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await PlayerProfile.findOne({
        $or: [{ _id: id }, { userId: id }],
      }).populate("userId", "name email city location role createdAt");
    }

    if (!profile) {
      profile = await PlayerProfile.findOne({ playerIdNumber: id.toUpperCase() }).populate(
        "userId",
        "name email city location role createdAt"
      );
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Athlete not found." });
    }

    res.json({
      success: true,
      player: {
        _id: profile._id,
        userId: profile.userId?._id,
        name: profile.userId?.name,
        email: profile.userId?.email,
        city: profile.city,
        sport: profile.sport,
        secondarySports: profile.secondarySports,
        skillLevel: profile.skillLevel,
        rating: profile.rating,
        profilePhoto: profile.profilePhoto,
        playerIdNumber: profile.playerIdNumber,
        badges: profile.badges,
        bio: profile.bio,
        preferredPlayTime: profile.preferredPlayTime,
        matchesPlayed: profile.matchesPlayed,
        matchesWon: profile.matchesWon,
        joinedDate: profile.joinedDate,
      },
    });
  } catch (error) {
    console.error("Get player by ID error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch athlete." });
  }
};
