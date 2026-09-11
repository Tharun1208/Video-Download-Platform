import React, { useEffect, useState } from "react";
import {
  Mail,
  Crown,
  Download,
  Calendar,
  Edit,
  CreditCard,
  ArrowRight,
  Play,
  Clock,
  Video,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import { getProfile } from "../api/userApi";
import { getDownloadHistory } from "../api/downloadApi";
import toast from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // =========================================================
  // FETCH PROFILE & DOWNLOADS
  // =========================================================

  useEffect(() => {
    fetchProfile();
    fetchDownloads();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();

      if (response?.data?.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Profile error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load profile",
        { id: "profile-load-err" }
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async () => {
    try {
      setLoadingDownloads(true);
      const response = await getDownloadHistory();

      if (response?.data?.success) {
        setDownloads(response.data.downloads || []);
      }
    } catch (error) {
      console.error("Downloads fetch error:", error);
    } finally {
      setLoadingDownloads(false);
    }
  };

  const planLimits = {
    Free: 1,
    Bronze: 5,
    Silver: 15,
    Gold: Infinity,
    free: 1,
    bronze: 5,
    silver: 15,
    gold: Infinity,
  };

  const currentPlan = user?.plan || "Free";
  const limit = planLimits[currentPlan] || 1;
  const isGold = currentPlan === "Gold";
  const usedToday = user?.downloadsToday || 0;
  const isLimitReached = !isGold && usedToday >= limit;
  const remainingToday = isGold ? "Unlimited" : Math.max(0, limit - usedToday);

  const handleDirectDownload = (url, filename) => {
    if (!url) {
      toast.error("Video download URL is not available.", { id: "profile-dl-err" });
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "video.mp4";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
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
              w-10
              h-10
              mx-auto
              rounded-full
              border-4
              border-blue-500
              border-t-transparent
              animate-spin
            "
          />

          <p className="mt-4 theme-text-secondary">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        p-4
        sm:p-6
        transition-colors
        duration-500
      "
    >
      {/* =====================================================
          HEADING
      ===================================================== */}

      <div className="mb-8">
        <h1
          className="
            text-3xl
            sm:text-4xl
            font-bold
            theme-text
          "
        >
          My Profile
        </h1>

        <p className="mt-2 theme-text-secondary">
          Manage your profile, subscription and account
          information.
        </p>
      </div>

      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <div
        className="
          theme-card
          theme-border
          border
          rounded-2xl
          p-6
          sm:p-8
          transition-all
          duration-500
          hover:border-blue-500
          hover:shadow-2xl
          hover:shadow-blue-500/10
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            items-center
            gap-8
          "
        >
          {/* =================================================
              PROFILE INITIAL
          ================================================= */}

          <div
            className="
              w-24
              h-24
              rounded-full
              bg-blue-600
              flex
              items-center
              justify-center
              text-4xl
              font-bold
              text-white
              shadow-lg
              shadow-blue-500/20
              flex-shrink-0
            "
          >
            {(user?.username || user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* =================================================
              USER DETAILS
          ================================================= */}

          <div className="flex-1 text-center md:text-left">
            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                theme-text
              "
            >
              {user?.name || "User"}
            </h2>

            <p
              className="
                flex
                items-center
                justify-center
                md:justify-start
                gap-2
                theme-text-secondary
                mt-3
              "
            >
              <Mail size={18} />

              {user?.email || "No email available"}
            </p>

            <Link to="/edit-profile">
              <Button
                icon={<Edit size={18} />}
                className="mt-6"
              >
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
          mt-8
        "
      >
        {/* ===================================================
            TOTAL DOWNLOADS
        =================================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-500
            hover:border-blue-500
            hover:shadow-xl
            hover:shadow-blue-500/10
            hover:-translate-y-1
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
              "
            >
              <Download
                size={22}
                className="text-blue-500"
              />
            </div>

            <h3 className="font-semibold theme-text-secondary">
              Total Downloads
            </h3>
          </div>

          <p
            className="
              text-4xl
              font-bold
              theme-text
              mt-5
            "
          >
            {user?.totalDownloads || 0}
          </p>

          <p className="text-sm theme-text-secondary mt-2">
            Videos downloaded
          </p>
        </div>

        {/* ===================================================
            CURRENT PLAN
        =================================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-500
            hover:border-yellow-500
            hover:shadow-xl
            hover:shadow-yellow-500/10
            hover:-translate-y-1
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-yellow-500/10
                flex
                items-center
                justify-center
              "
            >
              <Crown
                size={22}
                className="text-yellow-500"
              />
            </div>

            <h3 className="font-semibold theme-text-secondary">
              Current Plan
            </h3>
          </div>

          <p
            className="
              text-4xl
              font-bold
              theme-text
              mt-5
            "
          >
            {user?.plan || "Free"}
          </p>

          <p className="text-sm theme-text-secondary mt-2">
            Active subscription plan
          </p>
        </div>

        {/* ===================================================
            JOINED
        =================================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-500
            hover:border-green-500
            hover:shadow-xl
            hover:shadow-green-500/10
            hover:-translate-y-1
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-green-500/10
                flex
                items-center
                justify-center
              "
            >
              <Calendar
                size={22}
                className="text-green-500"
              />
            </div>

            <h3 className="font-semibold theme-text-secondary">
              Joined
            </h3>
          </div>

          <p
            className="
              text-2xl
              font-bold
              theme-text
              mt-5
            "
          >
            {user?.createdAt
              ? new Date(
                  user.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>

          <p className="text-sm theme-text-secondary mt-2">
            Account creation date
          </p>
        </div>
      </div>

      {/* =====================================================
          DOWNLOADS SECTION
      ===================================================== */}

      <div
        className="
          mt-8
          theme-card
          theme-border
          border
          rounded-2xl
          p-6
          sm:p-8
          transition-all
          duration-500
          hover:border-blue-500
          hover:shadow-xl
          hover:shadow-blue-500/10
        "
      >
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b theme-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Download size={24} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold theme-text">
                  Downloads Section
                </h2>

                <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                  {downloads.length} {downloads.length === 1 ? "Video" : "Videos"} Downloaded
                </span>
              </div>

              <p className="text-sm theme-text-secondary mt-1">
                Track your downloaded videos, download count, dates, and active plan quota.
              </p>
            </div>
          </div>

          <Link
            to="/downloads"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition"
          >
            <span>View All in Downloads</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* DAILY DOWNLOAD LIMIT RESTRICTION STATUS */}
        <div className="mt-6 rounded-xl p-4 border theme-border theme-card transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLimitReached
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : isGold
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}>
                {isLimitReached ? (
                  <ShieldAlert size={20} />
                ) : isGold ? (
                  <Crown size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm theme-text">
                    Daily Download Quota: {usedToday} / {isGold ? "Unlimited" : limit}
                  </p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isLimitReached
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  }`}>
                    {currentPlan} Plan
                  </span>
                </div>

                <p className="text-xs theme-text-secondary mt-1">
                  {currentPlan === "Free"
                    ? isLimitReached
                      ? "Free user daily limit reached (1 download/day). Upgrade to download more videos today."
                      : "Free users are allowed 1 download per day. Limit resets daily."
                    : isGold
                    ? "Gold users have unlimited daily downloads."
                    : `${remainingToday} download(s) remaining today for your ${currentPlan} plan.`}
                </p>
              </div>
            </div>

            {currentPlan === "Free" && (
              <Link to="/subscription" className="shrink-0">
                <Button className="text-xs py-2 px-4 whitespace-nowrap">
                  {isLimitReached ? "Upgrade to Download More" : "Upgrade Plan"}
                </Button>
              </Link>
            )}
          </div>

          {/* PROGRESS BAR */}
          {!isGold && (
            <div className="mt-3">
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isLimitReached ? "bg-amber-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min((usedToday / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* DOWNLOADED VIDEOS LIST */}
        <div className="mt-6">
          {loadingDownloads ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-sm theme-text-secondary">Loading downloaded videos...</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="py-12 px-4 rounded-xl border border-dashed theme-border text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                <Download size={28} />
              </div>
              <h3 className="font-bold theme-text text-base">No Downloaded Videos Yet</h3>
              <p className="text-xs theme-text-secondary mt-1 max-w-sm mx-auto">
                Explore our video catalog and download videos to watch them offline.
              </p>
              <Link to="/browse-videos" className="inline-block mt-4">
                <Button icon={<Video size={16} />}>
                  Browse Videos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {downloads.slice(0, 6).map((item, index) => {
                const isPexels = Boolean(item.externalVideo);
                const video = item.video;
                const externalVideo = item.externalVideo;
                const videoDetails = item.videoDetails;

                const title =
                  videoDetails?.title ||
                  (isPexels ? externalVideo?.title : video?.title) ||
                  "Untitled Video";

                const thumbnail =
                  videoDetails?.thumbnail ||
                  (isPexels ? externalVideo?.thumbnail : video?.thumbnail);

                const category =
                  videoDetails?.category ||
                  (isPexels
                    ? (externalVideo?.category && externalVideo.category.toLowerCase() !== "pexels" ? externalVideo.category : "General")
                    : video?.category) ||
                  "General";

                const source =
                  videoDetails?.source ||
                  (isPexels
                    ? ""
                    : video?.youtubeId
                    ? "YouTube"
                    : "Platform");

                const downloadUrl =
                  videoDetails?.videoUrl ||
                  (isPexels ? externalVideo?.videoUrl : video?.videoUrl);

                const downloadDate =
                  item.downloadDate ||
                  item.downloadedAt ||
                  item.createdAt;

                const formattedDate = downloadDate
                  ? new Date(downloadDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent";

                const formattedTime = downloadDate
                  ? new Date(downloadDate).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                const userPlanAtDownload =
                  item.userPlan || user?.plan || "Free";

                const downloadNum =
                  item.downloadCount || downloads.length - index;

                return (
                  <div
                    key={item._id || index}
                    className="
                      theme-card
                      theme-border
                      border
                      rounded-xl
                      overflow-hidden
                      flex
                      flex-col
                      transition-all
                      duration-300
                      hover:border-blue-500/40
                      hover:-translate-y-1
                      hover:shadow-lg
                    "
                  >
                    {/* THUMBNAIL */}
                    <div className="relative h-40 bg-gray-900 overflow-hidden shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                          <Video size={32} />
                        </div>
                      )}

                      {/* BADGES OVERLAY */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        {source && source.toLowerCase() !== "pexels" && (
                          <span className="bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {source}
                          </span>
                        )}
                        {category && category.toLowerCase() !== "pexels" && (
                          <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {category}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="bg-purple-600/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                          #{downloadNum}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm theme-text line-clamp-1" title={title}>
                          {title}
                        </h3>

                        {/* TRACKING METADATA: PLAN, DATE, TIME */}
                        <div className="mt-3 space-y-1.5 text-xs theme-text-secondary">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-blue-500" />
                              <span>{formattedDate}</span>
                              {formattedTime && <span className="theme-text-muted">({formattedTime})</span>}
                            </span>

                            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-500">
                              <Crown size={12} />
                              {userPlanAtDownload} Plan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="mt-4 pt-3 border-t theme-border flex items-center gap-2">
                        {video?._id ? (
                          <Link to={`/video/${video._id}`} className="flex-1">
                            <button
                              type="button"
                              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Play size={13} />
                              <span>Watch</span>
                            </button>
                          </Link>
                        ) : null}

                        {downloadUrl && (
                          <button
                            type="button"
                            onClick={() => handleDirectDownload(downloadUrl, `${title}.mp4`)}
                            className="flex-1 py-2 px-3 rounded-lg border theme-border hover:border-blue-500 text-xs font-semibold theme-text flex items-center justify-center gap-1.5 transition cursor-pointer"
                            title="Download file again"
                          >
                            <Download size={13} className="text-blue-500" />
                            <span>Save File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}

      <div
        className="
          mt-8
          theme-card
          theme-border
          border
          rounded-2xl
          p-6
          transition-all
          duration-500
          hover:border-purple-500
          hover:shadow-xl
          hover:shadow-purple-500/10
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-5
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-4">
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-purple-500/10
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >
              <CreditCard
                size={24}
                className="text-purple-500"
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  theme-text
                "
              >
                Payment History
              </h2>

              <p
                className="
                  theme-text-secondary
                  text-sm
                  mt-1
                "
              >
                View your subscription payments and
                transactions.
              </p>
            </div>
          </div>

          {/* VIEW BUTTON */}

          <Link to="/payment-history">
            <Button
              variant="primary"
              icon={<ArrowRight size={18} />}
              className="whitespace-nowrap"
            >
              View Payment History
            </Button>
          </Link>
        </div>
      </div>

      {/* =====================================================
          PREMIUM BANNER
      ===================================================== */}

      {user?.plan === "Free" && (
        <div
          className="
            mt-8
            rounded-2xl
            p-6
            sm:p-8
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            transition-all
            duration-500
            hover:shadow-2xl
            hover:shadow-purple-500/20
            hover:-translate-y-1
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              items-center
              justify-between
              gap-6
            "
          >
            {/* LEFT */}

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Upgrade To Premium
              </h2>

              <p className="mt-2 text-blue-100">
                Get more daily downloads, premium videos
                and exclusive features.
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-3
                  text-sm
                "
              >
                <span
                  className="
                    bg-white/20
                    text-white
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  Faster Downloads
                </span>

                <span
                  className="
                    bg-white/20
                    text-white
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  Premium Videos
                </span>

                <span
                  className="
                    bg-white/20
                    text-white
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  Exclusive Features
                </span>
              </div>
            </div>

            {/* BUTTON */}

            <Link to="/subscription">
              <Button
                variant="light"
                className="
                  hover:scale-105
                  transition-all
                  duration-300
                  whitespace-nowrap
                "
              >
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;