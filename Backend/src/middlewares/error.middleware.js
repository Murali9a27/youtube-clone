import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";


const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 2MB limit"
      });
    }
  }

  /* ---------------- MONGOOSE VALIDATION ---------------- */
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  /* ---------------- DUPLICATE KEY ERROR ---------------- */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

   /* ---------------- CUSTOM API ERROR ---------------- */
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  /* ---------------- FALLBACK ---------------- */
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

export default errorHandler;
