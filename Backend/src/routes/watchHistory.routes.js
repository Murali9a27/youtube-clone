import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory
} from "../controllers/watchHistory.controller.js";

const router = Router();

router.use(verifyJWT);

// Add video to history
router.post("/:videoId", addToWatchHistory);

// Get watch history
router.get("/", getWatchHistory);

// Remove one video
router.delete("/:videoId", removeFromWatchHistory);

// Clear entire history
router.delete("/", clearWatchHistory);

export default router;
