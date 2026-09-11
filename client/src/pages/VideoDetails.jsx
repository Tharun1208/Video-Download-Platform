import React, {
  useEffect,
  useState,
} from "react";

import {
  Play,
  Crown,
  Clock,
  Eye,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  SkipForward,
} from "lucide-react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import Button from "../components/common/Button";

import {
  getVideoById,
  getAllVideos,
} from "../api/videoApi";

import {
  getProfile,
} from "../api/userApi";

import DownloadButton from "../components/videos/DownloadButton";

import CustomVideoPlayer from "../components/videos/CustomVideoPlayer";

import CommentSection from "../components/comments/Comments";


function VideoDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [video, setVideo] = useState(null);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [playVideo, setPlayVideo] = useState(true);

  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchPlaylist();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await getProfile();
      if (response?.data?.success && response.data.user) {
        setUser(response.data.user);
        if (response.data.user.plan) {
          localStorage.setItem("user_plan", response.data.user.plan);
        }
      }
    } catch {
      // Guest or unauthenticated
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await getAllVideos({ limit: 12 });
      if (response?.data?.success) {
        setPlaylist(response.data.videos || []);
      }
    } catch (e) {
      console.error("Playlist fetch error:", e);
    }
  };

  const currentIndex = playlist.findIndex((v) => String(v._id) === String(id));
  const nextVideo =
    playlist.length > 1 && currentIndex !== -1
      ? playlist[(currentIndex + 1) % playlist.length]
      : playlist.find((v) => String(v._id) !== String(id)) || null;

  const handleNextVideo = () => {
    if (nextVideo && nextVideo._id) {
      navigate(`/video/${nextVideo._id}`);
      setPlayVideo(true);
    }
  };


  // =====================================================
  // FETCH VIDEO
  // =====================================================

  useEffect(() => {

    if (!id) {

      console.error(
        "Video ID is missing"
      );

      setLoading(false);

      return;
    }


    // ===================================================
    // PREVENT PEXELS VIDEO
    // ===================================================

    if (
      id
        .toLowerCase()
        .startsWith("pexels-")
    ) {

      console.error(
        "Pexels video reached VideoDetails:",
        id
      );

      setLoading(false);

      navigate(
        "/pexels-video",
        {
          replace: true,
        }
      );

      return;
    }


    fetchVideo();

  }, [id, navigate]);


  // =====================================================
  // GET VIDEO
  // =====================================================

  const fetchVideo = async () => {

    try {

      setLoading(true);

      console.log(
        "Fetching MongoDB video:",
        id
      );


      const response =
        await getVideoById(id);


      console.log(
        "Video API response:",
        response.data
      );


      if (
        response?.data?.success &&
        response?.data?.video
      ) {

        console.log(
          "Video loaded successfully:",
          response.data.video
        );

        console.log(
          "Video MongoDB ID:",
          response.data.video._id
        );

        setVideo(
          response.data.video
        );

      } else {

        console.error(
          "Video not found in API response"
        );

        setVideo(null);

      }

    } catch (error) {

      console.error(
        "VideoDetails error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setVideo(null);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className="
          min-h-[70vh]
          flex
          items-center
          justify-center
          theme-text
          px-4
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >

          <div
            className="
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-gray-300
              border-t-blue-600
              dark:border-gray-700
              dark:border-t-blue-500
            "
          />

          <p
            className="
              text-sm
              theme-text-secondary
            "
          >
            Loading video...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // VIDEO NOT FOUND
  // =====================================================

  if (!video) {

    return (

      <div
        className="
          min-h-[70vh]
          flex
          flex-col
          items-center
          justify-center
          text-center
          theme-text
          px-4
        "
      >

        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            theme-border
            theme-card
            p-8
            shadow-lg
          "
        >

          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-100
              text-red-500
              dark:bg-red-500/10
            "
          >

            <Play
              size={28}
            />

          </div>


          <p
            className="
              text-xl
              font-semibold
              theme-text
            "
          >
            Video not found
          </p>


          <p
            className="
              mt-2
              text-sm
              theme-text-secondary
            "
          >
            The video may have been
            removed or is no longer
            available.
          </p>


          <button
            onClick={() =>
              navigate(-1)
            }
            className="
              mt-6
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              transition-all
              duration-300
              hover:bg-blue-700
              hover:-translate-y-0.5
              active:scale-95
            "
          >
            Go Back
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // VIDEO DETAILS PAGE
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        space-y-6
        theme-text
        transition-colors
        duration-300
        pb-10
      "
    >

      {/* =================================================
          VIDEO PLAYER
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          theme-border
          bg-black
          shadow-xl
        "
      >

        {!playVideo ? (

          <div
            className="
              relative
              h-[250px]
              sm:h-[350px]
              md:h-[450px]
              lg:h-[550px]
              w-full
              bg-black
            "
          >

            {video.thumbnail ? (

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-cover
                  bg-center
                  px-4
                "
                style={{
                  backgroundImage:
                    `linear-gradient(
                      rgba(0,0,0,0.35),
                      rgba(0,0,0,0.7)
                    ), url(${video.thumbnail})`,
                }}
              >

                <Button
                  variant="success"
                  icon={
                    <Play
                      size={18}
                      fill="currentColor"
                    />
                  }
                  onClick={() =>
                    setPlayVideo(true)
                  }
                >
                  Play Video
                </Button>

              </div>

            ) : (

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-black
                  px-4
                "
              >

                <Button
                  variant="success"
                  icon={
                    <Play
                      size={18}
                      fill="currentColor"
                    />
                  }
                  onClick={() =>
                    setPlayVideo(true)
                  }
                >
                  Play Video
                </Button>

              </div>

            )}

          </div>

        ) : (

          <CustomVideoPlayer
            video={video}
            user={user}
            nextVideo={nextVideo}
            onNextVideo={nextVideo ? handleNextVideo : undefined}
          />

        )}

      </div>

      {/* =================================================
          PLAN BENEFITS & AD-FREE STATUS BAR
      ================================================= */}

      {user?.plan && user.plan !== "Free" ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-emerald-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="shrink-0 text-emerald-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  {user.plan} Plan Member
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Ad-Free Active
                </span>
              </div>
              <p className="text-xs theme-text mt-0.5">
                Full watch time unlocked • 100% Ad-Free viewing • High-speed video downloads
              </p>
            </div>
          </div>

          <Link to="/subscription" className="shrink-0">
            <span className="text-xs font-bold text-emerald-500 hover:text-emerald-400 hover:underline">
              Manage Plan →
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {video.isPremium && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Crown size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-500">
                    Free Plan Notice: Premium Video
                  </p>
                  <p className="text-xs theme-text-secondary mt-0.5">
                    Free users have a 1-minute watch time preview. Upgrade to Bronze, Silver, or Gold to watch the full video without restrictions.
                  </p>
                </div>
              </div>
              <Link to="/subscription" className="shrink-0">
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition cursor-pointer"
                >
                  Upgrade Plan
                </button>
              </Link>
            </div>
          )}

          {/* SPONSORED AD BANNER (FREE PLAN) */}
          <div className="rounded-xl border theme-border bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-gray-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                Sponsor Ad
              </span>
              <p className="text-xs theme-text-secondary">
                Enjoying StreamVault? Upgrade to <strong>Silver</strong> or <strong>Gold</strong> for completely <strong>Ad-Free</strong> video viewing, longer watch time, and up to unlimited downloads!
              </p>
            </div>
            <Link to="/subscription" className="shrink-0">
              <span className="text-xs font-bold text-blue-500 hover:text-blue-400 hover:underline">
                Go Ad-Free →
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* =================================================
          VIDEO DETAILS
      ================================================= */}

      <div
        className="
          rounded-2xl
          border
          theme-border
          theme-card
          p-5
          sm:p-6
          md:p-8
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:justify-between
          "
        >

          {/* =================================================
              VIDEO INFORMATION
          ================================================= */}

          <div
            className="
              min-w-0
              flex-1
            "
          >

            {/* TITLE */}

            <h1
              className="
                text-2xl
                sm:text-3xl
                md:text-4xl
                font-bold
                leading-tight
                theme-text
                break-words
              "
            >
              {video.title ||
                "Untitled Video"}
            </h1>


            {/* CATEGORY */}

            <p
              className="
                mt-3
                inline-flex
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-sm
                font-medium
                text-blue-600
                dark:bg-blue-500/10
                dark:text-blue-400
              "
            >
              {video.category ||
                "General"}
            </p>


            {/* =================================================
                STATS
            ================================================= */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-x-6
                gap-y-3
                theme-text-secondary
              "
            >

              {/* DURATION */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Clock
                  size={18}
                />

                <span>
                  {video.duration ||
                    "N/A"}
                </span>

              </div>


              {/* VIEWS */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Eye
                  size={18}
                />

                <span>
                  {video.views || 0}
                  {" "}
                  Views
                </span>

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
              className="
                mt-6
                max-w-4xl
                text-sm
                sm:text-base
                leading-7
                sm:leading-8
                theme-text-secondary
              "
            >
              {video.description ||
                "No description available."}
            </p>


            {/* =================================================
                UPLOADER
            ================================================= */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-2
                text-sm
                theme-text-muted
              "
            >

              <span>
                Uploaded by:
              </span>

              <span
                className="
                  font-semibold
                  theme-text-secondary
                "
              >
                {video.uploader?.name ||
                  "Unknown"}
              </span>

            </div>

          </div>


          {/* =================================================
              PREMIUM BADGE
          ================================================= */}

          {video.isPremium && (

            <div
              className="
                shrink-0
              "
            >

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-yellow-400
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-black
                  shadow-lg
                  shadow-yellow-500/10
                "
              >

                <Crown
                  size={18}
                />

                Premium

              </span>

            </div>

          )}

        </div>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          className="
            mt-8
            flex
            flex-col
            sm:flex-row
            sm:flex-wrap
            gap-3
          "
        >

          {/* WATCH */}

          {!playVideo && (

            <Button
              variant="success"
              icon={
                <Play
                  size={18}
                  fill="currentColor"
                />
              }
              onClick={() =>
                setPlayVideo(true)
              }
              className="
                w-full
                sm:w-auto
              "
            >
              Watch Now
            </Button>

          )}


          {/* DOWNLOAD */}

          <div
            className="
              w-full
              sm:w-auto
            "
          >

            <DownloadButton
              video={video}
            />

          </div>

          {/* NEXT VIDEO BUTTON */}
          {nextVideo && (
            <Button
              variant="outline"
              icon={<SkipForward size={18} />}
              onClick={handleNextVideo}
              className="w-full sm:w-auto"
              title={`Play next: ${nextVideo.title}`}
            >
              Next: {nextVideo.title?.length > 20 ? `${nextVideo.title.slice(0, 20)}...` : nextVideo.title}
            </Button>
          )}

        </div>

      </div>


      {/* =================================================
          COMMENTS
      ================================================= */}

      <div
        className="
          w-full
          mt-6
        "
      >

        {video?._id ? (

          <CommentSection
            videoId={video._id}
          />

        ) : (

          <div
            className="
              rounded-2xl
              border
              border-red-300
              bg-red-50
              p-6
              text-center
              text-red-700
            "
          >
            Unable to load comments because
            the video ID is missing.
          </div>

        )}

      </div>


      {/* =================================================
          DOWNLOAD RULES
      ================================================= */}

      <div
        className="
          rounded-2xl
          border
          border-blue-300
          bg-blue-50
          p-5
          sm:p-6
          dark:border-blue-700
          dark:bg-blue-950/40
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-white
            "
          >

            <Clock
              size={20}
            />

          </div>


          <div>

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-blue-900
                dark:text-white
              "
            >
              Download Rules
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-blue-700
                dark:text-blue-300
              "
            >
              Download limits depend on
              your subscription plan.
            </p>

          </div>

        </div>


        <ul
          className="
            mt-6
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            text-sm
            sm:text-base
            text-blue-900
            dark:text-gray-300
          "
        >

          <li
            className="
              rounded-xl
              border
              border-blue-200
              bg-white/60
              p-4
              dark:border-blue-800
              dark:bg-blue-900/20
            "
          >
            <strong>
              Free:
            </strong>{" "}
            1 video per day
          </li>


          <li
            className="
              rounded-xl
              border
              border-blue-200
              bg-white/60
              p-4
              dark:border-blue-800
              dark:bg-blue-900/20
            "
          >
            <strong>
              Bronze:
            </strong>{" "}
            5 videos per day
          </li>


          <li
            className="
              rounded-xl
              border
              border-blue-200
              bg-white/60
              p-4
              dark:border-blue-800
              dark:bg-blue-900/20
            "
          >
            <strong>
              Silver:
            </strong>{" "}
            15 videos per day
          </li>


          <li
            className="
              rounded-xl
              border
              border-blue-200
              bg-white/60
              p-4
              dark:border-blue-800
              dark:bg-blue-900/20
            "
          >
            <strong>
              Gold:
            </strong>{" "}
            Unlimited downloads
          </li>

        </ul>


        <div
          className="
            mt-5
            rounded-xl
            bg-blue-100
            p-4
            text-sm
            text-blue-800
            dark:bg-blue-900/30
            dark:text-blue-200
          "
        >
          Download history is
          automatically saved to your
          account.
        </div>

      </div>

    </div>

  );
}

export default VideoDetails;