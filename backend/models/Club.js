import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
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
    city: {
      type: String,
      required: true,
      default: "Chennai",
    },
    districtBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficialSportBody",
      default: null,
    },
    stateBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficialSportBody",
      default: null,
    },
    homeGround: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    foundedYear: {
      type: Number,
      default: 2010,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    memberCount: {
      type: Number,
      default: 25,
    },
  },
  {
    timestamps: true,
  }
);

clubSchema.index({ name: 1, city: 1, sport: 1 }, { unique: true });

const Club = mongoose.model("Club", clubSchema);
export default Club;
