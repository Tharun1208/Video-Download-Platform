import Comment from "../models/Comment.js";
import {
  moderateComment,
} from "../middleware/commentModeration.js";

// ==========================================
// GET USER ID
// ==========================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};

// ==========================================
// CREATE COMMENT
// ==========================================

export const createComment = async (
  req,
  res
) => {
  try {
    const {
      videoId,
      text,
      language,
      locationEnabled,
      city,
    } = req.body;

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (
      !videoId ||
      typeof videoId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid video ID is required.",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Comment cannot be empty.",
      });
    }

    const trimmedText = text.trim();

    if (trimmedText.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Comment cannot exceed 1000 characters.",
      });
    }

    const moderation =
      moderateComment(trimmedText);

    if (!moderation.allowed) {
      return res.status(400).json({
        success: false,
        message: moderation.reason,
      });
    }

    const normalizedVideoId =
      videoId.trim();

    const duplicateComment =
      await Comment.findOne({
        userId,
        videoId: normalizedVideoId,
        text: trimmedText,
        createdAt: {
          $gte: new Date(
            Date.now() -
              10 * 60 * 1000
          ),
        },
      });

    if (duplicateComment) {
      return res.status(400).json({
        success: false,
        message:
          "You have already posted this comment recently.",
      });
    }

    const location = {
      enabled: Boolean(
        locationEnabled
      ),
      city:
        locationEnabled && city
          ? city
          : null,
    };

    const comment =
      await Comment.create({
        userId,
        videoId: normalizedVideoId,
        text: trimmedText,
        language:
          language || "auto",
        location,
      });

    const populatedComment =
      await Comment.findById(
        comment._id
      ).populate(
        "userId",
        "name username profileImage"
      );

    return res.status(201).json({
      success: true,
      message:
        "Comment posted successfully.",
      comment: {
        ...populatedComment.toObject(),

        likeCount:
          populatedComment.likes
            ?.length || 0,

        dislikeCount:
          populatedComment.dislikes
            ?.length || 0,

        userLiked: false,
        userDisliked: false,
      },
    });
  } catch (error) {
    console.error(
      "Create Comment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create comment.",
    });
  }
};

// ==========================================
// GET COMMENTS
// ==========================================

export const getComments = async (
  req,
  res
) => {
  try {
    const { videoId } =
      req.params;

    const userId =
      getUserId(req);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message:
          "Video ID is required.",
      });
    }

    const comments =
      await Comment.find({
        videoId: videoId.trim(),
        "moderation.status":
          "visible",
      })
        .populate(
          "userId",
          "name username profileImage"
        )
        .sort({
          createdAt: -1,
        });

    const formattedComments =
      comments.map(
        (comment) => {
          const commentObject =
            comment.toObject();

          return {
            ...commentObject,

            likeCount:
              comment.likes
                ?.length || 0,

            dislikeCount:
              comment.dislikes
                ?.length || 0,

            userLiked: userId
              ? comment.likes.some(
                  (id) =>
                    id.toString() ===
                    userId.toString()
                )
              : false,

            userDisliked: userId
              ? comment.dislikes.some(
                  (id) =>
                    id.toString() ===
                    userId.toString()
                )
              : false,
          };
        }
      );

    return res.status(200).json({
      success: true,
      comments:
        formattedComments,
    });
  } catch (error) {
    console.error(
      "Get Comments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch comments.",
    });
  }
};

// ==========================================
// LIKE COMMENT
// ==========================================

export const likeComment = async (
  req,
  res
) => {
  try {
    const { commentId } =
      req.params;

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const comment =
      await Comment.findById(
        commentId
      );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message:
          "Comment not found.",
      });
    }

    const alreadyLiked =
      comment.likes.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    const alreadyDisliked =
      comment.dislikes.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    if (alreadyLiked) {
      comment.likes =
        comment.likes.filter(
          (id) =>
            id.toString() !==
            userId.toString()
        );
    } else {
      comment.likes.push(
        userId
      );

      if (alreadyDisliked) {
        comment.dislikes =
          comment.dislikes.filter(
            (id) =>
              id.toString() !==
              userId.toString()
          );
      }
    }

    await comment.save();

    return res.status(200).json({
      success: true,

      likeCount:
        comment.likes.length,

      dislikeCount:
        comment.dislikes.length,

      userLiked:
        !alreadyLiked,

      userDisliked: false,
    });
  } catch (error) {
    console.error(
      "Like Comment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to like comment.",
    });
  }
};

