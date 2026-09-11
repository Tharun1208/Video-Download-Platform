import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Download,
  X,
  Crown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { downloadVideo } from "../../api/downloadApi";
import ConfirmationModal from "../common/ConfirmationModal";

function DownloadButton({ video }) {
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPexels =
    typeof video?.source === "string" &&
    video.source.trim().toLowerCase() === "pexels";

  const closePopup = () => {
    if (loading) return;
    setShowPopup(false);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"],
      });
    } catch {
      // Ignore if canvas is not supported
    }
  };

  const startDownload = (url, filename) => {
    if (!url) {
      throw new Error("Video download URL is not available.");
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "video.mp4";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerConfetti();
  };

  const handleDownloadClick = () => {
    if (loading) return;
    if (!video) {
      setSuccess(false);
      setMessage("Video information is not available.");
      setShowPopup(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const proceedWithDownload = async () => {
    setShowConfirmModal(false);
    if (loading) return;

    if (!video) {
      setSuccess(false);
      setMessage("Video information is not available.");
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      setMessage("Checking your download limit...");
      setShowPopup(true);

      if (isPexels) {
        if (!video.videoUrl) {
          throw new Error("Pexels video download URL is not available.");
        }

        const pexelsId = video.pexelsId || video.id || video._id;
        if (!pexelsId) {
          throw new Error("Pexels video ID is missing.");
        }

        const videoId = String(pexelsId).startsWith("pexels-")
          ? String(pexelsId)
          : `pexels-${pexelsId}`;

        const response = await downloadVideo(videoId, {
          title: video.title || "Pexels Video",
          thumbnail: video.thumbnail || "",
          videoUrl: video.videoUrl,
          source: "Pexels",
        });

        if (!response?.data?.success) {
          throw new Error(
            response?.data?.message || "Download could not be completed."
          );
        }

        setMessage("Download approved. Starting download...");
        startDownload(
          video.videoUrl,
          `${video.title || "pexels-video"}.mp4`
        );
        setSuccess(true);
        setMessage("Download started successfully!");
        return;
      }

      const mongoVideoId = video._id || video.id;
      const isValidMongoId =
        typeof mongoVideoId === "string" && /^[a-fA-F0-9]{24}$/.test(mongoVideoId);

      if (!isValidMongoId) {
        throw new Error("Invalid video ID. This video does not have a valid MongoDB ID.");
      }

      const response = await downloadVideo(mongoVideoId);
      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message || "Download could not be completed."
        );
      }

      const actualDownloadUrl = response?.data?.downloadUrl || video?.videoUrl;
      if (!actualDownloadUrl) {
        throw new Error("Video download URL is not available.");
      }

      setMessage("Download approved. Starting download...");
      startDownload(actualDownloadUrl, `${video.title || "video"}.mp4`);
      setSuccess(true);
      setMessage("Download started successfully!");
    } catch (error) {
      setSuccess(false);
      setMessage(
        error?.response?.data?.message || error?.message || "Download failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const lowerMessage = message.toLowerCase();
  const isLimitError =
    lowerMessage.includes("limit") ||
    lowerMessage.includes("upgrade") ||
    lowerMessage.includes("downloads/day");

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleDownloadClick}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} className="transition-transform group-hover:translate-y-0.5" />
        )}
        <span>{loading ? "Checking..." : "Download"}</span>
      </motion.button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPopup && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closePopup}
                  className="fixed inset-0 bg-black/70 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border theme-border theme-card p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b theme-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <Download size={20} />
                      </div>
                      <h2 className="text-lg font-bold theme-text">
                        Download Status
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closePopup}
                      disabled={loading}
                      className="rounded-full p-2 theme-text-muted hover:bg-gray-500/10 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="py-6 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 size={36} className="animate-spin text-blue-500" />
                        <p className="text-sm font-medium theme-text-secondary">
                          Checking your download limit...
                        </p>
                      </div>
                    ) : (
                      <div>
                        {success && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                          >
                            <CheckCircle size={36} />
                          </motion.div>
                        )}

                        {!success && isLimitError && (
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <Crown size={34} />
                          </div>
                        )}

                        {!success && !isLimitError && (
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                            <AlertCircle size={34} />
                          </div>
                        )}

                        <p className={`text-sm font-semibold leading-6 ${
                          success
                            ? "text-emerald-500"
                            : isLimitError
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}>
                          {message}
                        </p>

                        {isLimitError && (
                          <p className="mt-2 text-xs theme-text-muted">
                            Upgrade your subscription to get higher daily download limits.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {isLimitError && (
                      <Link to="/subscription" className="flex-1" onClick={closePopup}>
                        <button
                          type="button"
                          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all active:scale-95 cursor-pointer"
                        >
                          Upgrade Plan
                        </button>
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={closePopup}
                      className={`rounded-xl py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                        isLimitError
                          ? "flex-1 border theme-border theme-text hover:bg-gray-500/10"
                          : "w-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                      }`}
                    >
                      {loading ? "Processing..." : isLimitError ? "Close" : "OK"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* DOWNLOAD CONFIRMATION & PERMISSION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={proceedWithDownload}
        title="Confirm Download"
        message={`Do you want to download "${video?.title || "this video"}"? If you download, this will count towards your daily download limit. If you cancel, your download count will not be affected.`}
        confirmText="Download"
        cancelText="Cancel"
        type="primary"
        icon={Download}
      />
    </>
  );
}

export default DownloadButton;