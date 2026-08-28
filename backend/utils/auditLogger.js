import AuditLog from "../models/AuditLog.js";

/**
 * Creates an audit log record for sensitive admin actions, role changes, venue modifications, and payments.
 * @param {Object} params
 * @param {Object} [params.req] - Express request object (extracts user & IP)
 * @param {string} params.action - Name of the action (e.g. "role_change", "venue_deleted", "payment_confirmed")
 * @param {string|mongoose.Types.ObjectId} [params.targetId] - ID of affected entity
 * @param {string} [params.targetCollection] - Collection name of target
 * @param {Object} [params.details] - Metadata details of the change
 * @param {string} [params.status="success"] - Outcome status ("success" | "failed" | "blocked")
 */
export const recordAuditLog = async ({
  req,
  action,
  targetId,
  targetCollection,
  details = {},
  status = "success",
}) => {
  try {
    const user = req?.user;
    const ip = req?.ip || req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || "127.0.0.1";

    const log = await AuditLog.create({
      userId: user?._id || null,
      userName: user?.name || "System / Unauthenticated",
      userEmail: user?.email || "",
      action,
      targetId: targetId ? targetId.toString() : null,
      targetCollection: targetCollection || "",
      details,
      ip: String(ip),
      status,
      timestamp: new Date(),
    });

    return log;
  } catch (error) {
    console.error("[AuditLog] Failed to record audit entry:", error.message);
    return null;
  }
};

export default { recordAuditLog };
