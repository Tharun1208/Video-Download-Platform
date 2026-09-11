import React, { useEffect, useState } from "react";
import {
  Download,
  Trash2,
  Calendar,
  Clock,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getDownloadHistory,
  deleteDownload,
} from "../api/downloadApi";
import ConfirmationModal from "../components/common/ConfirmationModal";

function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // =========================================================
  // FETCH DOWNLOAD HISTORY
  // =========================================================

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);

      const response = await getDownloadHistory();

      console.log("Download history:", response.data);

      if (response?.data?.success) {
        setDownloads(response.data.downloads || []);
      } else {
        setDownloads([]);
      }
    } catch (error) {
      console.error("Download history error:", error);
      console.error(
        "Backend response:",
        error?.response?.data
      );

      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE DOWNLOAD
  // =========================================================

  const handleDelete = (downloadId) => {
    if (!downloadId) return;
    setDeleteConfirmId(downloadId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      setDeletingId(deleteConfirmId);
      const response = await deleteDownload(deleteConfirmId);

      if (response?.data?.success) {
        setDownloads((previousDownloads) =>
          previousDownloads.filter((item) => item._id !== deleteConfirmId)
        );
        toast.success("Download removed from history");
      }
    } catch (error) {
      console.error("Delete download error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete download."
      );
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="
          min-h-[70vh]
          theme-bg
          theme-text
          flex
          items-center
          justify-center
          transition-colors
          duration-500
        "
      >
        <div className="text-center">

          <div
            className="
              relative
              w-12
              h-12
              mx-auto
            "
          >
            <div
              className="
                absolute
                inset-0
                rounded-full
                border-4
                border-blue-500/20
              "
            />

            <div
              className="
                absolute
                inset-0
                rounded-full
                border-4
                border-transparent
                border-t-blue-500
                animate-spin
              "
            />
          </div>

          <p
            className="
              mt-5
              text-sm
              theme-text-secondary
            "
          >
            Loading downloads...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        transition-colors
        duration-500
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
    >

      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-4">

            {/* ICON */}

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-500/10
                border
                border-blue-500/20
              "
            >
              <Download
                size={27}
                className="text-blue-500"
              />
            </div>

            {/* TITLE */}

            <div>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-extrabold
                  tracking-tight
                  theme-text
                "
              >
                Downloads
              </h1>

              <p
                className="
                  mt-1.5
                  text-sm
                  sm:text-base
                  theme-text-secondary
                "
              >
                Your downloaded videos appear here.
              </p>

            </div>

          </div>

          {/* DOWNLOAD COUNT */}

          {downloads.length > 0 && (
            <div
              className="
                flex
                items-center
                gap-2
                w-fit
                rounded-xl
                border
                theme-border
                theme-card
                px-4
                py-2.5
                shadow-sm
              "
            >
              <Download
                size={17}
                className="text-blue-500"
              />

              <span
                className="
                  text-sm
                  theme-text-secondary
                "
              >
                Total
              </span>

              <span
                className="
                  text-sm
                  font-bold
                  text-blue-500
                "
              >
                {downloads.length}
              </span>
            </div>
          )}

        </div>

        {/* =====================================================
            HEADER DIVIDER
        ===================================================== */}

        <div
          className="
            h-px
            w-full
            bg-gradient-to-r
            from-blue-500/40
            via-blue-500/10
            to-transparent
            mb-8
          "
        />

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {downloads.length === 0 ? (

          <div
            className="
              relative
              overflow-hidden
              theme-card
              theme-border
              border
              rounded-3xl
              px-6
              py-16
              sm:py-20
              text-center
              transition-all
              duration-500
            "
          >

            {/* Background decoration */}

            <div
              className="
                pointer-events-none
                absolute
                -top-20
                -right-20
                h-48
                w-48
                rounded-full
                bg-blue-500/5
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-20
                -left-20
                h-48
                w-48
                rounded-full
                bg-indigo-500/5
                blur-3xl
              "
            />

            <div className="relative">

              <div
                className="
                  mx-auto
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-3xl
                  bg-blue-500/10
                  border
                  border-blue-500/20
                "
              >
                <Download
                  size={36}
                  className="text-blue-500"
                />
              </div>

              <h2
                className="
                  mt-6
                  text-2xl
                  sm:text-3xl
                  font-bold
                  theme-text
                "
              >
                No downloads yet
              </h2>

              <p
                className="
                  mt-3
                  max-w-md
                  mx-auto
                  text-sm
                  sm:text-base
                  theme-text-secondary
                "
              >
                Download videos from StreamVault
                and they will appear here.
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                DOWNLOAD SUMMARY
            ================================================= */}

            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    theme-text-secondary
                  "
                >
                  Your download history
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-bold
                    theme-text
                  "
                >
                  Recently Downloaded
                </h2>

              </div>

            </div>

            {/* =================================================
                DOWNLOAD GRID
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
              "
            >

              {downloads.map((item) => {

                // =================================================
                // SUPPORT MONGODB + PEXELS
                // =================================================

                const isPexels =
                  Boolean(item.externalVideo);

                const video = item.video;
                const externalVideo = item.externalVideo;

                // =================================================
                // VIDEO INFORMATION
                // =================================================

                const title = isPexels
                  ? externalVideo?.title ||
                    "Pexels Video"
                  : video?.title ||
                    "Untitled Video";

                const thumbnail = isPexels
                  ? externalVideo?.thumbnail
                  : video?.thumbnail;

                const category = isPexels
                  ? (externalVideo?.category && externalVideo.category.toLowerCase() !== "pexels"
                      ? externalVideo.category
                      : "General")
                  : video?.category ||
                    "General";

                const downloadDate =
                  item.downloadedAt ||
                  item.createdAt;

                return (
                  <div
                    key={item._id}
                    className="
                      group
                      relative
                      overflow-hidden
                      theme-card
                      theme-border
                      border
                      rounded-2xl
                      transition-all
                      duration-500
                      hover:-translate-y-1.5
                      hover:border-blue-500/50
                      hover:shadow-xl
                      hover:shadow-blue-500/10
                    "
                  >

                    {/* =================================================
                        THUMBNAIL
                    ================================================= */}

                    <div
                      className="
                        relative
                        h-52
                        sm:h-56
                        overflow-hidden
                        bg-gray-100
                        dark:bg-gray-900
                      "
                    >

                      {thumbnail ? (

                        <img
                          src={thumbnail}
                          alt={title}
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-110
                          "
                        />

                      ) : (

                        <div
                          className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                            bg-gray-100
                            dark:bg-gray-900
                          "
                        >
                          <div
                            className="
                              h-16
                              w-16
                              rounded-2xl
                              bg-blue-500/10
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <Video
                              size={34}
                              className="
                                text-blue-400
                              "
                            />
                          </div>
                        </div>

                      )}

                      {/* IMAGE OVERLAY */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/50
                          via-transparent
                          to-transparent
                        "
                      />

                      {/* SOURCE BADGE */}
                      {!isPexels && (
                        <div
                          className="
                            absolute
                            top-4
                            left-4
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-black/65
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-white
                            backdrop-blur-md
                            border
                            border-white/10
                          "
                        >
                          <Video size={13} />
                          Video
                        </div>
                      )}

                      {/* DOWNLOAD ICON */}

                      <div
                        className="
                          absolute
                          right-4
                          top-4
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-black/50
                          text-white
                          backdrop-blur-md
                          opacity-0
                          transition-all
                          duration-300
                          group-hover:opacity-100
                        "
                      >
                        <Download size={17} />
                      </div>

                    </div>

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div className="p-5">

                      {/* TITLE */}

                      <h2
                        className="
                          text-lg
                          sm:text-xl
                          font-bold
                          theme-text
                          line-clamp-2
                          leading-snug
                          min-h-[3.5rem]
                        "
                      >
                        {title}
                      </h2>

                      {/* CATEGORY */}

                      {category && category.toLowerCase() !== "pexels" && (
                        <div className="mt-3">
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              bg-blue-500/10
                              border
                              border-blue-500/20
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              text-blue-500
                            "
                          >
                            {category}
                          </span>
                        </div>
                      )}

                      {/* =================================================
                          DATE & TIME
                      ================================================= */}

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >

                        {/* DATE */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2.5
                            rounded-xl
                            border
                            theme-border
                            bg-blue-500/5
                            px-3
                            py-2.5
                          "
                        >
                          <Calendar
                            size={16}
                            className="text-blue-500"
                          />

                          <div className="min-w-0">

                            <p
                              className="
                                text-[10px]
                                uppercase
                                tracking-wider
                                theme-text-muted
                              "
                            >
                              Date
                            </p>

                            <p
                              className="
                                mt-0.5
                                truncate
                                text-xs
                                font-medium
                                theme-text
                              "
                            >
                              {formatDate(
                                downloadDate
                              )}
                            </p>

                          </div>

                        </div>

                        {/* TIME */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2.5
                            rounded-xl
                            border
                            theme-border
                            bg-blue-500/5
                            px-3
                            py-2.5
                          "
                        >
                          <Clock
                            size={16}
                            className="text-blue-500"
                          />

                          <div className="min-w-0">

                            <p
                              className="
                                text-[10px]
                                uppercase
                                tracking-wider
                                theme-text-muted
                              "
                            >
                              Time
                            </p>

                            <p
                              className="
                                mt-0.5
                                truncate
                                text-xs
                                font-medium
                                theme-text
                              "
                            >
                              {formatTime(
                                downloadDate
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          DELETE BUTTON
                      ================================================= */}

                      <div className="mt-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item._id
                            )
                          }
                          disabled={
                            deletingId ===
                            item._id
                          }
                          className="
                            group/delete
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            py-3
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/5
                            text-red-500
                            font-semibold
                            text-sm
                            transition-all
                            duration-300
                            hover:bg-red-500
                            hover:text-white
                            hover:border-red-500
                            hover:shadow-lg
                            hover:shadow-red-500/20
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            disabled:hover:bg-red-500/5
                            disabled:hover:text-red-500
                          "
                        >

                          <Trash2
                            size={17}
                            className="
                              transition-transform
                              duration-300
                              group-hover/delete:scale-110
                            "
                          />

                          {deletingId ===
                          item._id
                            ? "Deleting..."
                            : "Delete History"}

                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </>

        )}

      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Download History?"
        message="Are you sure you want to remove this video from your download history? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        type="danger"
        loading={Boolean(deletingId)}
      />

    </div>
  );
}

export default Downloads;