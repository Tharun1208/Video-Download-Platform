import mongoose from "mongoose";
import Download from "../models/Download.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { createNotification } from "./notificationController.js";

// =========================================================
// PLAN LIMITS
// =========================================================

const planLimits = {
  Free: 1,
  Bronze: 5,
  Silver: 15,
  Gold: Infinity,
  free: 1,
  bronze: 5,
  silver: 15,
  gold: Infinity,
};

// =========================================================
// GET CURRENT DATE IN IST
// =========================================================

const getISTDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// =========================================================
// RESET DAILY DOWNLOAD COUNT
// =========================================================

const resetDailyDownloadCount = async (user) => {
  const todayIST = getISTDateKey();

  const lastDownloadIST = user.lastDownloadDate
    ? getISTDateKey(user.lastDownloadDate)
    : null;

  console.log("====================================");
  console.log("DAILY DOWNLOAD CHECK");
  console.log("Today IST:", todayIST);
  console.log("Last Download IST:", lastDownloadIST);
  console.log(
    "Current Downloads Today:",
    user.downloadsToday
  );
  console.log("====================================");

  // -------------------------------------------------------
  // If user downloaded on a previous day,
  // reset today's download count.
  // -------------------------------------------------------

  if (
    user.lastDownloadDate &&
    lastDownloadIST !== todayIST
  ) {
    console.log(
      "NEW DAY DETECTED → Resetting downloadsToday to 0"
    );

    user.downloadsToday = 0;

    // IMPORTANT:
    // Do NOT update lastDownloadDate here.
    //
    // It should only be updated after a successful
    // download.
  }

  // -------------------------------------------------------
  // If user has never downloaded anything
  // -------------------------------------------------------

  if (!user.lastDownloadDate) {
    user.downloadsToday = 0;
  }

  return user;
};

// =========================================================
// DOWNLOAD VIDEO
// Supports MongoDB + Pexels
// =========================================================

