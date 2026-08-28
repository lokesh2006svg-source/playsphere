import mongoose from "mongoose";

const gameRuleSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Team Sport",
    },
    summary: {
      type: String,
      required: true,
    },
    keyRules: [{
      type: String,
      required: true,
    }],
    playerCount: {
      type: String,
      required: true,
      default: "11 players per team",
    },
    duration: {
      type: String,
      required: true,
      default: "90 minutes (two 45-min halves)",
    },
    courtDimensions: {
      type: String,
      default: "Standard international dimensions",
    },
    scoringSystem: {
      type: String,
      default: "Standard point system",
    },
    officialSourceName: {
      type: String,
      required: true,
      default: "Official International Federation Rulebook 2026",
    },
    officialSourceUrl: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GameRule = mongoose.model("GameRule", gameRuleSchema);
export default GameRule;