// ==========================================
// DISLIKE COMMENT
// ==========================================

export const dislikeComment =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found.",
        });
      }

      const alreadyDisliked =
        comment.dislikes.some(
          (id) =>
            id.toString() ===
            userId.toString()
        );

      const alreadyLiked =
        comment.likes.some(
          (id) =>
            id.toString() ===
            userId.toString()
        );

      if (alreadyDisliked) {
        comment.dislikes =
          comment.dislikes.filter(
            (id) =>
              id.toString() !==
              userId.toString()
          );
      } else {
        comment.dislikes.push(
          userId
        );

        if (alreadyLiked) {
          comment.likes =
            comment.likes.filter(
              (id) =>
                id.toString() !==
                userId.toString()
            );
        }
      }

      await comment.save();

      return res.status(200).json({
        success: true,

        likeCount:
          comment.likes.length,

        dislikeCount:
          comment.dislikes.length,

        userLiked: false,

        userDisliked:
          !alreadyDisliked,
      });
    } catch (error) {
      console.error(
        "Dislike Comment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to dislike comment.",
      });
    }
  };

// ==========================================
// REPORT COMMENT
// ==========================================

export const reportComment =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const { reason } =
        req.body;

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found.",
        });
      }

      const alreadyReported =
        comment.reports.some(
          (report) =>
            report.userId.toString() ===
            userId.toString()
        );

      if (alreadyReported) {
        return res.status(400).json({
          success: false,
          message:
            "You have already reported this comment.",
        });
      }

      comment.reports.push({
        userId,
        reason:
          reason || "other",
      });

      comment.moderation.status =
        "flagged";

      comment.moderation.reviewed =
        false;

      await comment.save();

      return res.status(200).json({
        success: true,
        message:
          "Comment reported and flagged for review.",
      });
    } catch (error) {
      console.error(
        "Report Comment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to report comment.",
      });
    }
  };

// ==========================================
// DELETE COMMENT
// ==========================================

export const deleteComment =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found.",
        });
      }

      if (
        comment.userId.toString() !==
        userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can delete only your own comments.",
        });
      }

      await Comment.findByIdAndDelete(
        commentId
      );

      return res.status(200).json({
        success: true,
        message:
          "Comment deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Comment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete comment.",
      });
    }
  };

// ==========================================
// TRANSLATE COMMENT
// ==========================================

export const translateComment =
  async (req, res) => {
    try {
      const {
        text,
        targetLanguage,
      } = req.body;

      if (
        !text ||
        !String(text).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Text is required.",
        });
      }

      if (!targetLanguage) {
        return res.status(400).json({
          success: false,
          message:
            "Target language is required.",
        });
      }

      const baseUrl =
        process.env.BACKEND_URL ||
        `http://localhost:${
          process.env.PORT || 5000
        }`;

      const response =
        await fetch(
          `${baseUrl}/api/translate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text: String(
                text
              ).trim(),

              targetLanguage,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        return res.status(500).json({
          success: false,
          message:
            data.message ||
            "Translation service is currently unavailable.",
        });
      }

      return res.status(200).json({
        success: true,
        translatedText:
          data.translatedText,
      });
    } catch (error) {
      console.error(
        "Translation Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Translation service is currently unavailable.",
      });
    }
  };

// ==========================================
// GET REPORTED COMMENTS
// ==========================================

export const getReportedComments =
  async (req, res) => {
    try {
      const comments =
        await Comment.find({
          "moderation.status":
            "flagged",
        })
          .populate(
            "userId",
            "name username email"
          )
          .populate(
            "reports.userId",
            "name username"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        comments,
      });
    } catch (error) {
      console.error(
        "Reported Comments Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch reported comments.",
      });
    }
  };

// ==========================================
// REVIEW COMMENT
// ==========================================

export const reviewComment =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const { action } =
        req.body;

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found.",
        });
      }

      if (
        !["keep", "remove"].includes(
          action
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid moderation action.",
        });
      }

      comment.moderation.status =
        action === "keep"
          ? "visible"
          : "removed";

      comment.moderation.reviewed =
        true;

      comment.moderation.reviewedAt =
        new Date();

      await comment.save();

      return res.status(200).json({
        success: true,
        message:
          action === "keep"
            ? "Comment approved."
            : "Comment removed.",
      });
    } catch (error) {
      console.error(
        "Review Comment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to review comment.",
      });
    }
  };