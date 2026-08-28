import SyncLog from "../models/SyncLog.js";
import Venue from "../models/Venue.js";
import Match from "../models/Match.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import PlayerProfile from "../models/PlayerProfile.js";
import Tournament from "../models/Tournament.js";
import Club from "../models/Club.js";
import OfficialSportBody from "../models/OfficialSportBody.js";
import AuditLog from "../models/AuditLog.js";
import { runDailySync } from "../jobs/dailySync.js";
import { extractVideoId } from "../utils/youtubeHelper.js";
import { recordAuditLog } from "../utils/auditLogger.js";

// Helper coordinates for default Tamil Nadu cities [lng, lat]
const CITY_COORDINATES = {
  Chennai: [80.2707, 13.0827],
  Coimbatore: [76.9558, 11.0168],
  Madurai: [78.1198, 9.9252],
  Trichy: [78.7047, 10.7905],
  Salem: [78.146, 11.6643],
  Tirunelveli: [77.7567, 8.7139],
  Erode: [77.7172, 11.341],
  Vellore: [79.1325, 12.9165],
  Thanjavur: [79.1378, 10.787],
};

// ==========================================
// 1. ADMIN OVERVIEW & STATS
// ==========================================

// @desc    Get high-level admin KPI metrics
// @route   GET /api/admin/overview
// @access  Private (Venue Admin / Super Admin)
export const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVenues,
      totalMatches,
      liveMatches,
      totalBookings,
      totalTournaments,
    ] = await Promise.all([
      User.countDocuments(),
      Venue.countDocuments(),
      Match.countDocuments(),
      Match.countDocuments({ status: "live" }),
      Booking.countDocuments(),
      Tournament.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalVenues,
        totalMatches,
        liveMatches,
        totalBookings,
        totalTournaments,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch admin overview." });
  }
};

// @desc    Get detailed platform-wide statistics (Super Admin Only)
// @route   GET /api/admin/stats
// @access  Private (Super Admin Only)
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      superAdmins,
      venueAdmins,
      regularUsers,
      totalVenues,
      activeVenues,
      totalBookings,
      totalMatches,
      liveMatches,
      totalTournaments,
      totalClubs,
      totalOfficialBodies,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["super_admin", "admin"] } }),
      User.countDocuments({ role: "venue_admin" }),
      User.countDocuments({ role: { $in: ["user", "player"] } }),
      Venue.countDocuments(),
      Venue.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Match.countDocuments(),
      Match.countDocuments({ status: "live" }),
      Tournament.countDocuments(),
      Club.countDocuments(),
      OfficialSportBody.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          superAdmins,
          venueAdmins,
          regularUsers,
        },
        venues: {
          total: totalVenues,
          active: activeVenues,
          inactive: totalVenues - activeVenues,
        },
        matches: {
          total: totalMatches,
          live: liveMatches,
        },
        bookings: {
          total: totalBookings,
        },
        tournaments: {
          total: totalTournaments,
        },
        ecosystem: {
          clubs: totalClubs,
          officialBodies: totalOfficialBodies,
        },
      },
    });
  } catch (error) {
    console.error("Platform stats error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch platform stats." });
  }
};

// ==========================================
// 2. VENUE MANAGEMENT (VENUE ADMIN & SUPER ADMIN)
// ==========================================

// @desc    Get all venues (including inactive) with booking counts
// @route   GET /api/admin/venues
// @access  Private (Venue Admin / Super Admin)
export const getAllAdminVenues = async (req, res) => {
  try {
    const { city, sportType, search } = req.query;
    let filter = {};

    if (city && city !== "All") filter.city = city;
    if (sportType && sportType !== "All") filter.sportType = sportType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const venues = await Venue.find(filter).sort({ createdAt: -1 });

    // Aggregate booking counts per venue
    const venuesWithBookings = await Promise.all(
      venues.map(async (v) => {
        const bookingCount = await Booking.countDocuments({ venueId: v._id });
        return {
          ...v.toObject(),
          bookingCount,
        };
      })
    );

    res.json({
      success: true,
      count: venuesWithBookings.length,
      venues: venuesWithBookings,
    });
  } catch (error) {
    console.error("Admin fetch venues error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch venues." });
  }
};

