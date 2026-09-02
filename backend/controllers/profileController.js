import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile.js";
import CoachProfile from "../models/CoachProfile.js";
import GroundOwnerProfile from "../models/GroundOwnerProfile.js";
import Team from "../models/Team.js";
import Venue from "../models/Venue.js";
import User from "../models/User.js";
import { TN_DISTRICT_COORDINATES } from "../constants/tnDistricts.js";
import { fetchProfileForUser } from "./authController.js";

// Export coordinates for all 38 Tamil Nadu districts
export const CITY_COORDINATES = TN_DISTRICT_COORDINATES;

// @desc    Create or update player profile
// @route   POST /api/profile OR PUT /api/profile
// @access  Private
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      name,
      sport,
      secondarySports,
      skillLevel,
      city,
      rating,
      bio,
      phone,
      preferredPlayTime,
      profilePhoto,
      badges,
      businessName,
      contactPhone,
      yearsOfExperience,
      certifications,
      coordinates, // [lng, lat]
    } = req.body;

    const userRole = req.user.role || "player";
    let profile = null;

    // Determine coordinates based on provided lat/lng or selected city
    let resolvedCoordinates = [80.2707, 13.0827]; // Chennai default
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      resolvedCoordinates = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (city && CITY_COORDINATES[city]) {
      resolvedCoordinates = CITY_COORDINATES[city];
    }

    if (userRole === "ground_owner") {
      profile = await GroundOwnerProfile.findOne({ userId: req.user._id });
      if (profile) {
        if (businessName || name) profile.businessName = (businessName || name).trim();
        if (contactPhone || phone) profile.contactPhone = (contactPhone || phone).trim();
        if (city) profile.city = city;
        await profile.save();
      } else {
        profile = await GroundOwnerProfile.create({
          userId: req.user._id,
          businessName: (businessName || name || `${req.user.name}'s Sports Venue`).trim(),
          contactPhone: (contactPhone || phone || "+91 98765 43210").trim(),
          city: city || req.user.city || "Chennai",
        });
      }
    } else if (userRole === "coach") {
      profile = await CoachProfile.findOne({ userId: req.user._id });
      if (profile) {
        if (sport) profile.sport = sport;
        if (yearsOfExperience !== undefined) profile.yearsOfExperience = Number(yearsOfExperience);
        if (city) profile.city = city;
        if (phone) profile.phone = phone;
        if (bio !== undefined) profile.bio = bio;
        if (certifications) profile.certifications = Array.isArray(certifications) ? certifications : [certifications];
        await profile.save();
      } else {
        profile = await CoachProfile.create({
          userId: req.user._id,
          sport: sport || "Cricket",
          yearsOfExperience: Number(yearsOfExperience) || 0,
          city: city || req.user.city || "Chennai",
          phone: phone || "",
          bio: bio || "",
          certifications: certifications ? (Array.isArray(certifications) ? certifications : [certifications]) : [],
        });
      }
    } else {
      profile = await PlayerProfile.findOne({ userId: req.user._id });
      if (profile) {
        // Update existing
        if (sport) profile.sport = sport;
        if (secondarySports) profile.secondarySports = secondarySports;
        if (skillLevel) profile.skillLevel = skillLevel;
        if (city) profile.city = city;
        if (rating !== undefined) profile.rating = rating;
        if (bio !== undefined) profile.bio = bio;
        if (phone !== undefined) profile.phone = phone;
        if (preferredPlayTime) profile.preferredPlayTime = preferredPlayTime;
        if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
        if (badges) profile.badges = badges;

        profile.location = {
          type: "Point",
          coordinates: resolvedCoordinates,
        };

        await profile.save();
      } else {
        // Create new profile
        profile = new PlayerProfile({
          userId: req.user._id,
          sport: sport || "Cricket",
          secondarySports: secondarySports || [],
          skillLevel: skillLevel || "intermediate",
          rating: rating !== undefined ? rating : 3.5,
          city: city || req.user.city || "Chennai",
          location: {
            type: "Point",
            coordinates: resolvedCoordinates,
          },
          profilePhoto: profilePhoto || "",
          bio: bio || "",
          phone: phone || "",
          preferredPlayTime: preferredPlayTime || "Evenings (5 PM - 8 PM)",
          badges: badges || ["Verified Athlete", "Early Adopter"],
        });

        await profile.save();
      }
    }

    // Update user profile completion status & name if provided
    const userUpdates = {
      hasCompletedProfile: true,
      city: profile.city || city || req.user.city,
    };
    if (name && typeof name === "string" && name.trim()) {
      userUpdates.name = name.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, {
      returnDocument: "after",
    });

    // Emit real-time playerUpdated event for live player directory sync
    try {
      const io = req.app?.get("io");
      if (io) {
        io.emit("playerUpdated", {
          userId: req.user._id,
          name: updatedUser?.name,
          sport: profile?.sport,
          city: profile?.city,
          role: req.user.role,
        });
      }
    } catch (err) {
      console.warn("Socket emit error:", err.message);
    }

    // Fetch fully enriched profile based on role
    const fullProfile = await fetchProfileForUser(req.user._id, req.user.role);

    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: fullProfile || profile,
      roleProfile: fullProfile || profile,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Save profile error:", error);
    res.status(500).json({ message: error.message || "Server error saving profile." });
  }
};

