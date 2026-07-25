import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "VideoVault/Profile",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    const user = await User.findById(req.user._id);

    user.avatar = result.secure_url;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      image: result.secure_url,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};