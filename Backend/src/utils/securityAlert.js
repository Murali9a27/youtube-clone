import { SecurityAlert } from "../models/securityAlert.model.js";

export const createSecurityAlert = async ({
  userId,
  type,
  req,
  meta = {}
}) => {
  try {
    await SecurityAlert.create({
      user: userId,
      type,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta
    });
  } catch (error) {
    // VERY IMPORTANT: never block main flow
    console.error("Security alert error:", error.message);
  }
};