// @desc    Get profile by user ID or Player ID
// @route   GET /api/profile/:userId
// @access  Private
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      profile = await PlayerProfile.findOne({
        $or: [{ userId: userId }, { _id: userId }],
      }).populate("userId", "name email city location role createdAt");
    }

    if (!profile) {
      profile = await PlayerProfile.findOne({
        playerIdNumber: new RegExp(`^${userId.trim()}$`, "i"),
      }).populate("userId", "name email city location role createdAt");
    }

    if (!profile) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message || "Server error fetching profile." });
  }
};

// @desc    Update player GPS coordinates and city
// @route   PUT /api/profile/location
// @access  Private
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng, city } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Latitude and Longitude are required." });
    }

    let profile = await PlayerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    profile.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON format: [lng, lat]
    };

    if (city) {
      profile.city = city;
      await User.findByIdAndUpdate(req.user._id, { city });
    }

    await profile.save();

    res.json({
      success: true,
      message: "Location updated successfully.",
      location: profile.location,
      city: profile.city,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: error.message || "Server error updating location." });
  }
};

// @desc    Upload or update profile photo
// @route   POST /api/profile/photo
// @access  Private
export const updatePhoto = async (req, res) => {
  try {
    let newPhotoUrl = "";

    if (req.file) {
      newPhotoUrl = `/uploads/profiles/${req.file.filename}`;
    } else if (req.body.photoUrl) {
      newPhotoUrl = req.body.photoUrl;
    } else {
      return res.status(400).json({ message: "No image file or photo URL provided." });
    }

    let profile = await PlayerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Create empty profile if not existing yet
      profile = new PlayerProfile({
        userId: req.user._id,
        city: req.user.city || "Chennai",
        sport: "Cricket",
        location: { type: "Point", coordinates: [80.2707, 13.0827] },
      });
    }

    // If previous photo was a local upload under /uploads/, delete the old file to prevent storage buildup
    if (profile.profilePhoto && profile.profilePhoto.startsWith("/uploads/")) {
      try {
        const oldPath = path.join(process.cwd(), profile.profilePhoto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.warn("Could not delete old profile photo:", err.message);
      }
    }

    profile.profilePhoto = newPhotoUrl;
    await profile.save();

    // Also update User model profilePhoto if field exists
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: newPhotoUrl });

    const populatedProfile = await PlayerProfile.findById(profile._id).populate(
      "userId",
      "name email city location role"
    );

    res.json({
      success: true,
      message: "Profile photo updated successfully.",
      profilePhoto: profile.profilePhoto,
      profile: populatedProfile,
    });
  } catch (error) {
    console.error("Update photo error:", error);
    res.status(500).json({ message: error.message || "Server error updating photo." });
  }
};

// @desc    Delete / Remove profile photo
// @route   DELETE /api/profile/photo
// @access  Private
export const deletePhoto = async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // Delete local file from disk if present
    if (profile.profilePhoto && profile.profilePhoto.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), profile.profilePhoto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("Could not delete profile photo from disk:", err.message);
      }
    }

    profile.profilePhoto = "";
    await profile.save();

    await User.findByIdAndUpdate(req.user._id, { profilePhoto: "" });

    const populatedProfile = await PlayerProfile.findById(profile._id).populate(
      "userId",
      "name email city location role"
    );

    res.json({
      success: true,
      message: "Profile photo removed successfully.",
      profilePhoto: "",
      profile: populatedProfile,
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ message: error.message || "Server error deleting photo." });
  }
};

