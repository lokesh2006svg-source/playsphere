import mongoose from "mongoose";

const syncLogSchema = new mongoose.Schema(
  {
    syncType: {
      type: String,
      default: "daily_sync",
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "success",
    },
    details: {
      staleMatchesClosed: { type: Number, default: 0 },
      todayMatchesRefreshed: { type: Number, default: 0 },
      nextMatchCalculated: { type: String, default: "" },
      message: { type: String, default: "" },
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SyncLog = mongoose.model("SyncLog", syncLogSchema);
export default SyncLog;
