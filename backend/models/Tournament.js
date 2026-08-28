import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      enum: ["knockout", "round_robin"],
      default: "knockout",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
    },
    city: {
      type: String,
      default: "Chennai",
    },
    maxTeams: {
      type: Number,
      default: 8,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    officialBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficialSportBody",
      default: null,
    },
    status: {
      type: String,
      enum: ["upcoming", "registration_open", "ongoing", "completed", "cancelled"],
      default: "registration_open",
    },
    prizePool: {
      type: String,
      default: "₹25,000 + Trophy",
    },
    entryFee: {
      type: Number,
      default: 1000,
    },
    rules: [{
      type: String,
    }],
    bannerUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

tournamentSchema.index({ name: 1, city: 1, sport: 1 }, { unique: true });

const Tournament = mongoose.model("Tournament", tournamentSchema);
export default Tournament;
