import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      default: "Chennai",
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    venueType: {
      type: String,
      enum: [
        "school_ground",
        "college_ground",
        "public_stadium",
        "private_turf",
        "community_ground",
      ],
      default: "private_turf",
    },
    pricePerHour: {
      type: Number,
      required: true,
      default: 500,
    },
    openingTime: {
      type: String,
      default: "06:00",
    },
    closingTime: {
      type: String,
      default: "22:00",
    },
    photos: [{
      type: String,
    }],
    amenities: [{
      type: String,
    }],
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ownerContact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 24,
    },
    googlePlaceId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

venueSchema.index({ location: "2dsphere" });
venueSchema.index({ name: 1, city: 1 }, { unique: true });

const Venue = mongoose.model("Venue", venueSchema);
export default Venue;
