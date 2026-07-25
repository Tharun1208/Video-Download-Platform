import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";

import Button from "../components/common/Button";
import VideoGrid from "../components/videos/VideoGrid";
import { getAllVideos } from "../api/videoApi";

const categories = [
  "All",
  "Frontend",
  "Backend",
  "Database",
  "AI",
  "Programming",
  "Full Stack",
];

function Videos() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await getAllVideos();

      if (response.data.success) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Browse Videos
        </h1>

        <p className="text-gray-400 mt-3">
          Explore courses and download videos based on your subscription plan.
        </p>

      </div>

      {/* Search */}

      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <div className="flex items-center gap-3 flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 transition-all duration-300 hover:border-blue-500 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20">

          <Search
            size={20}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-white placeholder-gray-500"
          />

        </div>

        <Button
          variant="primary"
          icon={<Filter size={18} />}
        >
          Filter
        </Button>

      </div>

      {/* Categories */}

      <div className="flex flex-wrap gap-3 mb-10">

        {categories.map((category) => (

          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105
              ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-blue-500 hover:text-white"
              }`}
          >
            {category}
          </button>

        ))}

      </div>

      {/* Video Grid */}

      <VideoGrid
        videos={videos}
        loading={loading}
        activeCategory={activeCategory}
        search={search}
      />

    </div>
  );
}

export default Videos;