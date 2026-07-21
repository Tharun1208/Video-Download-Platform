import React from "react";
import {
  Calendar,
  Download,
  Play,
  Crown,
} from "lucide-react";

import Button from "../common/Button";

function DownloadCard({ video = {} }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

      <div className="flex flex-col md:flex-row gap-6">

        {/* Thumbnail */}

        <div className="w-full md:w-52 h-36 bg-gray-800 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-700">

          <span className="text-gray-400">
            Thumbnail
          </span>

        </div>

        {/* Video Details */}

        <div className="flex-1">

          <h2 className="text-2xl font-bold text-white">

            {video.title}

          </h2>

          <p className="text-gray-400 mt-2">

            {video.category}

          </p>

          <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">

            <Calendar size={16} />

            <span>
              Downloaded: {video.date}
            </span>

          </div>

          <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">

            <Download size={16} />

            <span>
              Download Count: {video.count}
            </span>

          </div>

          <div className="flex flex-wrap gap-3 mt-6">

            <Button
              variant="success"
              icon={<Play size={18} />}
            >
              Play
            </Button>

            <Button
              variant="primary"
              icon={<Download size={18} />}
            >
              Download Again
            </Button>

          </div>

        </div>

        {/* Plan Badge */}

        <div className="flex md:block">

          {video.plan === "Premium" ? (

            <span className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold shadow-lg">

              <Crown size={16} />

              Premium

            </span>

          ) : (

            <span className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-full">

              Free

            </span>

          )}

        </div>

      </div>

    </div>
  );
}

export default DownloadCard;