import mongoose from "mongoose";

const groundOwnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Business / Organization name is required"],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    managedVenueIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
      },
    ],
    city: {
      type: String,
      default: "Chennai",
    },
    address: {
      type: String,
      default: "",
    },
    gstNumber: {
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

const GroundOwnerProfile = mongoose.model("GroundOwnerProfile", groundOwnerProfileSchema);
export default GroundOwnerProfile;
