import React from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import VideoCard from "../dashboard/VideoCard";
import Loader from "../common/Loader";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

function VideoGrid({
  videos = [],
  loading,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <div
            key={key}
            className="flex flex-col overflow-hidden rounded-2xl border theme-border theme-card shadow-sm animate-pulse"
          >
            {/* Thumbnail skeleton */}
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-800/80" />

            {/* Details skeleton */}
            <div className="p-5 flex flex-col justify-between flex-1 gap-4">
              <div className="space-y-2.5">
                <div className="h-4 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800/80" />
                <div className="h-3 w-1/2 rounded-md bg-gray-200 dark:bg-gray-800/80" />
                <div className="h-2.5 w-1/4 rounded-md bg-blue-500/20 mt-2" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-2 pt-3 border-t theme-border">
                <div className="h-9 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800/80" />
                <div className="h-9 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800/80" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center py-16 theme-text-secondary"
      >
        <div className="w-full max-w-md rounded-3xl border theme-border theme-card px-8 py-12 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Video size={32} />
          </div>

          <p className="text-xl font-bold theme-text">
            No videos found
          </p>

          <p className="mt-2 text-sm theme-text-secondary">
            Try changing your search or selecting another category.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <motion.div
          key={`${video.source || "db"}-${video._id || video.videoId || "video"}-${index}`}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.12 }}
          transition={{
            duration: 0.45,
            ease: [0.25, 0.1, 0.25, 1],
            delay: (index % 3) * 0.08,
          }}
        >
          <VideoCard video={video} />
        </motion.div>
      ))}
    </div>
  );
}

export default VideoGrid;