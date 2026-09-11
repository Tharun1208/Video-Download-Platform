import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // =========================================================
    // USER
    // =========================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================================================
    // VIDEO
    // =========================================================
    // IMPORTANT:
    // This MUST be String because Pexels videos use IDs like:
    // pexels-38900157
    //
    // Normal MongoDB videos can also be stored as strings:
    // 68a123456789abcdef123456
    // =========================================================

    videoId: {
      type: String,
      required: true,
      index: true,
    },

    // =========================================================
    // COMMENT
    // =========================================================

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    language: {
      type: String,
      default: "auto",
    },

    // =========================================================
    // LIKES
    // =========================================================

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================================================
    // DISLIKES
    // =========================================================

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================================================
    // REPORTS
    // =========================================================

    reports: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        reason: {
          type: String,
          enum: [
            "abusive",
            "spam",
            "harassment",
            "hate",
            "misinformation",
            "sexual",
            "other",
          ],
          default: "other",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =========================================================
    // LOCATION
    // =========================================================

    location: {
      enabled: {
        type: Boolean,
        default: false,
      },

      city: {
        type: String,
        default: null,
      },
    },

    // =========================================================
    // MODERATION
    // =========================================================

    moderation: {
      status: {
        type: String,
        enum: [
          "visible",
          "flagged",
          "removed",
          "blocked",
        ],
        default: "visible",
      },

      reason: {
        type: String,
        default: null,
      },

      reviewed: {
        type: Boolean,
        default: false,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEX
// =========================================================

commentSchema.index({
  videoId: 1,
  createdAt: -1,
});

const Comment = mongoose.model(
  "Comment",
  commentSchema
);

export default Comment;