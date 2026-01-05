import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    action: {
      type: String,
      enum: [
        // Auth
        "REGISTER",
        "LOGIN",
        "LOGIN_FAILED",
        "LOGOUT",
        "LOGOUT_ALL",
        "REFRESH_TOKEN",
        "SESSION_EXPIRED",
        // Security
        "PASSWORD_CHANGE",
        "PASSWORD_RESET_REQUEST",
        "PASSWORD_RESET_SUCCESS",
        "TOKEN_REVOKED",
        // Profile
        "PROFILE_UPDATE",
        "AVATAR_UPDATE",
        "COVER_IMAGE_UPDATE",
        // Account
        "ACCOUNT_VERIFIED",
        "ACCOUNT_DEACTIVATED",
        "ACCOUNT_DELETED",
        // Abuse & monitoring
        "RATE_LIMIT_EXCEEDED",
        "UNAUTHORIZED_ACCESS",
        "SUSPICIOUS_ACTIVITY"
    ],

      required: true
    },

    device: {
      type: String
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    },

    metadata: {
      type: Object
    }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
