import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Favorite Route Working",
  });
});

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Add Favorite Route Working",
  });
});

export default router;