// @desc    Get Digital Sports ID Card data
// @route   GET /api/profile/:userId/card
// @access  Private
export const getPlayerCard = async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = null;
    let targetUser = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      targetUser = await User.findById(userId);
      profile = await PlayerProfile.findOne({
        $or: [{ userId: userId }, { _id: userId }],
      }).populate("userId", "name email city createdAt role");
    }

    if (!profile) {
      profile = await PlayerProfile.findOne({
        playerIdNumber: new RegExp(`^${userId.trim()}$`, "i"),
      }).populate("userId", "name email city createdAt role");
    }

    if (!profile && (targetUser || mongoose.Types.ObjectId.isValid(userId))) {
      const uId = targetUser ? targetUser._id : userId;
      // Check if Coach
      const coach = await CoachProfile.findOne({ userId: uId }).populate("userId", "name email city createdAt role");
      if (coach || targetUser?.role === "coach") {
        return res.json({
          success: true,
          role: "coach",
          card: {
            playerIdNumber: "PS-COACH",
            name: coach?.userId?.name || targetUser?.name || "Coach",
            sport: coach?.sport || "Multi-Sport",
            secondarySports: [],
            skillLevel: `Certified Coach (${coach?.yearsOfExperience || 0} yrs exp)`,
            rating: 5.0,
            city: coach?.city || targetUser?.city || "Chennai",
            profilePhoto: "",
            joinedDate: coach?.createdAt || targetUser?.createdAt || Date.now(),
            badges: coach?.certifications?.length > 0 ? coach.certifications : ["Certified Coach", "Official Trainer"],
            matchesPlayed: 0,
            matchesWon: 0,
            qrData: `PLAYSPHERE-COACH:${uId}`,
          },
        });
      }

      // Check if Ground Owner
      const groundOwner = await GroundOwnerProfile.findOne({ userId: uId }).populate("userId", "name email city createdAt role");
      if (groundOwner || targetUser?.role === "ground_owner") {
        return res.json({
          success: true,
          role: "ground_owner",
          card: {
            playerIdNumber: "PS-VENUE-OWNER",
            name: groundOwner?.businessName || targetUser?.name || "Ground Owner",
            sport: "Facility Management",
            secondarySports: [],
            skillLevel: "Verified Venue Partner",
            rating: 5.0,
            city: groundOwner?.city || targetUser?.city || "Chennai",
            profilePhoto: "",
            joinedDate: groundOwner?.createdAt || targetUser?.createdAt || Date.now(),
            badges: ["Verified Turf Owner", "Venue Partner"],
            matchesPlayed: 0,
            matchesWon: 0,
            qrData: `PLAYSPHERE-VENUE-OWNER:${uId}`,
          },
        });
      }
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.json({
      success: true,
      role: "player",
      card: {
        playerIdNumber: profile.playerIdNumber,
        name: profile.userId?.name || "Player",
        sport: profile.sport,
        secondarySports: profile.secondarySports,
        skillLevel: profile.skillLevel,
        rating: profile.rating,
        city: profile.city,
        profilePhoto: profile.profilePhoto,
        joinedDate: profile.joinedDate,
        badges: profile.badges,
        matchesPlayed: profile.matchesPlayed,
        matchesWon: profile.matchesWon,
        qrData: `PLAYSPHERE-PLAYER-ID:${profile.playerIdNumber}`,
      },
    });
  } catch (error) {
    console.error("Get card error:", error);
    res.status(500).json({ message: error.message || "Server error fetching card." });
  }
};

