import Download from "../models/Download.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

// ==========================================
// Download Video
// ==========================================
export const downloadVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const user = await User.findById(req.user._id);
    // Reset daily downloads if it's a new day
    const today = new Date().toDateString();

    if (
      !user.lastDownloadDate ||
      user.lastDownloadDate.toDateString() !== today
    ) {
      user.downloadsToday = 0;
      user.lastDownloadDate = new Date();
    }
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Download limit based on plan
    const limit = user.plan === "Premium" ? 10 : 1;

    if (user.downloadsToday >= limit) {
      return res.status(403).json({
        success: false,
        message: `Daily download limit reached (${limit} downloads/day).`,
      });
    }

    // Save download history
    await Download.create({
      user: user._id,
      video: video._id,
    });

    // Update counters
    user.downloadsToday += 1;
    user.totalDownloads += 1;
    user.lastDownloadDate = new Date();

    video.downloads += 1;

    await user.save();
    await video.save();

    res.status(200).json({
      success: true,
      message: "Download successful.",
      remainingDownloads: limit - user.downloadsToday,
      video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Download History
// ==========================================
export const getDownloadHistory = async (req, res) => {
  try {
    const downloads = await Download.find({
      user: req.user._id,
    })
      .populate("video")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: downloads.length,
      downloads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};