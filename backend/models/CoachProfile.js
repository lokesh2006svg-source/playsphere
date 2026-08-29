import mongoose from "mongoose";

const coachProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    sport: {
      type: String,
      required: [true, "Primary sport is required"],
      default: "Cricket",
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    managedTeamIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    certifications: [
      {
        type: String,
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Chennai",
    },
    phone: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CoachProfile = mongoose.model("CoachProfile", coachProfileSchema);
export default CoachProfile;
