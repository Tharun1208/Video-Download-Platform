import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Crown,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import DownloadButton from "../videos/DownloadButton";

function VideoCard({ video = {} }) {
  const [actualDuration, setActualDuration] = useState(null);
  const [durationLoading, setDurationLoading] = useState(false);

  if (!video || (!video._id && !video.id && !video.videoId)) {
    return (
      <div className="theme-card theme-border border rounded-2xl p-5 shadow-sm">
        <p className="text-red-500 font-medium">Invalid video data</p>
      </div>
    );
  }

  const videoId = String(video._id || video.id || video.videoId);
  const isPexels =
    typeof video.source === "string" &&
    video.source.trim().toLowerCase() === "pexels";

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "N/A";
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isPexels || !video.videoUrl) return;
    if (video.duration && video.duration !== "N/A" && video.duration !== "Loading...") return;

    let cancelled = false;
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.muted = true;
    setDurationLoading(true);

    const handleMetadata = () => {
      if (cancelled) return;
      const seconds = videoElement.duration;
      if (Number.isFinite(seconds) && seconds > 0) {
        setActualDuration(formatDuration(seconds));
      }
      setDurationLoading(false);
      videoElement.removeAttribute("src");
      videoElement.load();
    };

    const handleError = () => {
      if (cancelled) return;
      setDurationLoading(false);
      videoElement.removeAttribute("src");
      videoElement.load();
    };

    videoElement.addEventListener("loadedmetadata", handleMetadata);
    videoElement.addEventListener("error", handleError);
    videoElement.src = video.videoUrl;
    videoElement.load();

    return () => {
      cancelled = true;
      videoElement.removeEventListener("loadedmetadata", handleMetadata);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeAttribute("src");
      videoElement.load();
    };
  }, [isPexels, video.videoUrl, video.duration]);

  const displayDuration =
    video.duration && video.duration !== "N/A" && video.duration !== "Loading..."
      ? video.duration
      : isPexels
      ? durationLoading
        ? "Loading..."
        : actualDuration || "N/A"
      : "N/A";

  const targetLink = isPexels ? "/pexels-video" : `/video/${videoId}`;
  const targetState = isPexels
    ? {
        video: {
          ...video,
          duration: actualDuration || video.duration || null,
        },
      }
    : undefined;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border theme-border theme-card shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-colors duration-300"
    >
      {/* THUMBNAIL */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <Link to={targetLink} state={targetState} className="block h-full w-full">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title || "Video"}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <Play size={40} />
            </div>
          )}

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/50"
            >
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </motion.div>
          </div>
        </Link>

        {/* Gradient shadow overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {video.isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-1 text-[11px] font-bold text-black shadow-lg">
              <Crown size={13} />
              Premium
            </span>
          )}
        </div>


        {displayDuration !== "N/A" && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md">
            <Clock size={11} />
            {displayDuration}
          </div>
        )}
      </div>

      {/* CARD DETAILS */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link to={targetLink} state={targetState}>
            <h2 className="line-clamp-2 text-base font-bold leading-6 theme-text transition-colors duration-200 group-hover:text-blue-500">
              {video.title || "Untitled Video"}
            </h2>
          </Link>

          <p className="mt-1.5 inline-block text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
            {video.category || "General"}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-5 flex items-center gap-2 pt-2 border-t theme-border">
          <Link
            to={targetLink}
            state={targetState}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg transition-all active:scale-95"
          >
            <Play size={15} fill="currentColor" />
            Watch
          </Link>

          <div className="flex-1">
            <DownloadButton
              video={{
                ...video,
                _id: videoId,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VideoCard;