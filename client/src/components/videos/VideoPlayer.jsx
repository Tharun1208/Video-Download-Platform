import React from "react";
import { Play } from "lucide-react";

function VideoPlayer({
  title = "React Full Course",
  thumbnail = ""
}) {
  return (
    <div className="bg-black border border-gray-800 rounded-2xl h-[500px] flex items-center justify-center relative overflow-hidden">

      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950"></div>
      )}

      <button className="relative z-10 bg-blue-600 hover:bg-blue-700 p-6 rounded-full transition duration-300">

        <Play
          size={70}
          className="text-white ml-1"
        />

      </button>

    </div>
  );
}

export default VideoPlayer;