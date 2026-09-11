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
      default: "",
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
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
        "Nature",
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

    source: {
      type: String,
      enum: [
        "YouTube",
        "Pexels",
      ],
      default: "YouTube",
    },

    pexelsId: {
      type: Number,
      unique: true,
      sparse: true,
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
      enum: [
        "Active",
        "Inactive",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);


const Video = mongoose.model(
  "Video",
  videoSchema
);


export default Video;