import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: false,
    },

    // User Plan at time of download
    userPlan: {
      type: String,
      default: "Free",
    },

    // User's sequential download count
    downloadCount: {
      type: Number,
      default: 1,
    },

    // Download Date
    downloadDate: {
      type: Date,
      default: Date.now,
    },

    // Standardized video details
    videoDetails: {
      title: {
        type: String,
        default: "Video",
      },
      thumbnail: {
        type: String,
        default: "",
      },
      videoUrl: {
        type: String,
        default: "",
      },
      source: {
        type: String,
        default: "Platform",
      },
      duration: {
        type: String,
        default: "",
      },
      category: {
        type: String,
        default: "General",
      },
      quality: {
        type: String,
        default: "HD",
      },
      format: {
        type: String,
        default: "MP4",
      },
    },

    externalVideo: {
      title: {
        type: String,
      },

      thumbnail: {
        type: String,
      },

      videoUrl: {
        type: String,
      },

      source: {
        type: String,
        default: "Pexels",
      },

      category: {
        type: String,
      },

      duration: {
        type: String,
      },
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


const Download = mongoose.model(
  "Download",
  downloadSchema
);


export default Download;