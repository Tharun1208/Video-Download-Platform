const verifyManager = (req, res, next) => {
  try {
    // authMiddleware should already have added req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check manager role
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Verify manager error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

export default verifyManager;