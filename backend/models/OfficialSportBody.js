import mongoose from "mongoose";

const officialSportBodySchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["state", "district"],
      required: true,
      default: "state",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: true,
      default: "Chennai",
    },
    parentBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficialSportBody",
      default: null,
    },
    website: {
      type: String,
      default: "",
    },
    youtubeChannel: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    affiliation: {
      type: String,
      default: "",
    },
    foundedYear: {
      type: Number,
      default: 1950,
    },
    description: {
      type: String,
      default: "",
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
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

officialSportBodySchema.index({ name: 1, sport: 1 }, { unique: true });

const OfficialSportBody = mongoose.model("OfficialSportBody", officialSportBodySchema);
export default OfficialSportBody;