// @desc    Create a new venue directly
// @route   POST /api/admin/venues
// @access  Private (Venue Admin / Super Admin)
export const createAdminVenue = async (req, res) => {
  try {
    const {
      name,
      sportType,
      city,
      address,
      coordinates,
      lat,
      lng,
      venueType,
      pricePerHour,
      openingTime,
      closingTime,
      photos,
      amenities,
      contactPhone,
      googlePlaceId,
      isActive,
    } = req.body;

    if (!name || !sportType || !address) {
      return res.status(400).json({ message: "Name, sport type, and address are required." });
    }

    const targetCity = city?.trim() || "Chennai";
    const existingVenue = await Venue.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      city: new RegExp(`^${targetCity}$`, "i"),
    });

    if (existingVenue) {
      return res.status(409).json({
        success: false,
        message: `A venue named "${name.trim()}" already exists in ${targetCity}.`,
      });
    }

    let resolvedCoordinates = [80.2707, 13.0827]; // Chennai default
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      resolvedCoordinates = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (lat !== undefined && lng !== undefined) {
      resolvedCoordinates = [Number(lng), Number(lat)];
    } else if (city && CITY_COORDINATES[city]) {
      resolvedCoordinates = CITY_COORDINATES[city];
    }

    const venue = new Venue({
      name: name.trim(),
      sportType: sportType.trim(),
      city: city || "Chennai",
      address: address.trim(),
      location: {
        type: "Point",
        coordinates: resolvedCoordinates,
      },
      venueType: venueType || "private_turf",
      pricePerHour: Number(pricePerHour) || 500,
      openingTime: openingTime || "06:00",
      closingTime: closingTime || "22:00",
      photos: Array.isArray(photos) ? photos : photos ? [photos] : [],
      amenities: Array.isArray(amenities)
        ? amenities
        : typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : ["Floodlights", "Parking", "Dressing Rooms"],
      contactPhone: contactPhone || "+91 98765 43210",
      googlePlaceId: googlePlaceId || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    await venue.save();

    await recordAuditLog({
      req,
      action: "venue_created",
      targetId: venue._id,
      targetCollection: "venues",
      details: { name: venue.name, sportType: venue.sportType, city: venue.city },
    });

    res.status(201).json({
      success: true,
      message: "Venue created successfully.",
      venue,
    });
  } catch (error) {
    console.error("Admin create venue error:", error);
    res.status(500).json({ message: error.message || "Failed to create venue." });
  }
};

// @desc    Edit any venue's full details
// @route   PUT /api/admin/venues/:id
// @access  Private (Venue Admin / Super Admin)
export const updateAdminVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    const {
      name,
      sportType,
      city,
      address,
      coordinates,
      lat,
      lng,
      venueType,
      pricePerHour,
      openingTime,
      closingTime,
      photos,
      amenities,
      contactPhone,
      isActive,
    } = req.body;

    if (name) venue.name = name.trim();
    if (sportType) venue.sportType = sportType.trim();
    if (city) venue.city = city.trim();
    if (address) venue.address = address.trim();
    if (venueType) venue.venueType = venueType;
    if (pricePerHour !== undefined) venue.pricePerHour = Number(pricePerHour);
    if (openingTime) venue.openingTime = openingTime;
    if (closingTime) venue.closingTime = closingTime;
    if (photos) venue.photos = Array.isArray(photos) ? photos : [photos];
    if (amenities) {
      venue.amenities = Array.isArray(amenities)
        ? amenities
        : typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : venue.amenities;
    }
    if (contactPhone) venue.contactPhone = contactPhone;
    if (isActive !== undefined) venue.isActive = Boolean(isActive);

    if (Array.isArray(coordinates) && coordinates.length === 2) {
      venue.location = {
        type: "Point",
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    } else if (lat !== undefined && lng !== undefined) {
      venue.location = {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      };
    }

    await venue.save();

    res.json({
      success: true,
      message: "Venue updated successfully.",
      venue,
    });
  } catch (error) {
    console.error("Admin update venue error:", error);
    res.status(500).json({ message: error.message || "Failed to update venue." });
  }
};

