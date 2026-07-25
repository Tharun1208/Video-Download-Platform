import User from "../models/User.js";
import Video from "../models/Video.js";
import Download from "../models/Download.js";

// ==========================================
// Dashboard Statistics
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const premiumUsers = await User.countDocuments({
      plan: "Premium",
    });

    const freeUsers = await User.countDocuments({
      plan: "Free",
    });

    const totalVideos = await Video.countDocuments();

    const totalDownloads = await Download.countDocuments();

    const mostDownloadedVideo = await Video.findOne()
      .sort({ downloads: -1 })
      .select("title downloads");

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        premiumUsers,
        freeUsers,
        totalVideos,
        totalDownloads,
        mostDownloadedVideo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Users
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Downloads
// ==========================================
export const getAllDownloads = async (req, res) => {
  try {
    const downloads = await Download.find()
      .populate("user", "name email")
      .populate("video", "title")
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