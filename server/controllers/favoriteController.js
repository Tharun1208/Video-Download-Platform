import User from "../models/User.js";
import Video from "../models/Video.js";

// ==========================================
// Add Video to Favorites
// ==========================================
export const addToFavorites = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const user = await User.findById(req.user._id);

    // Prevent duplicate favorites
    if (user.favorites.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video already added to favorites.",
      });
    }

    user.favorites.push(videoId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Video added to favorites successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get My Favorite Videos
// ==========================================
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("favorites");

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Remove Video from Favorites
// ==========================================
export const removeFromFavorites = async (req, res) => {
  try {
    const { videoId } = req.params;

    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== videoId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Video removed from favorites.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};