// @desc    Soft delete or deactivate a venue (requires password re-auth if active bookings exist)
// @route   DELETE /api/admin/venues/:id
// @access  Private (Venue Admin / Super Admin)
export const deleteAdminVenue = async (req, res) => {
  try {
    const { adminPassword } = req.body || {};
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    // Check for existing bookings
    const activeBookingsCount = await Booking.countDocuments({
      venueId: venue._id,
      status: { $in: ["confirmed", "pending"] },
    });

    if (activeBookingsCount > 0) {
      if (!adminPassword) {
        return res.status(400).json({
          success: false,
          requiresPassword: true,
          message: `This venue has ${activeBookingsCount} active/confirmed booking(s). Super Admin password confirmation is required.`,
        });
      }

      const adminUser = await User.findById(req.user._id);
      const isPasswordValid = await adminUser.matchPassword(adminPassword);
      if (!isPasswordValid) {
        await recordAuditLog({
          req,
          action: "admin_reauth_failed",
          targetId: venue._id,
          targetCollection: "venues",
          details: { attemptedAction: "deleteAdminVenue", name: venue.name, reason: "Incorrect password" },
          status: "failed",
        });
        return res.status(401).json({
          success: false,
          message: "Re-authentication failed. Incorrect admin password.",
        });
      }
    }

    venue.isActive = false;
    await venue.save();

    await recordAuditLog({
      req,
      action: "venue_deactivated",
      targetId: venue._id,
      targetCollection: "venues",
      details: { name: venue.name, activeBookingsCount, ip: req.ip },
      status: "success",
    });

    res.json({
      success: true,
      message: `Venue ${venue.name} deactivated successfully.`,
      venueId: venue._id,
    });
  } catch (error) {
    console.error("Admin delete venue error:", error);
    res.status(500).json({ message: error.message || "Failed to deactivate venue." });
  }
};

// ==========================================
// 3. MATCH MANAGEMENT (VENUE ADMIN & SUPER ADMIN)
// ==========================================

// @desc    Get all matches with full filters
// @route   GET /api/admin/matches
// @access  Private (Venue Admin / Super Admin)
export const getAllAdminMatches = async (req, res) => {
  try {
    const { sport, status, venueId, search } = req.query;
    let filter = {};

    if (sport && sport !== "All") filter.sport = sport;
    if (status && status !== "All") filter.status = status;
    if (venueId && venueId !== "All") filter.venueId = venueId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { liveStatus: { $regex: search, $options: "i" } },
      ];
    }

    const matches = await Match.find(filter)
      .populate("team1Id", "name city logo sport")
      .populate("team2Id", "name city logo sport")
      .populate("winnerId", "name logo")
      .populate("venueId", "name city address")
      .populate("tournamentId", "name prizePool format")
      .populate("scorerId", "name email")
      .sort({ scheduledTime: -1 });

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Admin fetch matches error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch matches." });
  }
};

