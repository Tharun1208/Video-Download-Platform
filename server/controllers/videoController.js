import Video from "../models/Video.js";

// ==========================================
// Add New Video (Admin)
// ==========================================
export const addVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      youtubeId,
      duration,
      category,
      tags,
      isPremium,
    } = req.body;

    // Check if video already exists
    const exists = await Video.findOne({ youtubeId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Video already exists.",
      });
    }

    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    const video = await Video.create({
      title,
      description,
      youtubeId,
      thumbnail,
      duration,
      category,
      tags,
      isPremium,
      uploader: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Video added successfully.",
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
// Get All Videos
// ==========================================
// ==========================================
// Get All Videos (Production Ready)
// ==========================================
export const getVideos = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? {
          title: {
            $regex: req.query.search,
            $options: "i",
          },
        }
      : {};

    const category =
      req.query.category && req.query.category !== "All"
        ? { category: req.query.category }
        : {};

    let sortOption = { createdAt: -1 };

    switch (req.query.sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "popular":
        sortOption = { views: -1 };
        break;

      case "downloads":
        sortOption = { downloads: -1 };
        break;

      case "latest":
      default:
        sortOption = { createdAt: -1 };
    }

    const filter = {
      status: "Active",
      ...keyword,
      ...category,
    };

    const totalVideos = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
      .populate("uploader", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalVideos / limit),
      totalVideos,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// Get Single Video
// ==========================================
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "uploader",
      "name email"
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    video.views += 1;
    await video.save();

    res.status(200).json({
      success: true,
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
// Search Videos
// ==========================================
export const searchVideos = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const videos = await Video.find({
      status: "Active",
      title: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Videos By Category
// ==========================================
export const getVideosByCategory = async (req, res) => {
  try {
    const videos = await Video.find({
      category: req.params.category,
      status: "Active",
    });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Video
// ==========================================
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};