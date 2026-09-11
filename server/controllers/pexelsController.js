const videos = response.data.videos.map((video) => {
  console.log("VIDEO ID:", video.id);
  console.log("VIDEO FILES:", video.video_files);

  const videoFile = video.video_files?.find(
    (file) =>
      file.file_type === "video/mp4" &&
      file.link
  );

  return {
    _id: `pexels-${video.id}`,
    title: `${query} Video ${video.id}`,
    description: "Video fetched from Pexels.",
    thumbnail: video.image,
    videoUrl: videoFile?.link || "",
    duration: video.duration || 0,
    category: query,
    source: "Pexels",
    pexelsId: video.id,
    isPremium: false,
  };
});