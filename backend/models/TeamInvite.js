import mongoose from "mongoose";

const teamInviteSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    invitedEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["player", "vice-captain", "substitute"],
      default: "player",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

teamInviteSchema.index({ teamId: 1, invitedUserId: 1 });
teamInviteSchema.index({ teamId: 1, invitedEmail: 1 });

const TeamInvite = mongoose.model("TeamInvite", teamInviteSchema);
export default TeamInvite;
