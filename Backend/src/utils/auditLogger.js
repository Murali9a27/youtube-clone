import { AuditLog } from "../models/auditLogs.model.js";

export const logAuditEvent = async ({
  userId,
  action,
  req,
  metadata = {}
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      device: req.headers["user-agent"],
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      metadata
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};
