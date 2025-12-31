import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createPlaylist);
router.get("/user/:userId", getUserPlaylists);
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId/add/:videoId", addVideoToPlaylist);
router.patch("/:playlistId/remove/:videoId", removeVideoFromPlaylist);

export default router;
