import React, { useEffect, useState } from "react";
import {
  Download,
  Play,
  Crown,
  Clock,
  Eye,
} from "lucide-react";
import { useParams } from "react-router-dom";

import Button from "../components/common/Button";
import { getVideoById } from "../api/videoApi";

function VideoDetails() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      const response = await getVideoById(id);

      if (response.data.success) {
        setVideo(response.data.video);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-500">
        Video not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Video Player */}

      <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <iframe
          width="100%"
          height="450"
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allowFullScreen
        />

      </div>

      {/* Video Details */}

      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div className="flex-1">

            <h1 className="text-4xl font-bold">
              {video.title}
            </h1>

            <p className="text-blue-400 mt-2">
              {video.category}
            </p>

            <div className="flex flex-wrap gap-6 mt-6 text-gray-400">

              <div className="flex items-center gap-2">
                <Clock size={18} />
                {video.duration}
              </div>

              <div className="flex items-center gap-2">
                <Eye size={18} />
                {video.views} Views
              </div>

            </div>

            <p className="mt-6 text-gray-300 leading-8">
              {video.description}
            </p>

            <p className="mt-4 text-gray-500">
              Uploaded by: {video.uploader?.name}
            </p>

          </div>

          {video.isPremium && (

            <div>

              <span className="flex items-center gap-2 bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold shadow-lg">

                <Crown size={18} />

                Premium

              </span>

            </div>

          )}

        </div>

        {/* Buttons */}

        <div className="flex flex-wrap gap-4 mt-8">

          <Button
            variant="success"
            icon={<Play size={18} />}
          >
            Watch Now
          </Button>

          <Button
            variant="primary"
            icon={<Download size={18} />}
          >
            Download
          </Button>

        </div>

      </div>

      {/* Download Rules */}

      <div className="mt-6 bg-blue-950 border border-blue-700 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">

        <h2 className="text-2xl font-bold">
          Download Rules
        </h2>

        <ul className="mt-5 space-y-3 text-gray-300">

          <li>✓ Free users can download 1 video per day.</li>

          <li>✓ Premium users can download up to 10 videos per day.</li>

          <li>✓ Download history is automatically saved.</li>

          <li>✓ Premium users get HD quality downloads.</li>

        </ul>

      </div>

    </div>
  );
}

export default VideoDetails;