// @desc    Create a match fixture directly
// @route   POST /api/admin/matches
// @access  Private (Venue Admin / Super Admin)
export const createAdminMatch = async (req, res) => {
  try {
    const {
      title,
      sport,
      team1Id,
      team2Id,
      venueId,
      scheduledTime,
      tournamentId,
      round,
      status,
      liveStatus,
      liveStreamUrl,
      team1Score,
      team2Score,
      scorerId,
    } = req.body;

    if (!sport || !team1Id || !team2Id) {
      return res.status(400).json({ message: "Sport, Team 1, and Team 2 are required." });
    }

    const targetTime = scheduledTime ? new Date(scheduledTime) : new Date();
    const existingMatch = await Match.findOne({
      sport: new RegExp(`^${sport.trim()}$`, "i"),
      team1Id,
      team2Id,
      scheduledTime: targetTime,
    });

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: "A match fixture between these two teams is already scheduled at this exact time.",
      });
    }

    let videoId = "";
    if (liveStreamUrl) {
      videoId = extractVideoId(liveStreamUrl) || "";
    }

    const match = new Match({
      title: title || `${sport} Match`,
      sport: sport.trim(),
      team1Id,
      team2Id,
      venueId: venueId || null,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
      tournamentId: tournamentId || null,
      round: round ? Number(round) : 1,
      status: status || "scheduled",
      liveStatus: liveStatus || "Upcoming fixture",
      liveStreamUrl: liveStreamUrl || "",
      videoId,
      team1Score: team1Score || "0",
      team2Score: team2Score || "0",
      scorerId: scorerId || req.user._id,
      scoreDetail: {
        team1Detail: {},
        team2Detail: {},
        timeline: [
          {
            time: "00:00",
            text: `Match scheduled between squads.`,
          },
        ],
      },
    });

    await match.save();

    const populatedMatch = await Match.findById(match._id)
      .populate("team1Id", "name city logo")
      .populate("team2Id", "name city logo")
      .populate("venueId", "name city")
      .populate("tournamentId", "name");

    res.status(201).json({
      success: true,
      message: "Match fixture created successfully.",
      match: populatedMatch,
    });
  } catch (error) {
    console.error("Admin create match error:", error);
    res.status(500).json({ message: error.message || "Failed to create match fixture." });
  }
};

// @desc    Edit any match's full details
// @route   PUT /api/admin/matches/:id
// @access  Private (Venue Admin / Super Admin)
export const updateAdminMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match fixture not found." });
    }

    const {
      title,
      sport,
      team1Id,
      team2Id,
      venueId,
      scheduledTime,
      status,
      liveStatus,
      liveStreamUrl,
      team1Score,
      team2Score,
      winnerId,
      scorerId,
      commentary,
    } = req.body;

    if (title) match.title = title.trim();
    if (sport) match.sport = sport.trim();
    if (team1Id) match.team1Id = team1Id;
    if (team2Id) match.team2Id = team2Id;
    if (venueId !== undefined) match.venueId = venueId || null;
    if (scheduledTime) match.scheduledTime = new Date(scheduledTime);
    if (status) match.status = status;
    if (liveStatus !== undefined) match.liveStatus = liveStatus;
    if (team1Score !== undefined) match.team1Score = String(team1Score);
    if (team2Score !== undefined) match.team2Score = String(team2Score);
    if (winnerId !== undefined) match.winnerId = winnerId || null;
    if (scorerId !== undefined) match.scorerId = scorerId || null;

    if (liveStreamUrl !== undefined) {
      match.liveStreamUrl = liveStreamUrl.trim();
      match.videoId = extractVideoId(liveStreamUrl) || "";
    }

    if (commentary) {
      if (!match.scoreDetail) match.scoreDetail = { timeline: [] };
      if (!match.scoreDetail.timeline) match.scoreDetail.timeline = [];
      match.scoreDetail.timeline.push({
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: commentary.trim(),
      });
    }

    await match.save();

    // Broadcast live update over Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`match_${match._id}`).emit("scoreUpdate", {
        matchId: match._id.toString(),
        team1Score: match.team1Score,
        team2Score: match.team2Score,
        liveStatus: match.liveStatus,
        status: match.status,
        scoreDetail: match.scoreDetail,
        winnerId: match.winnerId,
      });
    }

    const populatedMatch = await Match.findById(match._id)
      .populate("team1Id", "name city logo")
      .populate("team2Id", "name city logo")
      .populate("winnerId", "name logo")
      .populate("venueId", "name city")
      .populate("tournamentId", "name")
      .populate("scorerId", "name email");

    res.json({
      success: true,
      message: "Match details updated successfully.",
      match: populatedMatch,
    });
  } catch (error) {
    console.error("Admin update match error:", error);
    res.status(500).json({ message: error.message || "Failed to update match fixture." });
  }
};