export const downloadVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log("====================================");
    console.log("DOWNLOAD REQUEST");
    console.log("Video ID:", videoId);
    console.log("User ID:", req.user?._id);
    console.log("Request body:", req.body);
    console.log("====================================");

    // =====================================================
    // GET USER
    // =====================================================

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================================
    // RESET DAILY COUNT
    // =====================================================

    await resetDailyDownloadCount(user);

    // =====================================================
    // PLAN LIMIT
    // =====================================================

    const limit = planLimits[user.plan] ?? 1;

    console.log("User plan:", user.plan);
    console.log(
      "Downloads today:",
      user.downloadsToday
    );
    console.log("Limit:", limit);

    // =====================================================
    // CHECK DAILY LIMIT
    // =====================================================

    if (
      limit !== Infinity &&
      user.downloadsToday >= limit
    ) {
      try {
        await createNotification(
          user._id,
          "Daily Download Limit Reached",
          `You have reached your ${user.plan} plan limit of ${limit} downloads per day.`
        );
      } catch (notificationError) {
        console.error(
          "Notification error:",
          notificationError.message
        );
      }

      return res.status(403).json({
        success: false,
        message: `Daily download limit reached (${limit} downloads/day). Please upgrade your plan for more downloads.`,
      });
    }

    // =====================================================
    // DETERMINE VIDEO TYPE
    // =====================================================

    const isPexelsVideo =
      String(videoId)
        .toLowerCase()
        .startsWith("pexels-");

    console.log(
      "Is Pexels:",
      isPexelsVideo
    );

    // =====================================================
    // PEXELS VIDEO
    // =====================================================

    if (isPexelsVideo) {
      const {
        title,
        thumbnail,
        videoUrl,
        source,
        category,
        duration,
      } = req.body;

      console.log("Pexels data:", {
        title,
        thumbnail,
        videoUrl,
        source,
      });

      // -----------------------------------------------
      // VALIDATE PEXELS URL
      // -----------------------------------------------

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Pexels video URL is not available.",
        });
      }

      // -----------------------------------------------
      // CHECK DUPLICATE
      // -----------------------------------------------

      const alreadyDownloaded =
        await Download.findOne({
          user: user._id,
          "externalVideo.videoUrl": videoUrl,
        });

      if (alreadyDownloaded) {
        return res.status(400).json({
          success: false,
          message:
            "This video is already downloaded.",
        });
      }

      // -----------------------------------------------
      // CREATE DOWNLOAD HISTORY
      // -----------------------------------------------

      const currentDownloadCount = (user.totalDownloads || 0) + 1;
      const now = new Date();

      const download = await Download.create({
        user: user._id,
        userPlan: user.plan || "Free",
        downloadCount: currentDownloadCount,
        downloadDate: now,
        downloadedAt: now,

        videoDetails: {
          videoId: String(videoId),
          title: title || "Pexels Video",
          thumbnail: thumbnail || "",
          videoUrl,
          source: source || "Pexels",
          category: category || "General",
          duration: duration || "",
          quality: "HD",
          format: "MP4",
        },

        externalVideo: {
          title:
            title || "Pexels Video",

          thumbnail:
            thumbnail || "",

          videoUrl,

          source:
            source || "Pexels",

          category:
            category || "General",

          duration:
            duration || "",
        },
      });

      // -----------------------------------------------
      // UPDATE USER COUNTS
      // -----------------------------------------------

      user.downloadsToday =
        (user.downloadsToday || 0) + 1;

      user.totalDownloads =
        (user.totalDownloads || 0) + 1;

      // IMPORTANT:
      // Update lastDownloadDate ONLY after
      // successful download history creation.

      user.lastDownloadDate =
        new Date();

      await user.save();

      // -----------------------------------------------
      // NOTIFICATION
      // -----------------------------------------------

      try {
        await createNotification(
          user._id,
          "Download Completed",
          `${title || "Pexels video"} downloaded successfully.`
        );
      } catch (notificationError) {
        console.error(
          "Notification error:",
          notificationError.message
        );
      }

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "Download recorded successfully.",

        downloadId:
          download._id,

        plan:
          user.plan,

        downloadsToday:
          user.downloadsToday,

        remainingDownloads:
          limit === Infinity
            ? "Unlimited"
            : Math.max(
                0,
                limit -
                  user.downloadsToday
              ),

        downloadUrl:
          videoUrl,

        video: {
          id: videoId,

          title:
            title ||
            "Pexels Video",

          thumbnail:
            thumbnail || "",

          videoUrl,

          source:
            source ||
            "Pexels",

          category:
            category ||
            "General",

          duration:
            duration || "",
        },
      });
    }

    // =====================================================
    // MONGODB VIDEO
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        videoId
      )
    ) {
      console.log(
        "Invalid MongoDB video ID:",
        videoId
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid video ID.",
      });
    }

    // =====================================================
    // FIND VIDEO
    // =====================================================

    const video =
      await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message:
          "Video not found.",
      });
    }

    console.log(
      "MongoDB video found:",
      {
        id: video._id,
        title: video.title,
        youtubeId:
          video.youtubeId,
        videoUrl:
          video.videoUrl,
      }
    );

    // =====================================================
    // CHECK DUPLICATE
    // =====================================================

    const alreadyDownloaded =
      await Download.findOne({
        user: user._id,
        video: video._id,
      });

    if (alreadyDownloaded) {
      return res.status(400).json({
        success: false,
        message:
          "This video is already downloaded.",
      });
    }

    // =====================================================
    // DETERMINE DOWNLOAD URL
    // =====================================================

    const downloadUrl =
      video.videoUrl
        ? video.videoUrl
        : video.youtubeId
        ? `https://www.youtube.com/watch?v=${video.youtubeId}`
        : null;

    if (!downloadUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Video download URL is not available.",
      });
    }

    // =====================================================
    // CREATE DOWNLOAD HISTORY
    // =====================================================

    const currentDownloadCount = (user.totalDownloads || 0) + 1;
    const now = new Date();

    const download =
      await Download.create({
        user: user._id,
        video: video._id,
        userPlan: user.plan || "Free",
        downloadCount: currentDownloadCount,
        downloadDate: now,
        downloadedAt: now,
        videoDetails: {
          videoId: String(video._id),
          title: video.title || "Video",
          thumbnail: video.thumbnail || "",
          videoUrl: downloadUrl,
          source: video.youtubeId ? "YouTube" : "Platform",
          category: video.category || "General",
          duration: video.duration || "",
          quality: "HD",
          format: "MP4",
        },
      });

    // =====================================================
    // UPDATE USER
    // =====================================================

    user.downloadsToday =
      (user.downloadsToday || 0) + 1;

    user.totalDownloads =
      (user.totalDownloads || 0) + 1;

    // IMPORTANT:
    // Only update the date after successful download.

    user.lastDownloadDate =
      new Date();

    // =====================================================
    // UPDATE VIDEO DOWNLOAD COUNT
    // =====================================================

    video.downloads =
      (video.downloads || 0) + 1;

    // =====================================================
    // SAVE
    // =====================================================

    await user.save();
    await video.save();

    // =====================================================
    // NOTIFICATION
    // =====================================================

    try {
      await createNotification(
        user._id,
        "Download Completed",
        `${video.title} downloaded successfully.`
      );
    } catch (notificationError) {
      console.error(
        "Notification error:",
        notificationError.message
      );
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message:
        "Download recorded successfully.",

      downloadId:
        download._id,

      plan:
        user.plan,

      downloadsToday:
        user.downloadsToday,

      remainingDownloads:
        limit === Infinity
          ? "Unlimited"
          : Math.max(
              0,
              limit -
                user.downloadsToday
            ),

      downloadUrl,

      video: {
        _id:
          video._id,

        title:
          video.title,

        youtubeId:
          video.youtubeId,

        thumbnail:
          video.thumbnail,

        category:
          video.category,

        duration:
          video.duration,

        videoUrl:
          video.videoUrl ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "DOWNLOAD ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// =========================================================
// DOWNLOAD HISTORY
// =========================================================

export const getDownloadHistory = async (
  req,
  res
) => {
  try {
    const downloads =
      await Download.find({
        user: req.user._id,
      })
        .populate("video")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count:
        downloads.length,
      downloads,
    });
  } catch (error) {
    console.error(
      "Download history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// =========================================================
// DELETE DOWNLOAD HISTORY
// =========================================================

export const deleteDownload = async (
  req,
  res
) => {
  try {
    const { downloadId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        downloadId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid download ID.",
      });
    }

    const download =
      await Download.findOne({
        _id: downloadId,
        user: req.user._id,
      });

    if (!download) {
      return res.status(404).json({
        success: false,
        message:
          "Download not found.",
      });
    }

    await Download.findByIdAndDelete(
      downloadId
    );

    return res.status(200).json({
      success: true,
      message:
        "Download removed successfully.",
    });
  } catch (error) {
    console.error(
      "Delete download error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};