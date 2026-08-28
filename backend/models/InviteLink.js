import mongoose from "mongoose";

const inviteLinkSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    sport: {
      type: String,
      default: "All Sports",
    },
    city: {
      type: String,
      default: "Chennai",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

const InviteLink = mongoose.model("InviteLink", inviteLinkSchema);
export default InviteLink;