// @desc    Get Public Profile (No auth required, excludes email & sensitive info)
// @route   GET /api/profile/public/:userId
// @access  Public
export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let targetUser = null;
    let targetId = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      targetId = userId;
      targetUser = await User.findById(userId).select("name city role createdAt");
    }

    // 1. Check Player Profile by Player ID Number or User/Doc ID
    let playerProfile = null;
    if (targetId) {
      playerProfile = await PlayerProfile.findOne({
        $or: [{ userId: targetId }, { _id: targetId }],
      }).populate("userId", "name city role createdAt");
    }
    if (!playerProfile) {
      playerProfile = await PlayerProfile.findOne({
        playerIdNumber: new RegExp(`^${userId.trim()}$`, "i"),
      }).populate("userId", "name city role createdAt");
    }

    if (playerProfile) {
      return res.json({
        success: true,
        role: "player",
        profile: {
          userId: playerProfile.userId?._id,
          name: playerProfile.userId?.name,
          city: playerProfile.city,
          sport: playerProfile.sport,
          secondarySports: playerProfile.secondarySports,
          skillLevel: playerProfile.skillLevel,
          rating: playerProfile.rating,
          profilePhoto: playerProfile.profilePhoto,
          playerIdNumber: playerProfile.playerIdNumber,
          bio: playerProfile.bio,
          badges: playerProfile.badges,
          preferredPlayTime: playerProfile.preferredPlayTime,
          matchesPlayed: playerProfile.matchesPlayed,
          matchesWon: playerProfile.matchesWon,
          joinedDate: playerProfile.joinedDate,
        },
      });
    }

    // 2. Check Coach Profile
    if (targetId || targetUser?.role === "coach") {
      const coach = await CoachProfile.findOne({
        $or: [{ userId: targetId }, { _id: targetId }],
      }).populate("userId", "name city role createdAt");

      if (coach || targetUser?.role === "coach") {
        const coachUserId = coach?.userId?._id || targetId;
        // Fetch squads managed by this coach
        const managedTeams = await Team.find({ coachId: coachUserId })
          .select("name sport city logo members count")
          .limit(6);

        return res.json({
          success: true,
          role: "coach",
          profile: {
            userId: coachUserId,
            name: coach?.userId?.name || targetUser?.name || "Certified Coach",
            city: coach?.city || targetUser?.city || "Chennai",
            sport: coach?.sport || "Multi-Sport",
            yearsOfExperience: coach?.yearsOfExperience || 5,
            certifications: coach?.certifications?.length > 0 ? coach.certifications : ["BCCI Level-2", "NIS Certified Coach"],
            skillLevel: `Certified Coach (${coach?.yearsOfExperience || 5}+ yrs exp)`,
            rating: 4.9,
            profilePhoto: "",
            playerIdNumber: "PS-COACH",
            bio: coach?.bio || "Certified sports coach dedicated to talent development and tactical team training in Tamil Nadu.",
            badges: coach?.certifications?.length > 0 ? coach.certifications : ["Certified Coach", "Official Trainer", "State License"],
            phone: coach?.phone || "",
            managedTeams: managedTeams.map((t) => ({
              _id: t._id,
              name: t.name,
              sport: t.sport,
              city: t.city,
              logo: t.logo,
              memberCount: t.members?.length || 0,
            })),
            joinedDate: coach?.createdAt || targetUser?.createdAt,
          },
        });
      }
    }

    // 3. Check Ground Owner Profile
    if (targetId || targetUser?.role === "ground_owner") {
      const groundOwner = await GroundOwnerProfile.findOne({
        $or: [{ userId: targetId }, { _id: targetId }],
      }).populate("userId", "name city role createdAt");

      if (groundOwner || targetUser?.role === "ground_owner") {
        const ownerUserId = groundOwner?.userId?._id || targetId;
        // Fetch turfs and venues managed by this owner
        const managedVenues = await Venue.find({
          $or: [{ ownerId: ownerUserId }, { _id: { $in: groundOwner?.managedVenueIds || [] } }],
          isActive: true,
        }).select("name sportType city address pricePerHour photos amenities rating reviewCount");

        return res.json({
          success: true,
          role: "ground_owner",
          profile: {
            userId: ownerUserId,
            name: groundOwner?.businessName || targetUser?.name || "Sports Arena & Turf",
            ownerName: groundOwner?.userId?.name || targetUser?.name,
            city: groundOwner?.city || targetUser?.city || "Chennai",
            address: groundOwner?.address || `${groundOwner?.city || "Chennai"}, Tamil Nadu`,
            sport: "Multi-Sport Arena & Turf",
            skillLevel: "Verified Turf Partner",
            rating: 4.9,
            profilePhoto: "",
            playerIdNumber: "PS-VENUE-OWNER",
            bio: "Registered sports facility owner providing premium synthetic turf, floodlight grounds, and seamless real-time court bookings.",
            badges: ["Verified Turf Partner", "Official Venue Host", "Real-Time Booking"],
            contactPhone: groundOwner?.contactPhone || "+91 98401 23456",
            managedVenues: managedVenues.map((v) => ({
              _id: v._id,
              name: v.name,
              sportType: v.sportType,
              city: v.city,
              address: v.address,
              pricePerHour: v.pricePerHour,
              photos: v.photos || [],
              amenities: v.amenities || [],
              rating: v.rating || 4.8,
            })),
            joinedDate: groundOwner?.createdAt || targetUser?.createdAt,
          },
        });
      }
    }

    return res.status(404).json({ message: "Sports profile not found or ID is invalid." });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: error.message || "Server error fetching public profile." });
  }
};
