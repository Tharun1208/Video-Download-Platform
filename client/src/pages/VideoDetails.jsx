import React from "react";
import {
  Download,
  Play,
  Crown,
  Clock,
  Eye,
} from "lucide-react";

import Button from "../components/common/Button";

function VideoDetails() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Video Player */}

      <div className="bg-black border border-gray-800 rounded-2xl h-[450px] flex items-center justify-center transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <button className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all duration-300 flex items-center justify-center">

          <Play size={55} fill="white" />

        </button>

      </div>

      {/* Video Details */}

      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div className="flex-1">

            <h1 className="text-4xl font-bold">
              React Full Course
            </h1>

            <p className="text-blue-400 mt-2">
              Frontend Development
            </p>

            <div className="flex flex-wrap gap-6 mt-6 text-gray-400">

              <div className="flex items-center gap-2">
                <Clock size={18} />
                5 Hours
              </div>

              <div className="flex items-center gap-2">
                <Eye size={18} />
                52K Views
              </div>

            </div>

            <p className="mt-6 text-gray-300 leading-8">
              Learn React from beginner to advanced level by building
              real-world projects. Understand components, hooks,
              routing, API integration, state management and deployment
              with modern React best practices.
            </p>

          </div>

          <div>

            <span className="flex items-center gap-2 bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold shadow-lg">

              <Crown size={18} />

              Premium

            </span>

          </div>

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

      {/* Related Videos */}

      <div className="mt-10">

        <h2 className="text-3xl font-bold mb-6">
          Related Videos
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            "Node JS Masterclass",
            "MongoDB Complete Guide",
            "JavaScript Advanced",
          ].map((video) => (
            <div
              key={video}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:bg-gray-800 hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="h-36 bg-gray-800 rounded-xl flex items-center justify-center mb-5">

                <Play className="text-blue-500" size={36} />

              </div>

              <h3 className="text-xl font-semibold">
                {video}
              </h3>

              <p className="text-gray-400 mt-2">
                Click to explore this course.
              </p>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default VideoDetails;