// @desc    Delete a match fixture
// @route   DELETE /api/admin/matches/:id
// @access  Private (Venue Admin / Super Admin)
export const deleteAdminMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    await recordAuditLog({
      req,
      action: "match_deleted",
      targetId: req.params.id,
      targetCollection: "matches",
      details: { title: match.title, sport: match.sport },
    });

    res.json({
      success: true,
      message: "Match fixture removed successfully.",
      matchId: req.params.id,
    });
  } catch (error) {
    console.error("Admin delete match error:", error);
    res.status(500).json({ message: error.message || "Failed to remove match fixture." });
  }
};

// @desc    Check YouTube stream link health & broken links
// @route   GET /api/admin/broken-links
// @access  Private (Venue Admin / Super Admin)
export const getStreamLinksHealth = async (req, res) => {
  try {
    const matchesWithStreams = await Match.find({
      $or: [
        { liveStreamUrl: { $exists: true, $ne: "" } },
        { status: "live" },
      ],
    })
      .populate("team1Id", "name")
      .populate("team2Id", "name")
      .populate("venueId", "name city")
      .sort({ scheduledTime: -1 });

    const analyzedMatches = matchesWithStreams.map((m) => {
      const hasUrl = !!m.liveStreamUrl;
      const validId = extractVideoId(m.liveStreamUrl);
      const isBroken = hasUrl && !validId;
      const isLiveWithoutUrl = m.status === "live" && !hasUrl;

      return {
        _id: m._id,
        title: m.title,
        sport: m.sport,
        teams: `${m.team1Id?.name || "Team 1"} vs ${m.team2Id?.name || "Team 2"}`,
        venue: m.venueId?.name || "Open Field",
        status: m.status,
        liveStreamUrl: m.liveStreamUrl || "",
        videoId: m.videoId || validId || "",
        isBroken,
        isLiveWithoutUrl,
        healthStatus: isBroken
          ? "broken"
          : isLiveWithoutUrl
          ? "missing_live_url"
          : validId
          ? "healthy"
          : "no_stream",
      };
    });

    res.json({
      success: true,
      count: analyzedMatches.length,
      streams: analyzedMatches,
    });
  } catch (error) {
    console.error("Stream links health error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze stream links." });
  }
};

// ==========================================
// 4. USER & ROLE MANAGEMENT (SUPER ADMIN ONLY)
// ==========================================

// @desc    List all users with roles (Super Admin Only)
// @route   GET /api/admin/users
// @access  Private (Super Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};

    if (role && role !== "All") filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // Attach player profile information if available
    const usersWithProfiles = await Promise.all(
      users.map(async (u) => {
        const profile = await PlayerProfile.findOne({ userId: u._id }).select(
          "sport secondarySports skillLevel rating playerIdNumber matchesPlayed profilePhoto badges bio city"
        );
        return {
          ...u.toObject(),
          hasCompletedProfile: !!(u.hasCompletedProfile || profile),
          profile: profile || null,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithProfiles.length,
      users: usersWithProfiles,
    });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch users." });
  }
};

