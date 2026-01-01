import { WatchHistory } from "../models/watchHistory.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const history = await WatchHistory.findOne({ user: req.user._id });

  // Remove existing entry if video already watched
  if (history) {
    history.videos = history.videos.filter(
      (item) => item.video.toString() !== videoId
    );

    history.videos.unshift({ video: videoId });
    await history.save();
  } else {
    await WatchHistory.create({
      user: req.user._id,
      videos: [{ video: videoId }]
    });
  }

  res.status(200).json(
    new ApiResponse(200, null, "Watch history updated")
  );
});


const getWatchHistory = asyncHandler(async (req, res) => {
  const history = await WatchHistory.findOne({
    user: req.user._id
  }).populate(
    "videos.video",
    "title thumbnail duration views owner"
  );

  if (!history) {
    return res.status(200).json(
      new ApiResponse(200, [], "No watch history found")
    );
  }

  res.status(200).json(
    new ApiResponse(200, history.videos, "Watch history fetched")
  );
});


const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const history = await WatchHistory.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        videos: { video: videoId }
      }
    },
    { new: true }
  );

  if (!history) {
    throw new ApiError(404, "Watch history not found");
  }

  res.status(200).json(
    new ApiResponse(200, history.videos, "Video removed from history")
  );
});


const clearWatchHistory = asyncHandler(async (req, res) => {
  await WatchHistory.findOneAndUpdate(
    { user: req.user._id },
    { $set: { videos: [] } }
  );

  res.status(200).json(
    new ApiResponse(200, null, "Watch history cleared")
  );
});

export {
    addToWatchHistory,
    getWatchHistory,
    removeFromWatchHistory,
    clearWatchHistory
}