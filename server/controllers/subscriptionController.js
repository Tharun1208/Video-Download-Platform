import User from "../models/User.js";

// ==========================================
// Upgrade User to Premium
// ==========================================
export const upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.plan === "Premium") {
      return res.status(400).json({
        success: false,
        message: "User is already a Premium member.",
      });
    }

    user.plan = "Premium";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully.",
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Subscription Status
// ==========================================
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      plan: user.plan,
      downloadsToday: user.downloadsToday,
      totalDownloads: user.totalDownloads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};