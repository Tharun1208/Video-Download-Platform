import User from "../models/User.js";
import bcrypt from "bcryptjs";


// ==============================
// Get User Profile
// GET /api/users/profile
// ==============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==============================
// Update User Profile
// PUT /api/users/profile
// ==============================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;


    const updatedUser = await user.save();


    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        plan: updatedUser.plan,
        role: updatedUser.role,
      },
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ==============================
// Change Password
// PUT /api/users/change-password
// ==============================
export const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;


    const user = await User.findById(req.user._id);


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
        message: "Current password is incorrect",
      });
    }


    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );


    await user.save();


    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};