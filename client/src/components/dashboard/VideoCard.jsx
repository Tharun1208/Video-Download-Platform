import React from "react";
import { Link } from "react-router-dom";
import { Play, Crown } from "lucide-react";

import DownloadButton from "../videos/DownloadButton";

function VideoCard({ video = {} }) {
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

      {/* Thumbnail */}

      <div className="h-44 bg-gray-800 relative overflow-hidden">

        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Thumbnail
          </div>
        )}

        {video.isPremium && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
            <Crown size={15} />
            Premium
          </div>
        )}

      </div>

      {/* Content */}

      <div className="p-5">

        <h2 className="text-xl font-bold text-white line-clamp-2">
          {video.title}
        </h2>

        <p className="text-gray-400 mt-2">
          {video.category}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Duration: {video.duration}
        </p>

        {/* Buttons */}

        <div className="flex gap-3 mt-5">

          <Link
            to={`/video/${video._id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
          >
            <Play size={18} />
            Watch
          </Link>

          <DownloadButton video={video} />

        </div>

      </div>

    </div>
  );
}

export default VideoCard;