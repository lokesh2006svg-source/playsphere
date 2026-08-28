import mongoose from "mongoose";

const tournamentRegistrationSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    seedNumber: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tournamentRegistrationSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });

const TournamentRegistration = mongoose.model("TournamentRegistration", tournamentRegistrationSchema);
export default TournamentRegistration;
