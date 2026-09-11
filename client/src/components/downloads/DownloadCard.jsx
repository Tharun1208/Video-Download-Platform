import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Download,
  Play,
  Crown,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Button from "../common/Button";
import DownloadButton from "../videos/DownloadButton";
import ConfirmationModal from "../common/ConfirmationModal";
import { deleteDownload } from "../../api/downloadApi";

function DownloadCard({ video = {} }) {
  const isPexels = Boolean(video.externalVideo);
  const videoDetails = video.videoDetails;

  const title =
    videoDetails?.title ||
    video.video?.title ||
    video.externalVideo?.title ||
    "Untitled Video";

  const thumbnail =
    videoDetails?.thumbnail ||
    video.video?.thumbnail ||
    video.externalVideo?.thumbnail;

  const category =
    videoDetails?.category ||
    video.video?.category ||
    (video.externalVideo?.category && video.externalVideo.category.toLowerCase() !== "pexels"
      ? video.externalVideo.category
      : "General");

  const source =
    videoDetails?.source ||
    (isPexels ? "" : video.video?.youtubeId ? "YouTube" : "Platform");

  const downloadDate =
    video.downloadDate || video.downloadedAt || video.createdAt;

  const downloadedDate = downloadDate
    ? new Date(downloadDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const userPlan = video.userPlan;
  const downloadCount = video.downloadCount;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDownload(video._id);
      toast.success("Download removed successfully");
      setShowDeleteModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Remove download error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove download."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative theme-card theme-border border rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        <div className="w-full md:w-56 h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center relative shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="theme-text-muted">
              Thumbnail
            </span>
          )}

          {source && source.toLowerCase() !== "pexels" && (
            <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {source}
            </span>
          )}
        </div>

        {/* Video Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold theme-text leading-tight group-hover:text-blue-500 transition-colors">
                {title}
              </h2>

              {userPlan && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <Crown size={12} />
                  {userPlan} Plan
                </span>
              )}
            </div>

            {category && category.toLowerCase() !== "pexels" && (
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                {category}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 theme-text-secondary text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Downloaded: {downloadedDate}</span>
              </div>

              {downloadCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Download size={14} />
                  <span>Download #{downloadCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t theme-border">
            <Link
              to={`/video/${video.video?._id}`}
              className="w-full"
            >
              <Button
                variant="success"
                icon={<Play size={16} />}
                fullWidth
              >
                Watch
              </Button>
            </Link>

            <div className="w-full">
              <DownloadButton video={video.video} />
            </div>

            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              fullWidth
              onClick={() => setShowDeleteModal(true)}
            >
              Remove
            </Button>
          </div>
        </div>

        {/* Premium Badge */}
        {video.video?.isPremium && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
              <Crown size={13} />
              Premium
            </span>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Remove Download?"
        message={`Are you sure you want to remove "${title}" from your downloads?`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </motion.div>
  );
}

export default DownloadCard;