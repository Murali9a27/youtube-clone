import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public"
    }
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
