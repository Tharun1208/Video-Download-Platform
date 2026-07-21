import express from "express";

const router = express.Router();

// Get All Videos
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "All Videos Route Working",
  });
});

// Get Video by ID
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    message: `Video ${req.params.id}`,
  });
});

// Upload Video
router.post("/upload", (req, res) => {
  res.json({
    success: true,
    message: "Upload Video Route Working",
  });
});

export default router;