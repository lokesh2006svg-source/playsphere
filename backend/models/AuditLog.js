import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      default: "System / Anonymous",
    },
    userEmail: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: null,
      index: true,
    },
    targetCollection: {
      type: String,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
    status: {
      type: String,
      enum: ["success", "failed", "blocked", "rejected"],
      default: "success",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
