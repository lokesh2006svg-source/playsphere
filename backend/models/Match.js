import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },
    sport: {
      type: String,
      default: "Cricket",
    },
    team1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    team2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    round: {
      type: Number, // 1: Round 1 / Quarterfinal, 2: Semifinal, 3: Final
      default: 1,
    },
    matchOrder: {
      type: Number,
      default: 1,
    },
    team1Score: {
      type: String,
      default: "0",
    },
    team2Score: {
      type: String,
      default: "0",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    scheduledTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    liveStatus: {
      type: String,
      default: "Match Scheduled",
    },
    scoreDetail: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        timeline: [],
        highlights: [],
        currentPeriod: "1st Half",
      }),
    },
    scorerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    liveStreamUrl: {
      type: String,
      default: "",
    },
    videoId: {
      type: String,
      default: "",
    },
    officialBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficialSportBody",
      default: null,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      default: null,
    },
    matchLevel: {
      type: String,
      enum: ["district", "state", "club", "community"],
      default: "community",
    },
    title: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
