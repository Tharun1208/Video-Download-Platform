import React from "react";

import StatsCard from "../components/dashboard/StatsCard";
import VideoCard from "../components/dashboard/VideoCard";
import DownloadStatus from "../components/dashboard/DownloadStatus";
import RecentDownloads from "../components/dashboard/RecentDownloads";

const videos = [
  {
    id: 1,
    title: "React Full Course",
    category: "Frontend",
    duration: "5 Hours",
    premium: false,
  },
  {
    id: 2,
    title: "Node JS Masterclass",
    category: "Backend",
    duration: "3 Hours",
    premium: true,
  },
  {
    id: 3,
    title: "MongoDB Complete Guide",
    category: "Database",
    duration: "2 Hours",
    premium: true,
  },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold">

            Welcome Back, Tharun 👋

          </h1>

          <p className="text-gray-400 mt-2">

            Manage your videos, downloads and subscription from one place.

          </p>

        </div>

        <div className="mt-5 md:mt-0">

          <span className="bg-blue-600/20 border border-blue-500 text-blue-400 px-5 py-2 rounded-full transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30">

            Free Plan

          </span>

        </div>

      </div>

      {/* Stats */}

      <section>

        <h2 className="text-2xl font-semibold mb-6">

          Dashboard Overview

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <StatsCard
            title="Downloads Today"
            value="1 / 1"
          />

          <StatsCard
            title="Current Plan"
            value="Free"
          />

          <StatsCard
            title="Total Downloads"
            value="25"
          />

        </div>

      </section>

      {/* Download Status */}

      <section className="mt-10">

        <DownloadStatus />

      </section>

      {/* Trending Videos */}

      <section className="mt-12">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-semibold">

            Trending Videos

          </h2>

          <button className="text-blue-500 hover:text-blue-400 transition">

            View All

          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {videos.map((video) => (

            <VideoCard
              key={video.id}
              video={video}
            />

          ))}

        </div>

      </section>

      {/* Recent Downloads */}

      <section className="mt-12">

        <RecentDownloads />

      </section>

    </div>
  );
}

export default Dashboard;