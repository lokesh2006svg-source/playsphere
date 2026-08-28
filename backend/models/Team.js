import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      required: true,
    },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["captain", "vice-captain", "player", "substitute"],
          default: "player",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    city: {
      type: String,
      default: "Chennai",
    },
    logo: {
      type: String,
      default: "",
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      matchesLost: { type: Number, default: 0 },
      tournamentsWon: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ name: 1, city: 1, sport: 1 }, { unique: true });

const Team = mongoose.model("Team", teamSchema);
export default Team;
