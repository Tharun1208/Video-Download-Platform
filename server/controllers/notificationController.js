import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      notifications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createNotification = async (userId, title, message) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message
    });

    console.log("Notification created:", notification);

    return notification;

  } catch (error) {
    console.log("Notification creation failed:", error.message);
    throw error;
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};