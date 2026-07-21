import express from "express";

const router = express.Router();

router.get("/history", (req, res) => {
  res.json({
    success: true,
    message: "Download History Route Working",
  });
});

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Download Route Working",
  });
});

export default router;