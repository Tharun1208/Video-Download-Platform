import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
  Loader2,
  Video,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import CommentSection from "../components/comments/Comments";

function PexelsVideo() {
  const location = useLocation();
  const navigate = useNavigate();

  const videoData = location.state?.video;

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showControls, setShowControls] = useState(true);

  const [tapMessage, setTapMessage] = useState("");

  const controlsTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);

  // =========================================================
  // VIDEO DATA CHECK
  // =========================================================

  if (!videoData) {
    return (
      <div
        className="
          min-h-screen
          theme-bg
          theme-text
          flex
          flex-col
          items-center
          justify-center
          gap-4
          transition-colors
          duration-300
        "
      >
        <div
          className="
            w-16
            h-16
            rounded-full
            flex
            items-center
            justify-center
            bg-gray-100
            dark:bg-gray-900
            border
            theme-border
          "
        >
          <Video
            size={32}
            className="text-gray-400 dark:text-gray-500"
          />
        </div>

        <h2 className="text-xl font-semibold theme-text">
          Video not found
        </h2>

        <p className="text-sm theme-text-secondary">
          The requested Pexels video could not be found.
        </p>

        <button
          onClick={() => navigate("/videos")}
          className="
            mt-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-2.5
            rounded-lg
            transition-all
            duration-200
            hover:scale-105
          "
        >
          Back to Videos
        </button>
      </div>
    );
  }

  // =========================================================
  // COMMENT VIDEO ID
  // =========================================================

  /*
    Pexels videos do not have a MongoDB _id like normal videos.

    We try the available identifiers in this order.
  */

  const commentVideoId =
    videoData._id ||
    videoData.videoId ||
    videoData.id;

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "00:00";
    }

    const totalSeconds = Math.floor(time);

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // =========================================================
  // SHOW CONTROLS
  // =========================================================

  const showVideoControls = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(
        controlsTimeoutRef.current
      );
    }

    if (isPlaying) {
      controlsTimeoutRef.current =
        setTimeout(() => {
          setShowControls(false);
        }, 3000);
    }
  };

  // =========================================================
  // PLAY / PAUSE
  // =========================================================

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(
        "Play error:",
        error
      );
    }

    showVideoControls();
  };

  // =========================================================
  // SEEK
  // =========================================================

  const seekVideo = (seconds) => {
    const video = videoRef.current;

    if (!video) return;

    const newTime = Math.max(
      0,
      Math.min(
        video.currentTime + seconds,
        video.duration || 0
      )
    );

    video.currentTime = newTime;

    setCurrentTime(newTime);

    setTapMessage(
      seconds > 0
        ? `+${seconds}s`
        : `${seconds}s`
    );

    setTimeout(() => {
      setTapMessage("");
    }, 700);

    showVideoControls();
  };

  // =========================================================
  // VOLUME
  // =========================================================

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setIsMuted(video.muted);

    showVideoControls();
  };

  const handleVolumeChange = (event) => {
    const value = Number(
      event.target.value
    );

    const video = videoRef.current;

    if (!video) return;

    video.volume = value;

    if (value === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }

    setVolume(value);

    showVideoControls();
  };

  // =========================================================
  // PROGRESS
  // =========================================================

  const handleSeek = (event) => {
    const value = Number(
      event.target.value
    );

    const video = videoRef.current;

    if (!video) return;

    video.currentTime = value;

    setCurrentTime(value);

    showVideoControls();
  };

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const toggleFullscreen = async () => {
    const container =
      containerRef.current;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }

    showVideoControls();
  };

  // =========================================================
  // DOUBLE TAP
  // =========================================================

  const handleVideoTap = (event) => {
    const now = Date.now();

    const timeSinceLastTap =
      now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      const rect =
        event.currentTarget.getBoundingClientRect();

      const clickX =
        event.clientX - rect.left;

      const width = rect.width;

      if (clickX < width / 2) {
        seekVideo(-10);
      } else {
        seekVideo(10);
      }
    } else {
      togglePlay();
    }

    lastTapRef.current = now;
  };

  // =========================================================
  // VIDEO EVENTS
  // =========================================================

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(
          video.duration
        )
      ) {
        setDuration(
          video.duration
        );
      }

      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(
        video.currentTime
      );
    };

    const handlePlay = () => {
      setIsPlaying(true);
      showVideoControls();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    video.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    video.addEventListener(
      "play",
      handlePlay
    );

    video.addEventListener(
      "pause",
      handlePause
    );

    video.addEventListener(
      "waiting",
      handleWaiting
    );

    video.addEventListener(
      "playing",
      handlePlaying
    );

    video.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      video.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      video.removeEventListener(
        "play",
        handlePlay
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      video.removeEventListener(
        "waiting",
        handleWaiting
      );

      video.removeEventListener(
        "playing",
        handlePlaying
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  // =========================================================
  // FULLSCREEN CHANGE
  // =========================================================

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        setIsFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      if (
        controlsTimeoutRef.current
      ) {
        clearTimeout(
          controlsTimeoutRef.current
        );
      }
    };
  }, []);

  // =========================================================
  // NEXT VIDEO
  // =========================================================

  const handleNextVideo = () => {
    navigate("/videos");
  };

  // =========================================================
  // ACTUAL DURATION
  // =========================================================

  const actualDuration =
    duration > 0
      ? formatTime(duration)
      : videoData.duration ||
        "Loading...";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        p-4
        md:p-6
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        onClick={() => navigate(-1)}
        className="
          flex
          items-center
          gap-2
          theme-text-secondary
          hover:text-blue-500
          mb-5
          transition-colors
          duration-200
        "
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* =====================================================
          VIDEO PLAYER
      ===================================================== */}

      <div
        ref={containerRef}
        className="
          relative
          bg-black
          rounded-2xl
          overflow-hidden
          border
          border-gray-800
          shadow-2xl
          group
        "
        onMouseMove={showVideoControls}
        onMouseLeave={() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }}
      >
        {/* VIDEO */}

        {videoData.videoUrl ? (
          <video
            ref={videoRef}
            src={videoData.videoUrl}
            playsInline
            preload="metadata"
            className="
              w-full
              max-h-[700px]
              min-h-[300px]
              object-contain
              bg-black
              cursor-pointer
            "
            onClick={handleVideoTap}
            onDoubleClick={(e) => {
              e.preventDefault();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
          />
        ) : (
          <div
            className="
              h-[500px]
              flex
              flex-col
              items-center
              justify-center
              gap-3
              bg-black
            "
          >
            <Video
              size={40}
              className="text-gray-600"
            />

            <p className="text-red-400">
              Video file is not available.
            </p>
          </div>
        )}

        {/* LOADING */}

        {isLoading && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pointer-events-none
            "
          >
            <div
              className="
                rounded-full
                bg-black/60
                p-4
                backdrop-blur-sm
              "
            >
              <Loader2
                size={42}
                className="
                  animate-spin
                  text-blue-400
                "
              />
            </div>
          </div>
        )}

        {/* DOUBLE TAP MESSAGE */}

        {tapMessage && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pointer-events-none
            "
          >
            <div
              className="
                rounded-full
                bg-black/70
                px-6
                py-4
                text-2xl
                font-bold
                backdrop-blur-sm
              "
            >
              {tapMessage}
            </div>
          </div>
        )}

        {/* CENTER PLAY BUTTON */}

        {!isPlaying &&
          !isLoading &&
          duration > 0 && (
            <button
              onClick={togglePlay}
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                w-16
                h-16
                rounded-full
                bg-blue-600
                hover:bg-blue-700
                flex
                items-center
                justify-center
                shadow-2xl
                transition-all
                duration-200
                hover:scale-110
              "
            >
              <Play
                size={30}
                fill="white"
                className="text-white"
              />
            </button>
          )}

        {/* ===================================================
            CUSTOM CONTROLS
        =================================================== */}

        <div
          className={`
            absolute
            left-0
            right-0
            bottom-0
            transition-all
            duration-300
            ${
              showControls
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }
          `}
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black
              via-black/70
              to-transparent
              -z-10
            "
          />

          <div className="px-4 pb-4 pt-12">

            {/* PROGRESS BAR */}

            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="
                w-full
                h-1.5
                mb-4
                accent-blue-500
                cursor-pointer
              "
            />

            {/* CONTROLS ROW */}

            <div
              className="
                flex
                items-center
                gap-2
                sm:gap-3
              "
            >
              {/* PLAY */}

              <button
                onClick={togglePlay}
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title={
                  isPlaying
                    ? "Pause"
                    : "Play"
                }
              >
                {isPlaying ? (
                  <Pause size={21} />
                ) : (
                  <Play size={21} />
                )}
              </button>

              {/* REWIND */}

              <button
                onClick={() =>
                  seekVideo(-10)
                }
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title="Rewind 10 seconds"
              >
                <RotateCcw size={20} />
              </button>

              {/* FORWARD */}

              <button
                onClick={() =>
                  seekVideo(10)
                }
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title="Forward 10 seconds"
              >
                <RotateCw size={20} />
              </button>

              {/* TIME */}

              <span
                className="
                  text-xs
                  sm:text-sm
                  text-gray-300
                  whitespace-nowrap
                "
              >
                {formatTime(
                  currentTime
                )}
                {" / "}
                {actualDuration}
              </span>

              <div className="flex-1" />

              {/* VOLUME */}

              <button
                onClick={toggleMute}
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title={
                  isMuted
                    ? "Unmute"
                    : "Mute"
                }
              >
                {isMuted ? (
                  <VolumeX size={21} />
                ) : (
                  <Volume2 size={21} />
                )}
              </button>

              {/* VOLUME SLIDER */}

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  isMuted
                    ? 0
                    : volume
                }
                onChange={
                  handleVolumeChange
                }
                className="
                  hidden
                  sm:block
                  w-20
                  accent-blue-500
                "
              />

              {/* NEXT */}

              <button
                onClick={
                  handleNextVideo
                }
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title="Next video"
              >
                <SkipForward size={21} />
              </button>

              {/* FULLSCREEN */}

              <button
                onClick={
                  toggleFullscreen
                }
                className="
                  p-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                  transition
                "
                title={
                  isFullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize size={21} />
                ) : (
                  <Maximize size={21} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          VIDEO DETAILS
      ===================================================== */}

      <div
        className="
          mt-6
          theme-card
          theme-border
          border
          rounded-2xl
          p-6
          shadow-sm
          transition-all
          duration-300
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            mb-3
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-lg
              bg-blue-100
              dark:bg-blue-500/10
              flex
              items-center
              justify-center
              transition-colors
              duration-300
            "
          >
            <Play
              size={20}
              className="
                text-blue-600
                dark:text-blue-400
              "
            />
          </div>

          <div>
            <h1
              className="
                text-2xl
                font-bold
                theme-text
                transition-colors
                duration-300
              "
            >
              {videoData.title}
            </h1>

            <p
              className="
                text-blue-600
                dark:text-blue-400
                text-sm
              "
            >
              {videoData.category ||
                "General"}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}

        <p
          className="
            theme-text-secondary
            leading-7
            transition-colors
            duration-300
          "
        >
          {videoData.description ||
            "No description available."}
        </p>

        {/* INFORMATION */}

        <div
          className="
            flex
            flex-wrap
            gap-5
            mt-5
            text-sm
            theme-text-secondary
          "
        >
          <span>
            Source: Pexels
          </span>

          <span>
            Duration: {actualDuration}
          </span>
        </div>
      </div>

      {/* =====================================================
          COMMENTS
      ===================================================== */}

      {commentVideoId && (
        <div className="mt-6">
          <CommentSection
            videoId={commentVideoId}
          />
        </div>
      )}

      {/* =====================================================
          END
      ===================================================== */}

    </div>
  );
}

export default PexelsVideo;