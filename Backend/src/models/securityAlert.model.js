import mongoose, { Schema } from "mongoose";

const securityAlertSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "REGISTER",
        "LOGIN",
        "LOGIN_FAILED",
        "LOGOUT",
        "LOGOUT_ALL",
        "REFRESH_TOKEN",
        "SESSION_EXPIRED",
        "PROFILE UPDATED",
        "PASSWORD_CHANGE",
        "PASSWORD_RESET_REQUEST",
        "PASSWORD_RESET_SUCCESS",
        "TOKEN_REVOKED",
        "RATE_LIMIT_EXCEEDED",
        "UNAUTHORIZED_ACCESS",
        "SUSPICIOUS_ACTIVITY"
      ],
      required: true
    },

    ipAddress: String,
    userAgent: String,

    meta: {
      type: Object // device, reason, location, etc.
    }
  },
  { timestamps: true }
);

export const SecurityAlert = mongoose.model(
  "SecurityAlert",
  securityAlertSchema
);