// @desc    Promote or change user role (Super Admin Only - Requires Password Confirmation)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin Only)
export const updateUserRole = async (req, res) => {
  try {
    const { role, adminPassword } = req.body;
    const allowedRoles = ["user", "player", "venue_admin", "organizer", "admin", "super_admin"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    // Require super admin password confirmation for role modification
    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        requiresPassword: true,
        message: "Super Admin password confirmation is required to modify user roles.",
      });
    }

    const adminUser = await User.findById(req.user._id);
    const isPasswordValid = await adminUser.matchPassword(adminPassword);
    if (!isPasswordValid) {
      await recordAuditLog({
        req,
        action: "admin_reauth_failed",
        targetId: req.params.id,
        targetCollection: "users",
        details: { attemptedAction: "updateUserRole", targetRole: role, reason: "Incorrect password" },
        status: "failed",
      });
      return res.status(401).json({
        success: false,
        message: "Re-authentication failed. Incorrect Super Admin password.",
      });
    }

    // Protect super admin from accidentally demoting themselves
    if (
      req.user._id.toString() === req.params.id &&
      role !== "super_admin" &&
      req.user.role === "super_admin"
    ) {
      return res.status(400).json({
        message: "You cannot remove your own Super Admin privileges.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await recordAuditLog({
      req,
      action: "role_change",
      targetId: user._id,
      targetCollection: "users",
      details: { targetName: user.name, targetEmail: user.email, newRole: role, ip: req.ip },
      status: "success",
    });

    res.json({
      success: true,
      message: `User ${user.name} role updated to ${role}.`,
      user,
    });
  } catch (error) {
    console.error("Admin role update error:", error);
    res.status(500).json({ message: error.message || "Failed to update user role." });
  }
};

// @desc    Delete user account (Super Admin Only - Requires Password Confirmation)
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin Only)
export const deleteUser = async (req, res) => {
  try {
    const { adminPassword } = req.body || {};

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        requiresPassword: true,
        message: "Super Admin password confirmation is required to delete a user account.",
      });
    }

    const adminUser = await User.findById(req.user._id);
    const isPasswordValid = await adminUser.matchPassword(adminPassword);
    if (!isPasswordValid) {
      await recordAuditLog({
        req,
        action: "admin_reauth_failed",
        targetId: req.params.id,
        targetCollection: "users",
        details: { attemptedAction: "deleteUser", reason: "Incorrect password" },
        status: "failed",
      });
      return res.status(401).json({
        success: false,
        message: "Re-authentication failed. Incorrect Super Admin password.",
      });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own Super Admin account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await PlayerProfile.findOneAndDelete({ userId: req.params.id });

    await recordAuditLog({
      req,
      action: "user_deleted",
      targetId: req.params.id,
      targetCollection: "users",
      details: { name: user.name, email: user.email, ip: req.ip },
      status: "success",
    });

    res.json({
      success: true,
      message: `User ${user.name} removed from platform.`,
      userId: req.params.id,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: error.message || "Failed to delete user." });
  }
};

// ==========================================
// 5. DAILY SYNC ROUTINES
// ==========================================

// @desc    Get latest daily sync status
// @route   GET /api/admin/sync-status
// @access  Public / Private
export const getSyncStatus = async (req, res) => {
  try {
    const latestLog = await SyncLog.findOne().sort({ executedAt: -1 });
    const logs = await SyncLog.find().sort({ executedAt: -1 }).limit(10);

    res.json({
      success: true,
      latestSync: latestLog || {
        status: "pending_initial_run",
        executedAt: null,
        details: { message: "No sync executed yet." },
      },
      recentLogs: logs,
    });
  } catch (error) {
    console.error("Get sync status error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve sync status." });
  }
};

// @desc    Manually trigger daily sync routine
// @route   POST /api/admin/trigger-sync
// @access  Private (Venue Admin / Super Admin)
export const triggerManualSync = async (req, res) => {
  try {
    const log = await runDailySync();

    res.json({
      success: true,
      message: "Daily sync routine triggered and completed.",
      log,
    });
  } catch (error) {
    console.error("Trigger sync error:", error);
    res.status(500).json({ message: error.message || "Failed to trigger sync." });
  }
};

// @desc    Get audit logs for sensitive admin actions (Super Admin Only)
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin Only)
export const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const { action, targetCollection, search } = req.query;

    let filter = {};
    if (action && action !== "All") filter.action = action;
    if (targetCollection && targetCollection !== "All") filter.targetCollection = targetCollection;
    if (search) {
      filter.$or = [
        { "details.name": { $regex: search, $options: "i" } },
        { "details.email": { $regex: search, $options: "i" } },
        { "details.targetEmail": { $regex: search, $options: "i" } },
        { "details.reason": { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs." });
  }
};
