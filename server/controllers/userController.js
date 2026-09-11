import User from "../models/User.js";
import bcrypt from "bcryptjs";

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
// Get User Profile
// GET /api/users/profile
// =========================================================

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =====================================================
    // RESET DAILY DOWNLOAD COUNT
    // Based on INDIA / IST calendar day
    // =====================================================

    const todayIST = getISTDateKey();

    const lastDownloadIST = user.lastDownloadDate
      ? getISTDateKey(user.lastDownloadDate)
      : null;

    console.log("====================================");
    console.log("PROFILE DAILY DOWNLOAD CHECK");
    console.log("Today IST:", todayIST);
    console.log("Last Download IST:", lastDownloadIST);
    console.log("Current downloadsToday:", user.downloadsToday);
    console.log("====================================");

    // If there was a previous download but it was on
    // a different IST calendar day, reset the daily count.

    if (
      user.lastDownloadDate &&
      lastDownloadIST !== todayIST
    ) {
      user.downloadsToday = 0;

      await user.save();

      console.log(
        "Daily download count reset to 0."
      );
    }

    // If user has never downloaded anything,
    // make sure downloadsToday is 0.

    if (!user.lastDownloadDate) {
      if (user.downloadsToday !== 0) {
        user.downloadsToday = 0;
        await user.save();
      }
    }

    // =====================================================
    // RETURN UPDATED USER
    // =====================================================

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================================
// Update User Profile
// PUT /api/users/profile
// =========================================================

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name =
      req.body.name || user.name;

    user.username =
      req.body.username || user.username;

    user.avatar =
      req.body.avatar || user.avatar;

    if (req.body.theme) {
      user.theme = ["auto", "light", "dark"].includes(req.body.theme)
        ? req.body.theme
        : "auto";
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        plan: updatedUser.plan,
        role: updatedUser.role,
        theme: updatedUser.theme,
        totalDownloads:
          updatedUser.totalDownloads,
        downloadsToday:
          updatedUser.downloadsToday,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================================
// Change Password
// PUT /api/users/change-password
// =========================================================

export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        newPassword,
        salt
      );

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};