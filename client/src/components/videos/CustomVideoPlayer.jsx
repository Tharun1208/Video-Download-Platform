import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Loader2,
  SkipForward,
  Crown,
  ShieldCheck,
  Sparkles,
  Tv2,
  Gauge,
  Check,
} from "lucide-react";

function CustomVideoPlayer({
  video,
  onNextVideo,
  nextVideo,
  user,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const feedbackTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [doubleTapFeedback, setDoubleTapFeedback] =
    useState(null); // 'left' | 'right' | null

  const [hasEnded, setHasEnded] =
    useState(false);

  const triggerFeedback = (side) => {
    setDoubleTapFeedback(side);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setDoubleTapFeedback(null);
    }, 650);
  };

  const [isPremiumLocked, setIsPremiumLocked] =
    useState(false);

  const isPremiumVideo = Boolean(video?.isPremium);
  const userPlan = (
    user?.plan ||
    user?.subscriptionPlan ||
    user?.subscription?.plan ||
    localStorage.getItem("user_plan") ||
    ""
  ).toString().trim();

  const isPaidPlan = Boolean(
    userPlan &&
    userPlan.toLowerCase() !== "free"
  );

  const PREVIEW_LIMIT = 60; // 60-second preview for Free tier on premium videos

  useEffect(() => {
    if (isPaidPlan) {
      setIsPremiumLocked(false);
    }
  }, [isPaidPlan]);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [showControls, setShowControls] =
    useState(true);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [resumeNotice, setResumeNotice] = useState(null);

  const rawVideoId = video?._id || video?.id || video?.videoId || video?.pexelsId;
  const storageKey = rawVideoId ? `watch_progress_${rawVideoId}` : null;

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture-in-picture error:", err);
    }
  };

  // =====================================================
  // VIDEO URL
  // =====================================================

  const videoUrl =
    video?.videoUrl ||
    video?.url ||
    video?.fileUrl;

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const hrs = Math.floor(
      seconds / 3600
    );

    const mins = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = Math.floor(
      seconds % 60
    );

    if (hrs > 0) {
      return `${String(hrs).padStart(
        2,
        "0"
      )}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // PLAY / PAUSE
  // =====================================================

  const togglePlay = async () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    try {
      if (videoElement.paused) {
        await videoElement.play();
      } else {
        videoElement.pause();
      }
    } catch (error) {
      console.error(
        "Video play error:",
        error
      );
    }
  };

  // =====================================================
  // REWIND
  // =====================================================

  const rewind = () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    videoElement.currentTime = Math.max(
      0,
      videoElement.currentTime - 10
    );
  };

  // =====================================================
  // FORWARD
  // =====================================================

  const forward = () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    let targetTime =
      videoElement.currentTime + 10;

    if (
      isPremiumVideo &&
      !isPaidPlan &&
      targetTime >= PREVIEW_LIMIT
    ) {
      targetTime = PREVIEW_LIMIT;
      videoElement.pause();
      setIsPlaying(false);
      setIsPremiumLocked(true);
    }

    videoElement.currentTime = Math.min(
      videoElement.duration || duration,
      targetTime
    );
  };

  // =====================================================
  // VOLUME
  // =====================================================

  const handleVolumeChange = (event) => {
    const newVolume =
      Number(event.target.value);

    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    videoElement.volume = newVolume;

    setVolume(newVolume);

    if (newVolume === 0) {
      videoElement.muted = true;
      setIsMuted(true);
    } else {
      videoElement.muted = false;
      setIsMuted(false);
    }
  };

  // =====================================================
  // MUTE
  // =====================================================

  const toggleMute = () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    if (videoElement.muted) {
      videoElement.muted = false;

      videoElement.volume =
        volume > 0 ? volume : 1;

      setIsMuted(false);
    } else {
      videoElement.muted = true;

      setIsMuted(true);
    }
  };

  // =====================================================
  // SEEK
  // =====================================================

  const handleSeek = (event) => {
    const newTime =
      Number(event.target.value);

    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    if (
      isPremiumVideo &&
      !isPaidPlan &&
      newTime >= PREVIEW_LIMIT
    ) {
      videoElement.currentTime = PREVIEW_LIMIT;
      setCurrentTime(PREVIEW_LIMIT);
      videoElement.pause();
      setIsPlaying(false);
      setIsPremiumLocked(true);
      return;
    }

    if (isPremiumLocked && newTime < PREVIEW_LIMIT) {
      setIsPremiumLocked(false);
    }

    videoElement.currentTime =
      newTime;

    setCurrentTime(newTime);
  };

  // =====================================================
  // FULLSCREEN
  // =====================================================

  const toggleFullscreen = async () => {
    const container =
      containerRef.current;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  // =====================================================
  // FULLSCREEN CHANGE
  // =====================================================

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

  // =====================================================
  // VIDEO EVENTS
  // =====================================================

  useEffect(() => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);

      // Restore watch progress if previously saved
      if (storageKey) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedSec = Number(saved);
          if (savedSec > 5 && savedSec < (videoElement.duration || 999999) - 10) {
            videoElement.currentTime = savedSec;
            setCurrentTime(savedSec);
            setResumeNotice(formatTime(savedSec));
            setTimeout(() => setResumeNotice(null), 4500);
          }
        }
      }
    };

    const handleTimeUpdate = () => {
      const current = videoElement.currentTime;
      setCurrentTime(current);

      // Persist watch progress every few seconds
      if (storageKey && current > 3) {
        localStorage.setItem(storageKey, String(Math.floor(current)));
      }

      if (
        isPremiumVideo &&
        !isPaidPlan &&
        current >= PREVIEW_LIMIT
      ) {
        videoElement.pause();
        setIsPlaying(false);
        setIsPremiumLocked(true);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setHasEnded(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    };

    videoElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    videoElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    videoElement.addEventListener(
      "play",
      handlePlay
    );

    videoElement.addEventListener(
      "pause",
      handlePause
    );

    videoElement.addEventListener(
      "waiting",
      handleWaiting
    );

    videoElement.addEventListener(
      "canplay",
      handleCanPlay
    );

    videoElement.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      videoElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      videoElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      videoElement.removeEventListener(
        "play",
        handlePlay
      );

      videoElement.removeEventListener(
        "pause",
        handlePause
      );

      videoElement.removeEventListener(
        "waiting",
        handleWaiting
      );

      videoElement.removeEventListener(
        "canplay",
        handleCanPlay
      );

      videoElement.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [videoUrl]);

  // =====================================================
  // KEYBOARD CONTROLS (SPACE, ARROWS, F, M, N)
  // =====================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        rewind();
        triggerFeedback("left");
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        forward();
        triggerFeedback("right");
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if ((e.key === "n" || e.key === "N") && onNextVideo) {
        e.preventDefault();
        onNextVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, volume, duration, currentTime, isPremiumLocked, onNextVideo]);

  // =====================================================
  // MOBILE DOUBLE TAP GESTURES
  // =====================================================

  const handleVideoTap = (event) => {
    const now = Date.now();

    const timeSinceLastTap =
      now - lastTapRef.current;

    if (
      timeSinceLastTap < 350
    ) {
      clearTimeout(
        tapTimeoutRef.current
      );

      const rect =
        event.currentTarget.getBoundingClientRect();

      const tapX =
        event.clientX - rect.left;

      const middle =
        rect.width / 2;

      if (tapX < middle) {
        rewind();
        triggerFeedback("left");
      } else {
        forward();
        triggerFeedback("right");
      }

      lastTapRef.current = 0;

      return;
    }

    lastTapRef.current = now;

    tapTimeoutRef.current =
      setTimeout(() => {
        togglePlay();
      }, 350);
  };

  const handleTouchEnd = (event) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 350) {
      clearTimeout(tapTimeoutRef.current);
      const touch = event.changedTouches?.[0];
      if (touch && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const middle = rect.width / 2;

        if (tapX < middle) {
          rewind();
          triggerFeedback("left");
        } else {
          forward();
          triggerFeedback("right");
        }
      }
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
    tapTimeoutRef.current = setTimeout(() => {
      togglePlay();
    }, 350);
  };

  // =====================================================
  // CLEANUP TAP TIMEOUT
  // =====================================================

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(
          tapTimeoutRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // CONTROLS VISIBILITY
  // =====================================================

  const handleMouseMove = () => {
    setShowControls(true);
  };

  // =====================================================
  // NO VIDEO URL
  // =====================================================

  if (!videoUrl) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-black text-gray-400">
        <div className="text-center">
          <p className="text-lg font-semibold">
            Video unavailable
          </p>

          <p className="mt-2 text-sm text-gray-500">
            This video does not have a playable
            video URL.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PLAYER
  // =====================================================

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="
        relative
        w-full
        overflow-hidden
        bg-black
        group
      "
    >
      {/* =================================================
          VIDEO
      ================================================= */}

      <video
        ref={videoRef}
        src={videoUrl}
        poster={video.thumbnail || undefined}
        playsInline
        preload="metadata"
        className="
          block
          w-full
          h-[500px]
          object-contain
          bg-black
        "
        onClick={handleVideoTap}
        onTouchEnd={handleTouchEnd}
      />

      {/* RESUME PROGRESS NOTIFICATION */}
      <AnimatePresence>
        {resumeNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 z-40 flex items-center gap-2.5 bg-black/85 backdrop-blur-md border border-blue-500/40 text-white px-3.5 py-2 rounded-xl text-xs shadow-2xl"
          >
            <Sparkles size={15} className="text-blue-400" />
            <span>Resumed from <strong>{resumeNotice}</strong></span>
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
                if (storageKey) localStorage.removeItem(storageKey);
                setResumeNotice(null);
              }}
              className="text-blue-400 hover:text-blue-300 underline font-semibold ml-1 cursor-pointer"
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOUBLE TAP GESTURE VISUAL FEEDBACK (LEFT / REWIND 10s) */}
      {doubleTapFeedback === "left" && (
        <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center rounded-full bg-black/80 backdrop-blur-md w-24 h-24 border border-white/20 text-white shadow-2xl animate-pulse">
          <RotateCcw size={30} className="text-blue-400" />
          <span className="text-xs font-extrabold mt-1 text-blue-300">-10s</span>
        </div>
      )}

      {/* DOUBLE TAP GESTURE VISUAL FEEDBACK (RIGHT / FORWARD 10s) */}
      {doubleTapFeedback === "right" && (
        <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center rounded-full bg-black/80 backdrop-blur-md w-24 h-24 border border-white/20 text-white shadow-2xl animate-pulse">
          <RotateCw size={30} className="text-blue-400" />
          <span className="text-xs font-extrabold mt-1 text-blue-300">+10s</span>
        </div>
      )}

      {/* END SCREEN WITH NEXT VIDEO OPTION */}
      {hasEnded && (
        <div className="absolute inset-0 z-40 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
          <p className="text-xs uppercase tracking-widest font-bold text-blue-400 mb-2">
            {nextVideo ? "Up Next" : "Finished Playing"}
          </p>

          {nextVideo && (
            <div className="w-52 h-30 rounded-xl overflow-hidden mb-3 border border-white/20 relative shadow-2xl bg-gray-900">
              {nextVideo.thumbnail ? (
                <img
                  src={nextVideo.thumbnail}
                  alt={nextVideo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={28} />
                </div>
              )}
            </div>
          )}

          <h3 className="font-bold text-lg max-w-md line-clamp-1 mb-5">
            {nextVideo?.title || video?.title || "Video"}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNextVideo && nextVideo && (
              <button
                type="button"
                onClick={() => {
                  setHasEnded(false);
                  onNextVideo();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Play Next Video</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setHasEnded(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-sm font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={15} />
              <span>Replay</span>
            </button>
          </div>
        </div>
      )}

      {/* FREE PREVIEW ACTIVE BADGE */}
      {isPremiumVideo && !isPaidPlan && !isPremiumLocked && (
        <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none">
          <div className="mx-auto w-fit max-w-full rounded-full bg-black/85 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30 flex items-center gap-2 shadow-lg">
            <Crown size={14} className="shrink-0" />
            <span className="truncate">
              Free Preview: Limited to 60s • Upgrade to Bronze, Silver, or Gold for full watch time
            </span>
          </div>
        </div>
      )}

      {/* PAID PLAN UNLOCKED BADGE */}
      {isPremiumVideo && isPaidPlan && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className="rounded-full bg-emerald-950/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
            <ShieldCheck size={14} />
            <span>{userPlan} Unlocked • Full Watch Time & Ad-Free</span>
          </div>
        </div>
      )}

      {/* PREMIUM PREVIEW ENDED LOCK OVERLAY */}
      {isPremiumLocked && (
        <div className="absolute inset-0 z-40 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/10">
            <Crown size={34} />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Premium Video Preview Ended
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
            Free users have limited access (1-minute watch time) on premium videos. Upgrade to Bronze, Silver, or Gold to unlock full unlimited watch time, ad-free streaming, and high-speed downloads!
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/subscription">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-2"
              >
                <Crown size={16} />
                <span>Upgrade to Watch Full Video</span>
              </button>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setIsPremiumLocked(false);
                  videoRef.current.play().catch(() => {});
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-semibold transition cursor-pointer"
            >
              Replay Preview
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

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
              size={34}
              className="
                animate-spin
                text-white
              "
            />
          </div>
        </div>
      )}

      {/* =================================================
          CENTER PLAY BUTTON
      ================================================= */}

      {!isPlaying &&
        !isLoading && (
          <button
            type="button"
            onClick={togglePlay}
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-white
              shadow-2xl
              transition
              hover:scale-110
              hover:bg-blue-500
            "
          >
            <Play
              size={30}
              fill="currentColor"
            />
          </button>
        )}

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div
        className={`
          absolute
          bottom-0
          left-0
          right-0
          bg-gradient-to-t
          from-black
          via-black/80
          to-transparent
          px-4
          pb-4
          pt-12
          transition-opacity
          duration-300
          ${
            showControls
              ? "opacity-100"
              : "opacity-0"
          }
          group-hover:opacity-100
        `}
      >
        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="
            w-full
            cursor-pointer
            accent-blue-500
          "
        />

        {/* =================================================
            CONTROL ROW
        ================================================= */}

        <div
          className="
            mt-3
            flex
            items-center
            gap-3
            text-white
          "
        >
          {/* PLAY */}

          <button
            type="button"
            onClick={togglePlay}
            className="
              rounded-lg
              p-2
              transition
              hover:bg-white/10
            "
          >
            {isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>

          {/* REWIND */}

          <button
            type="button"
            onClick={rewind}
            className="
              relative
              rounded-lg
              p-2
              transition
              hover:bg-white/10
            "
            title="Rewind 10 seconds"
          >
            <RotateCcw size={20} />

            <span
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                text-[8px]
                font-bold
              "
            >
              10
            </span>
          </button>

          {/* FORWARD */}

          <button
            type="button"
            onClick={forward}
            className="
              relative
              rounded-lg
              p-2
              transition
              hover:bg-white/10
            "
            title="Forward 10 seconds"
          >
            <RotateCw size={20} />

            <span
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                text-[8px]
                font-bold
              "
            >
              10
            </span>
          </button>

          {/* TIME */}

          <span
            className="
              min-w-[100px]
              text-sm
              text-gray-300
            "
          >
            {formatTime(currentTime)}
            {" / "}
            {formatTime(duration)}
          </span>

          {/* SPACER */}

          <div className="flex-1" />

          {/* VOLUME */}

          <button
            type="button"
            onClick={toggleMute}
            className="
              rounded-lg
              p-2
              transition
              hover:bg-white/10
            "
          >
            {isMuted ||
            volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
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
              w-20
              cursor-pointer
              accent-blue-500
              sm:block
            "
          />

          {/* NEXT */}

          {onNextVideo && (
            <button
              type="button"
              onClick={onNextVideo}
              className="
                rounded-lg
                p-2
                transition
                hover:bg-white/10
              "
              title={nextVideo?.title ? `Next: ${nextVideo.title}` : "Next video"}
            >
              <SkipForward size={20} />
            </button>
          )}

          {/* SPEED CONTROL */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu((prev) => !prev)}
              className="rounded-lg px-2.5 py-1 text-xs font-bold transition hover:bg-white/10 flex items-center gap-1 cursor-pointer"
              title="Playback Speed"
            >
              <Gauge size={16} />
              <span>{playbackSpeed === 1 ? "1x" : `${playbackSpeed}x`}</span>
            </button>

            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-32 rounded-xl bg-black/95 border border-white/20 p-1.5 shadow-2xl backdrop-blur-md z-50 text-xs"
                >
                  <p className="px-2 py-1 font-bold text-gray-400 border-b border-white/10 mb-1">
                    Speed
                  </p>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left cursor-pointer ${
                        playbackSpeed === s
                          ? "bg-blue-600 text-white font-bold"
                          : "hover:bg-white/10 text-gray-200"
                      }`}
                    >
                      <span>{s === 1 ? "Normal (1x)" : `${s}x`}</span>
                      {playbackSpeed === s && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PICTURE IN PICTURE */}
          <button
            type="button"
            onClick={togglePiP}
            className="rounded-lg p-2 transition hover:bg-white/10 cursor-pointer"
            title="Picture in Picture"
          >
            <Tv2 size={20} />
          </button>

          {/* FULLSCREEN */}

          <button
            type="button"
            onClick={
              toggleFullscreen
            }
            className="
              rounded-lg
              p-2
              transition
              hover:bg-white/10
            "
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize size={20} />
            ) : (
              <Maximize size={20} />
            )}
          </button>
        </div>
      </div>

      {/* =================================================
          MOBILE GESTURE HINT
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-5
          -translate-x-1/2
          rounded-full
          bg-black/50
          px-3
          py-1
          text-[11px]
          text-gray-300
          opacity-0
          transition
          group-active:opacity-100
          sm:hidden
        "
      >
        Double tap left/right to seek
      </div>
    </div>
  );
}

export default CustomVideoPlayer;