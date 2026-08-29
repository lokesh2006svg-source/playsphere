import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile.js";
import User from "../models/User.js";
import { TN_DISTRICT_COORDINATES } from "../constants/tnDistricts.js";

// Export coordinates for all 38 Tamil Nadu districts
export const CITY_COORDINATES = TN_DISTRICT_COORDINATES;

// @desc    Create or update player profile
// @route   POST /api/profile OR PUT /api/profile
// @access  Private
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
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
      coordinates, // [lng, lat]
    } = req.body;

    let profile = await PlayerProfile.findOne({ userId: req.user._id });

    // Determine coordinates based on provided lat/lng or selected city
    let resolvedCoordinates = [80.2707, 13.0827]; // Chennai default
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      resolvedCoordinates = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (city && CITY_COORDINATES[city]) {
      resolvedCoordinates = CITY_COORDINATES[city];
    }

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
      if (profilePhoto) profile.profilePhoto = profilePhoto;
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

    // Update user profile completion status
    await User.findByIdAndUpdate(req.user._id, {
      hasCompletedProfile: true,
      city: profile.city,
    });

    const populatedProfile = await PlayerProfile.findById(profile._id).populate(
      "userId",
      "name email city location role"
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: populatedProfile,
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

    if (mongoose.Types.ObjectId.isValid(userId)) {
      profile = await PlayerProfile.findOne({
        $or: [{ userId: userId }, { _id: userId }],
      }).populate("userId", "name email city createdAt");
    }

    if (!profile) {
      profile = await PlayerProfile.findOne({
        playerIdNumber: new RegExp(`^${userId.trim()}$`, "i"),
      }).populate("userId", "name email city createdAt");
    }

    if (!profile) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    res.json({
      success: true,
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
    let profile = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      profile = await PlayerProfile.findOne({
        $or: [{ userId: userId }, { _id: userId }],
      }).populate("userId", "name city role createdAt");
    }

    if (!profile) {
      profile = await PlayerProfile.findOne({
        playerIdNumber: new RegExp(`^${userId.trim()}$`, "i"),
      }).populate("userId", "name city role createdAt");
    }

    if (!profile) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    res.json({
      success: true,
      profile: {
        userId: profile.userId?._id,
        name: profile.userId?.name,
        city: profile.city,
        sport: profile.sport,
        secondarySports: profile.secondarySports,
        skillLevel: profile.skillLevel,
        rating: profile.rating,
        profilePhoto: profile.profilePhoto,
        playerIdNumber: profile.playerIdNumber,
        bio: profile.bio,
        badges: profile.badges,
        preferredPlayTime: profile.preferredPlayTime,
        matchesPlayed: profile.matchesPlayed,
        matchesWon: profile.matchesWon,
        joinedDate: profile.joinedDate,
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ message: error.message || "Server error fetching public profile." });
  }
};
