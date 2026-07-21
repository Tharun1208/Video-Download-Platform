import React from "react";
import DownloadCard from "../components/downloads/DownloadCard";

const downloads = [
  {
    title: "React Full Course",
    category: "Frontend Development",
    date: "18 July 2026",
    count: 1,
    plan: "Free",
  },
  {
    title: "Node JS Masterclass",
    category: "Backend Development",
    date: "17 July 2026",
    count: 3,
    plan: "Premium",
  },
  {
    title: "MongoDB Complete Guide",
    category: "Database",
    date: "16 July 2026",
    count: 2,
    plan: "Premium",
  },
];

function Downloads() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            My Downloads
          </h1>

          <p className="text-gray-400 mt-2">
            Access all your downloaded videos in one place.
          </p>

        </div>

        <div className="mt-4 md:mt-0 bg-blue-600/20 border border-blue-500 text-blue-400 px-5 py-2 rounded-full transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30">

          {downloads.length} Videos Downloaded

        </div>

      </div>

      {/* Download Cards */}

      <div className="space-y-6">

        {downloads.map((video, index) => (
          <DownloadCard
            key={index}
            video={video}
          />
        ))}

      </div>

    </div>
  );
}

export default Downloads;