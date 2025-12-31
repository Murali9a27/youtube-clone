import { Playlist } from "../models/playlist.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const createPlaylist = asyncHandler(async (req, res)=>{
    const { name, description, visibility } = req.body;

    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        visibility,
        owner: req.user._id
    });

    res.status(201).json(new ApiResponse(201, playlist, "Playlist created"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id
    },
    {
      $addToSet: { videos: videoId } // prevents duplicates
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id
    },
    {
      $pull: { videos: videoId }
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or unauthorized");
  }

  res.status(200).json(
    new ApiResponse(200, playlist, "Video removed from playlist")
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId)
    .populate("owner", "username avatar")
    .populate("videos", "title thumbnail duration views owner");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Private playlist check
  if (
    playlist.visibility === "private" &&
    playlist.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not allowed to view this playlist");
  }

  res.status(200).json(
    new ApiResponse(200, playlist, "Playlist fetched successfully")
  );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const filter = {
    owner: userId
  };

  // If requesting user is NOT the owner, show only public playlists
  if (req.user._id.toString() !== userId.toString()) {
    filter.visibility = "public";
  }

  const playlists = await Playlist.find(filter)
    .sort({ createdAt: -1 })
    .populate("owner", "username avatar")
    .select("-videos"); // lightweight list view

  res.status(200).json(
    new ApiResponse(200, playlists, "User playlists fetched successfully")
  );
});



export {
    createPlaylist, 
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylists
}