import mongoose from "mongoose";

const playerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    sport: {
      type: String,
      required: true,
      default: "Cricket",
    },
    secondarySports: [{
      type: String,
    }],
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "pro"],
      default: "intermediate",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      // [longitude, latitude] in GeoJSON format
      coordinates: {
        type: [Number],
        default: [80.2707, 13.0827], // Default Chennai coords [lng, lat]
      },
    },
    city: {
      type: String,
      default: "Chennai",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    playerIdNumber: {
      type: String,
      unique: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    badges: [{
      type: String,
    }],
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    preferredPlayTime: {
      type: String,
      default: "Evenings (5 PM - 8 PM)",
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    matchesWon: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial proximity search
playerProfileSchema.index({ location: "2dsphere" });

// Helper to generate player ID like PS-2026-00001
playerProfileSchema.pre("save", async function () {
  if (!this.playerIdNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("PlayerProfile").countDocuments();
    const sequence = String(count + 1).padStart(5, "0");
    this.playerIdNumber = `PS-${year}-${sequence}`;
  }
});

const PlayerProfile = mongoose.model("PlayerProfile", playerProfileSchema);
export default PlayerProfile;
