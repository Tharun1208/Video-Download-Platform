import React from "react";
import VideoCard from "../dashboard/VideoCard";

function VideoGrid({
  videos,
  loading,
  activeCategory,
  search,
}) {
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading videos...
      </div>
    );
  }

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      activeCategory === "All" ||
      video.category === activeCategory;

    const matchesSearch =
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        No videos found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {filteredVideos.map((video) => (

        <VideoCard
          key={video._id}
          video={video}
        />

      ))}

    </div>
  );
}

export default VideoGrid;