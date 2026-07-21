import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Subscription Route Working",
  });
});

router.post("/upgrade", (req, res) => {
  res.json({
    success: true,
    message: "Upgrade Subscription Route Working",
  });
});

export default router;