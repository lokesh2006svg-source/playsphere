import cron from "node-cron";
import Match from "../models/Match.js";
import SyncLog from "../models/SyncLog.js";

/**
 * Core daily synchronization routine.
 * 1. Auto-completes stale scheduled matches that have passed without being updated.
 * 2. Refreshes today's active match cache.
 * 3. Identifies the next upcoming featured match.
 */
export const runDailySync = async () => {
  console.log(`[DailySync] Starting PlaySphere Daily Sync routine at ${new Date().toISOString()}...`);

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. Auto-complete stale matches that were scheduled yesterday or earlier and were never started
    const staleResult = await Match.updateMany(
      {
        status: "scheduled",
        scheduledTime: { $lt: yesterday },
      },
      {
        status: "completed",
        liveStatus: "Match Concluded (Auto-closed)",
      }
    );

    // 2. Count today's matches
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayMatchesCount = await Match.countDocuments({
      scheduledTime: { $gte: startOfToday, $lte: endOfToday },
    });

    // 3. Find next upcoming match
    const nextMatch = await Match.findOne({
      status: "scheduled",
      scheduledTime: { $gte: new Date() },
    })
      .populate("team1Id", "name")
      .populate("team2Id", "name")
      .sort({ scheduledTime: 1 });

    const nextMatchSummary = nextMatch
      ? `${nextMatch.team1Id?.name} vs ${nextMatch.team2Id?.name} at ${nextMatch.scheduledTime}`
      : "No upcoming matches scheduled";

    // 4. Save to SyncLog
    const log = await SyncLog.create({
      syncType: "daily_sync",
      status: "success",
      details: {
        staleMatchesClosed: staleResult.modifiedCount || 0,
        todayMatchesRefreshed: todayMatchesCount,
        nextMatchCalculated: nextMatchSummary,
        message: "Daily sync completed successfully.",
      },
      executedAt: new Date(),
    });

    console.log(`[DailySync] Completed successfully. Stale closed: ${staleResult.modifiedCount || 0}, Today: ${todayMatchesCount}`);
    return log;
  } catch (error) {
    console.error("[DailySync] Error during execution:", error);
    const failLog = await SyncLog.create({
      syncType: "daily_sync",
      status: "failed",
      details: {
        message: error.message,
      },
      executedAt: new Date(),
    });
    return failLog;
  }
};

/**
 * Initializes the node-cron scheduler (Runs every day at 6:00 AM IST = 00:30 UTC).
 */
export const initCronJobs = () => {
  // Run every day at 06:00 AM (server local / IST configured)
  cron.schedule("0 6 * * *", async () => {
    console.log("[Cron] Fired 6:00 AM Daily Sports Sync job.");
    await runDailySync();
  });

  console.log("[Cron] Daily Sync cron job scheduled for 06:00 AM daily.");
};

export default { runDailySync, initCronJobs };
