import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    youtubeId: {
      type: String,
      required: [true, "YouTube ID is required"],
      unique: true,
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "00:00",
    },

    category: {
      type: String,
      enum: [
        "Education",
        "Programming",
        "Technology",
        "Entertainment",
        "Gaming",
        "Music",
        "Sports",
        "Movies",
        "News",
        "Others",
      ],
      default: "Others",
    },

    tags: [
      {
        type: String,
      },
    ],

    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;