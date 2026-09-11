import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const response = await axios.get(
      "https://api.pexels.com/videos/search",
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
        params: {
          query,
          per_page: 12,
        },
      }
    );

    const videos = response.data.videos.map((video) => {
      const videoFile =
        video.video_files.find(
          (file) =>
            file.file_type === "video/mp4" &&
            file.width >= 720
        ) ||
        video.video_files.find(
          (file) => file.file_type === "video/mp4"
        );

      return {
        id: `pexels-${video.id}`,
        title: `${query} Video`,
        description: video.user?.name
          ? `Video by ${video.user.name}`
          : `Pexels ${query} video`,
        videoUrl: videoFile?.link || "",
        thumbnail: video.image || "",
        category: query,
        source: "pexels",
      };
    });

    res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error(
      "PEXELS ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch Pexels videos",
    });
  }
});

export default router;