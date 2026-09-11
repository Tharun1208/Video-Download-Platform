import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Copy,
  Link2,
  Crown,
  Video,
  MessageCircle,
  Users,
  LogOut,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Loader2,
  Disc,
  Square,
} from "lucide-react";

import toast from "react-hot-toast";
import YouTube from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../components/layout/Navbar";
import ParticipantList from "../../components/wacthparty/ParticipantList";
import ChatBox from "../../components/wacthparty/ChatBox";
import VideoCall from "../../components/wacthparty/VideoCall";
import ConfirmationModal from "../../components/common/ConfirmationModal";

import socket from "../../services/socket";

function WatchRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // REFS
  // =========================================================

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const syncingRef = useRef(false);
  const progressIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Recording Refs & State
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // =========================================================
  // ROOM STATE
  // =========================================================

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [participants, setParticipants] = useState([]);

  const [showParticipants, setShowParticipants] =
    useState(true);

  const [showChat, setShowChat] =
    useState(true);

  const [showVideoCall, setShowVideoCall] =
    useState(false);

  // =========================================================
  // VIDEO STATE
  // =========================================================

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isLoadingVideo, setIsLoadingVideo] =
    useState(true);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(100);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [showControls, setShowControls] =
    useState(true);

  // =========================================================
  // TOKEN / USER
  // =========================================================

  const token = localStorage.getItem("token");

  let currentUser = null;

  try {
    currentUser =
      JSON.parse(
        localStorage.getItem("user")
      ) || null;
  } catch (error) {
    console.error(
      "User parse error:",
      error
    );

    currentUser = null;
  }

  const userId =
    currentUser?._id ||
    currentUser?.id;

  const userName =
    currentUser?.name || "User";

  // =========================================================
  // THEME SYNC
  // =========================================================

  useEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") === "light"
        ? "light"
        : "dark";

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      storedTheme
    );

    document.body.classList.remove(
      "light",
      "dark"
    );

    document.body.classList.add(
      storedTheme
    );

    const handleThemeChange = (event) => {
      const newTheme =
        event.detail === "light"
          ? "light"
          : "dark";

      document.documentElement.classList.remove(
        "light",
        "dark"
      );

      document.documentElement.classList.add(
        newTheme
      );

      document.body.classList.remove(
        "light",
        "dark"
      );

      document.body.classList.add(
        newTheme
      );
    };

    window.addEventListener(
      "themeChanged",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "themeChanged",
        handleThemeChange
      );
    };
  }, []);

  // =========================================================
  // GET ROOM
  // =========================================================

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);

        const API_URL =
          import.meta.env.VITE_API_URL;

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured"
          );
        }

        if (!token) {
          throw new Error(
            "Please login first"
          );
        }

        const response = await fetch(
          `${API_URL}/api/rooms/${roomCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await response.json();

        console.log(
          "GET ROOM RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load watch party"
          );
        }

        const fetchedRoom =
          data.room || data;

        setRoom(fetchedRoom);

        if (
          Array.isArray(
            fetchedRoom.participants
          )
        ) {
          setParticipants(
            fetchedRoom.participants
          );
        }
      } catch (error) {
        console.error(
          "Room error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to load watch party"
        );

        navigate(
          "/watch-party/join",
          {
            replace: true,
          }
        );
      } finally {
        setLoading(false);
      }
    };

    if (roomCode) {
      fetchRoom();
    }
  }, [
    roomCode,
    navigate,
    token,
  ]);

  // =========================================================
  // SOCKET ROOM CONNECTION
  // =========================================================

  useEffect(() => {
    if (!roomCode || !userId) {
      return;
    }

    console.log(
      "Joining socket room:",
      roomCode
    );

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", {
      roomCode:
        roomCode.toUpperCase(),
      userId,
      userName,
    });

    // =======================================================
    // USER JOINED
    // =======================================================

    const handleUserJoined = (user) => {
      console.log(
        "User joined:",
        user
      );

      setParticipants((prev) => {
        const incomingUserId =
          user?.userId ||
          user?._id ||
          user?.id;

        const exists = prev.some(
          (participant) => {
            const participantId =
              participant?.userId ||
              participant?._id ||
              participant?.id;

            return (
              String(
                participantId
              ) ===
              String(
                incomingUserId
              )
            );
          }
        );

        if (exists) {
          return prev;
        }

        return [...prev, user];
      });

      if (
        String(user?.userId) !==
        String(userId)
      ) {
        toast.success(
          `${
            user?.name ||
            "Someone"
          } joined the party`
        );
      }
    };

    // =======================================================
    // USER LEFT
    // =======================================================

    const handleUserLeft = (user) => {
      console.log(
        "User left:",
        user
      );

      const leftUserId =
        typeof user === "object"
          ? user?.userId ||
            user?._id ||
            user?.id
          : user;

      const leftUserName =
        typeof user === "object"
          ? user?.name
          : user;

      setParticipants(
        (prev) =>
          prev.filter(
            (participant) => {
              const participantId =
                participant?.userId ||
                participant?._id ||
                participant?.id;

              return (
                String(
                  participantId
                ) !==
                String(
                  leftUserId
                )
              );
            }
          )
      );

      if (leftUserName) {
        toast(
          `${leftUserName} left the party`
        );
      }
    };

    // =======================================================
    // REMOTE VIDEO PLAY
    // =======================================================

    const handleVideoPlay = (data) => {
      if (!playerRef.current) {
        return;
      }

      const currentTime =
        typeof data === "object"
          ? data.currentTime || 0
          : data || 0;

      syncingRef.current = true;

      try {
        playerRef.current.seekTo(
          currentTime,
          true
        );

        playerRef.current.playVideo();

        setCurrentTime(
          currentTime
        );

        setIsPlaying(true);
      } catch (error) {
        console.error(
          "Remote play error:",
          error
        );
      }

      setTimeout(() => {
        syncingRef.current = false;
      }, 700);
    };

    // =======================================================
    // REMOTE VIDEO PAUSE
    // =======================================================

    const handleVideoPause = (data) => {
      if (!playerRef.current) {
        return;
      }

      syncingRef.current = true;

      try {
        playerRef.current.pauseVideo();

        let remoteTime = null;

        if (
          typeof data === "number"
        ) {
          remoteTime = data;
        }

        if (
          typeof data === "object" &&
          data?.currentTime !==
            undefined
        ) {
          remoteTime =
            data.currentTime;
        }

        if (
          remoteTime !== null
        ) {
          playerRef.current.seekTo(
            remoteTime,
            true
          );

          setCurrentTime(
            remoteTime
          );
        }

        setIsPlaying(false);
      } catch (error) {
        console.error(
          "Remote pause error:",
          error
        );
      }

      setTimeout(() => {
        syncingRef.current = false;
      }, 700);
    };

    // =======================================================
    // REMOTE VIDEO SEEK
    // =======================================================

    const handleVideoSeek = (data) => {
      if (!playerRef.current) {
        return;
      }

      const remoteTime =
        typeof data === "object"
          ? data.currentTime || 0
          : data || 0;

      syncingRef.current = true;

      try {
        playerRef.current.seekTo(
          remoteTime,
          true
        );

        setCurrentTime(
          remoteTime
        );
      } catch (error) {
        console.error(
          "Remote seek error:",
          error
        );
      }

      setTimeout(() => {
        syncingRef.current = false;
      }, 700);
    };

    const handleNewReaction = (data) => {
      setReactions((prev) => [
        ...prev.slice(-15),
        {
          ...data,
          x: 15 + Math.random() * 70,
        },
      ]);

      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== data.id));
      }, 2500);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("video-play", handleVideoPlay);
    socket.on("video-pause", handleVideoPause);
    socket.on("video-seek", handleVideoSeek);
    socket.on("new-reaction", handleNewReaction);

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("video-play", handleVideoPlay);
      socket.off("video-pause", handleVideoPause);
      socket.off("video-seek", handleVideoSeek);
      socket.off("new-reaction", handleNewReaction);

      socket.emit("leave-room", {
        roomCode:
          roomCode.toUpperCase(),
        userId,
        userName,
      });
    };
  }, [
    roomCode,
    userId,
    userName,
  ]);

  // =========================================================
  // EXTRACT YOUTUBE VIDEO ID
  // =========================================================

  const getYouTubeVideoId = (url) => {
    if (!url) {
      return null;
    }

    try {
      const parsedUrl =
        new URL(url);

      const hostname =
        parsedUrl.hostname.toLowerCase();

      if (
        hostname === "youtu.be" ||
        hostname === "www.youtu.be"
      ) {
        return parsedUrl.pathname
          .replace("/", "")
          .split("/")[0];
      }

      if (
        hostname.includes(
          "youtube.com"
        )
      ) {
        const watchVideoId =
          parsedUrl.searchParams.get(
            "v"
          );

        if (watchVideoId) {
          return watchVideoId;
        }

        if (
          parsedUrl.pathname.startsWith(
            "/embed/"
          )
        ) {
          return parsedUrl.pathname
            .split("/embed/")[1]
            .split("/")[0];
        }

        if (
          parsedUrl.pathname.startsWith(
            "/shorts/"
          )
        ) {
          return parsedUrl.pathname
            .split("/shorts/")[1]
            .split("/")[0];
        }

        if (
          parsedUrl.pathname.startsWith(
            "/live/"
          )
        ) {
          return parsedUrl.pathname
            .split("/live/")[1]
            .split("/")[0];
        }
      }

      return null;
    } catch (error) {
      console.error(
        "YouTube URL error:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // VIDEO ID
  // =========================================================

  const videoId =
    getYouTubeVideoId(
      room?.youtubeUrl ||
        room?.videoUrl ||
        room?.videoURL ||
        room?.youtubeURL
    );

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "00:00";
    }

    const hrs =
      Math.floor(
        seconds / 3600
      );

    const mins =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${String(
        hrs
      ).padStart(
        2,
        "0"
      )}:${String(
        mins
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(
      mins
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  };

  // =========================================================
  // YOUTUBE PLAYER READY
  // =========================================================

  const handlePlayerReady = (event) => {
    console.log(
      "YouTube player ready"
    );

    playerRef.current =
      event.target;

    try {
      const videoDuration =
        event.target.getDuration();

      setDuration(
        videoDuration || 0
      );

      const playerVolume =
        event.target.getVolume();

      setVolume(
        playerVolume || 100
      );

      setIsMuted(
        event.target.isMuted()
      );

      setIsLoadingVideo(false);
    } catch (error) {
      console.error(
        "Player ready error:",
        error
      );

      setIsLoadingVideo(false);
    }
  };

  // =========================================================
  // YOUTUBE STATE CHANGE
  // =========================================================

  const handlePlayerStateChange = (
    event
  ) => {
    if (syncingRef.current) {
      return;
    }

    const player =
      event.target;

    // PLAYING
    if (event.data === 1) {
      setIsPlaying(true);
      setIsLoadingVideo(false);

      try {
        const currentTime =
          player.getCurrentTime();

        socket.emit(
          "video-play",
          {
            roomCode:
              roomCode.toUpperCase(),
            currentTime,
          }
        );
      } catch (error) {
        console.error(
          "Play event error:",
          error
        );
      }
    }

    // PAUSED
    if (event.data === 2) {
      setIsPlaying(false);

      try {
        const currentTime =
          player.getCurrentTime();

        socket.emit(
          "video-pause",
          {
            roomCode:
              roomCode.toUpperCase(),
            currentTime,
          }
        );
      } catch (error) {
        console.error(
          "Pause event error:",
          error
        );
      }
    }

    // BUFFERING
    if (event.data === 3) {
      setIsLoadingVideo(true);
    }

    // CUED
    if (event.data === 5) {
      setIsLoadingVideo(false);
    }
  };

  // =========================================================
  // PROGRESS UPDATE
  // =========================================================

  useEffect(() => {
    if (!videoId) {
      return;
    }

    progressIntervalRef.current =
      setInterval(() => {
        if (!playerRef.current) {
          return;
        }

        try {
          const current =
            playerRef.current.getCurrentTime();

          const total =
            playerRef.current.getDuration();

          if (
            Number.isFinite(current)
          ) {
            setCurrentTime(
              current
            );
          }

          if (
            Number.isFinite(total) &&
            total > 0
          ) {
            setDuration(
              total
            );
          }
        } catch (error) {
          // Player may not be ready yet.
        }
      }, 250);

    return () => {
      if (
        progressIntervalRef.current
      ) {
        clearInterval(
          progressIntervalRef.current
        );
      }
    };
  }, [videoId]);

  // =========================================================
  // PLAY / PAUSE
  // =========================================================

  const handlePlayPause = () => {
    if (!playerRef.current) {
      toast.error(
        "Video player is not ready"
      );

      return;
    }

    try {
      if (isPlaying) {
        handlePause();
      } else {
        handlePlay();
      }
    } catch (error) {
      console.error(
        "Play/pause error:",
        error
      );
    }
  };

  // =========================================================
  // PLAY
  // =========================================================

  const handlePlay = () => {
    if (!playerRef.current) {
      return;
    }

    try {
      const current =
        playerRef.current.getCurrentTime();

      playerRef.current.playVideo();

      socket.emit(
        "video-play",
        {
          roomCode:
            roomCode.toUpperCase(),
          currentTime: current,
        }
      );

      setIsPlaying(true);
    } catch (error) {
      console.error(
        "Play error:",
        error
      );
    }
  };

  // =========================================================
  // PAUSE
  // =========================================================

  const handlePause = () => {
    if (!playerRef.current) {
      return;
    }

    try {
      const current =
        playerRef.current.getCurrentTime();

      playerRef.current.pauseVideo();

      socket.emit(
        "video-pause",
        {
          roomCode:
            roomCode.toUpperCase(),
          currentTime: current,
        }
      );

      setIsPlaying(false);
    } catch (error) {
      console.error(
        "Pause error:",
        error
      );
    }
  };

  // =========================================================
  // SEEK
  // =========================================================

  const handleSeek = (event) => {
    if (!playerRef.current) {
      return;
    }

    const newTime =
      Number(event.target.value);

    if (
      !Number.isFinite(newTime)
    ) {
      return;
    }

    syncingRef.current = true;

    try {
      playerRef.current.seekTo(
        newTime,
        true
      );

      setCurrentTime(
        newTime
      );

      socket.emit(
        "video-seek",
        {
          roomCode:
            roomCode.toUpperCase(),
          currentTime: newTime,
        }
      );
    } catch (error) {
      console.error(
        "Seek error:",
        error
      );
    }

    setTimeout(() => {
      syncingRef.current = false;
    }, 500);
  };

  // =========================================================
  // REWIND 10 SECONDS
  // =========================================================

  const handleRewind = () => {
    if (!playerRef.current) {
      return;
    }

    try {
      const current =
        playerRef.current.getCurrentTime();

      const newTime =
        Math.max(
          0,
          current - 10
        );

      playerRef.current.seekTo(
        newTime,
        true
      );

      setCurrentTime(
        newTime
      );

      socket.emit(
        "video-seek",
        {
          roomCode:
            roomCode.toUpperCase(),
          currentTime: newTime,
        }
      );
    } catch (error) {
      console.error(
        "Rewind error:",
        error
      );
    }
  };

  // =========================================================
  // FORWARD 10 SECONDS
  // =========================================================

  const handleForward = () => {
    if (!playerRef.current) {
      return;
    }

    try {
      const current =
        playerRef.current.getCurrentTime();

      const total =
        playerRef.current.getDuration();

      const newTime =
        Math.min(
          total || duration,
          current + 10
        );

      playerRef.current.seekTo(
        newTime,
        true
      );

      setCurrentTime(
        newTime
      );

      socket.emit(
        "video-seek",
        {
          roomCode:
            roomCode.toUpperCase(),
          currentTime: newTime,
        }
      );
    } catch (error) {
      console.error(
        "Forward error:",
        error
      );
    }
  };

  // =========================================================
  // VOLUME
  // =========================================================

  const handleVolumeChange = (
    event
  ) => {
    if (!playerRef.current) {
      return;
    }

    const newVolume =
      Number(event.target.value);

    try {
      playerRef.current.setVolume(
        newVolume
      );

      if (newVolume === 0) {
        playerRef.current.mute();
        setIsMuted(true);
      } else {
        playerRef.current.unMute();
        setIsMuted(false);
      }

      setVolume(
        newVolume
      );
    } catch (error) {
      console.error(
        "Volume error:",
        error
      );
    }
  };

  // =========================================================
  // MUTE
  // =========================================================

  const handleMute = () => {
    if (!playerRef.current) {
      return;
    }

    try {
      if (
        playerRef.current.isMuted()
      ) {
        playerRef.current.unMute();

        playerRef.current.setVolume(
          volume > 0
            ? volume
            : 100
        );

        setIsMuted(false);
      } else {
        playerRef.current.mute();

        setIsMuted(true);
      }
    } catch (error) {
      console.error(
        "Mute error:",
        error
      );
    }
  };

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const toggleFullscreen =
    async () => {
      if (!containerRef.current) {
        return;
      }

      try {
        if (
          !document.fullscreenElement
        ) {
          await containerRef.current.requestFullscreen();
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
  // SHOW CONTROLS
  // =========================================================

  const showVideoControls = () => {
    setShowControls(true);

    if (
      controlsTimeoutRef.current
    ) {
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
  // CONTROL CLEANUP
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
  // COPY ROOM CODE
  // =========================================================

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(
        roomCode.toUpperCase()
      );

      setCopied(true);

      toast.success(
        "Room code copied!"
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );

      toast.error(
        "Unable to copy room code"
      );
    }
  };

  // =========================================================
  // COPY INVITE LINK
  // =========================================================

  const copyInviteLink = async () => {
    try {
      const link =
        `${window.location.origin}` +
        `/watch-party/join?room=${roomCode.toUpperCase()}`;

      await navigator.clipboard.writeText(
        link
      );

      toast.success(
        "Invite link copied!"
      );
    } catch (error) {
      console.error(
        "Invite copy error:",
        error
      );

      toast.error(
        "Unable to copy invite link"
      );
    }
  };

  // =========================================================
  // SEND LIVE REACTION
  // =========================================================

  const sendReaction = (emoji) => {
    socket.emit("send-reaction", {
      roomCode: roomCode?.toUpperCase(),
      emoji,
      user: userName,
    });
  };

  // =========================================================
  // SESSION RECORDING (HOST ONLY)
  // =========================================================

  const formatRecordTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        toast.error("Screen recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      recordingStreamRef.current = stream;
      recordedChunksRef.current = [];

      let mimeType = "video/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9,opus")) {
          mimeType = "video/webm; codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          mimeType = "video/webm";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          mimeType = "video/mp4";
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        a.download = `watch-party-${(roomCode || "session").toUpperCase()}-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        toast.success("Session recording saved to your device!");
      };

      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast.success("Session recording started!");
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (error.name !== "NotAllowedError") {
        toast.error("Could not start session recording.");
      }
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }

    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // =========================================================
  // LEAVE ROOM
  // =========================================================

  const handleLeaveRoom = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveRoom = () => {
    setShowLeaveConfirm(false);

    if (isRecording) {
      stopRecording();
    }

    socket.emit(
      "leave-room",
      {
        roomCode:
          roomCode.toUpperCase(),
        userId,
        userName,
      }
    );

    navigate("/dashboard", {
      replace: true,
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen theme-bg theme-text flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

        <p className="theme-text-muted">
          Loading Watch Party...
        </p>
      </div>
    );
  }

  // =========================================================
  // ROOM NOT FOUND
  // =========================================================

  if (!room) {
    return (
      <div className="min-h-screen theme-bg theme-text flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">
            Watch Party Not Found
          </h1>

          <p className="theme-text-secondary mb-6">
            This room does not exist or is
            no longer available.
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold transition text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // HOST ID
  // =========================================================

  const hostId =
    room?.host?.userId ||
    room?.host?._id ||
    room?.host?.id ||
    room?.hostId ||
    room?.host;

  const isHost = Boolean(hostId && String(hostId) === String(userId));

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen theme-bg theme-text transition-colors duration-300">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          ROOM HEADER
      ===================================================== */}

      <div className="border-b theme-border theme-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* ROOM INFO */}

            <div className="min-w-0">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                  <Video
                    size={20}
                    className="text-blue-500"
                  />
                </div>

                <div className="min-w-0">

                  <h1 className="text-xl sm:text-2xl font-bold truncate">
                    {room.roomName ||
                      room.name ||
                      "Watch Party"}
                  </h1>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="text-xs theme-text-muted">
                      Room Code:
                    </span>

                    <span className="text-sm font-semibold text-blue-500">
                      {roomCode.toUpperCase()}
                    </span>

                    {isRecording && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/15 text-red-500 border border-red-500/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        REC {formatRecordTime(recordingDuration)}
                      </span>
                    )}

                  </div>

                </div>

              </div>
            </div>

            {/* ROOM ACTIONS */}

            <div className="flex flex-wrap items-center gap-2">

              {/* SESSION RECORDING (HOST ONLY) */}
              {isHost && (
                !isRecording ? (
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    title="Record this watch party session (Host only - saved locally)"
                  >
                    <Disc size={16} />
                    <span>Record Session</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition shadow-sm animate-pulse"
                    title="Stop recording and download file"
                  >
                    <Square size={13} className="fill-white" />
                    <span>Stop ({formatRecordTime(recordingDuration)})</span>
                  </button>
                )
              )}

              <button
                onClick={copyRoomCode}
                className="inline-flex items-center gap-2 theme-card border theme-border hover:border-blue-500 px-3 py-2 rounded-lg text-sm transition"
              >
                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}

                {copied
                  ? "Copied"
                  : "Copy Code"}
              </button>

              <button
                onClick={copyInviteLink}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm font-semibold text-white transition"
              >
                <Link2 size={16} />

                Invite
              </button>

              <button
                onClick={handleLeaveRoom}
                className="inline-flex items-center gap-2 bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-red-500 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-white transition"
              >
                <LogOut size={16} />

                Leave
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* =================================================
              VIDEO AREA
          ================================================= */}

          <div
            className={
              showParticipants ||
              showChat
                ? "xl:col-span-8"
                : "xl:col-span-12"
            }
          >

            <div className="theme-card border theme-border rounded-2xl overflow-hidden shadow-2xl">

              {/* =================================================
                  CUSTOM YOUTUBE PLAYER
              ================================================= */}

              <div
                ref={containerRef}
                onMouseMove={
                  showVideoControls
                }
                className="
                  relative
                  aspect-video
                  bg-black
                  overflow-hidden
                  group
                "
              >

                {/* YOUTUBE */}

                {videoId ? (
                  <YouTube
                    videoId={videoId}
                    className="absolute inset-0 w-full h-full"
                    iframeClassName="w-full h-full pointer-events-none"
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 0,

                        // IMPORTANT:
                        // Hide YouTube's controller
                        controls: 0,

                        modestbranding: 1,

                        rel: 0,

                        // Disable YouTube keyboard controls
                        disablekb: 1,

                        // Hide annotations
                        iv_load_policy: 3,
                      },
                    }}
                    onReady={
                      handlePlayerReady
                    }
                    onStateChange={
                      handlePlayerStateChange
                    }
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="text-center px-6">

                      <Video
                        size={48}
                        className="mx-auto text-gray-500 mb-4"
                      />

                      <h2 className="text-xl font-semibold text-white">
                        Video Unavailable
                      </h2>

                      <p className="text-gray-400 mt-2">
                        The YouTube video URL
                        is invalid.
                      </p>

                    </div>

                  </div>
                )}

                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoadingVideo &&
                  videoId && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                      <div className="rounded-full bg-black/60 p-4 backdrop-blur-sm">

                        <Loader2
                          size={34}
                          className="animate-spin text-white"
                        />

                      </div>

                    </div>
                  )}

                {/* =================================================
                    CENTER PLAY BUTTON
                ================================================= */}

                {!isPlaying &&
                  !isLoadingVideo &&
                  videoId && (
                    <button
                      type="button"
                      onClick={
                        handlePlay
                      }
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
                        z-20
                      "
                    >
                      <Play
                        size={30}
                        fill="currentColor"
                      />
                    </button>
                  )}

                {/* =================================================
                    CUSTOM CONTROLS
                ================================================= */}

                {videoId && (
                  <div
                    className={`
                      absolute
                      bottom-0
                      left-0
                      right-0
                      z-30
                      bg-gradient-to-t
                      from-black
                      via-black/80
                      to-transparent
                      px-4
                      pb-4
                      pt-16
                      transition-opacity
                      duration-300
                      ${
                        showControls
                          ? "opacity-100"
                          : "opacity-0"
                      }
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
                      value={
                        Math.min(
                          currentTime,
                          duration ||
                            0
                        )
                      }
                      onChange={
                        handleSeek
                      }
                      className="
                        w-full
                        h-1.5
                        cursor-pointer
                        accent-blue-500
                      "
                    />

                    {/* =================================================
                        CONTROL ROW
                    ================================================= */}

                    <div className="mt-3 flex items-center gap-2 text-white">

                      {/* PLAY / PAUSE */}

                      <button
                        type="button"
                        onClick={
                          handlePlayPause
                        }
                        className="
                          rounded-lg
                          p-2
                          transition
                          hover:bg-white/10
                        "
                        title={
                          isPlaying
                            ? "Pause"
                            : "Play"
                        }
                      >
                        {isPlaying ? (
                          <Pause
                            size={20}
                          />
                        ) : (
                          <Play
                            size={20}
                          />
                        )}
                      </button>

                      {/* REWIND */}

                      <button
                        type="button"
                        onClick={
                          handleRewind
                        }
                        className="
                          relative
                          rounded-lg
                          p-2
                          transition
                          hover:bg-white/10
                        "
                        title="Rewind 10 seconds"
                      >
                        <RotateCcw
                          size={20}
                        />

                        <span className="
                          absolute
                          left-1/2
                          top-1/2
                          -translate-x-1/2
                          -translate-y-1/2
                          text-[7px]
                          font-bold
                        ">
                          10
                        </span>
                      </button>

                      {/* FORWARD */}

                      <button
                        type="button"
                        onClick={
                          handleForward
                        }
                        className="
                          relative
                          rounded-lg
                          p-2
                          transition
                          hover:bg-white/10
                        "
                        title="Forward 10 seconds"
                      >
                        <RotateCw
                          size={20}
                        />

                        <span className="
                          absolute
                          left-1/2
                          top-1/2
                          -translate-x-1/2
                          -translate-y-1/2
                          text-[7px]
                          font-bold
                        ">
                          10
                        </span>
                      </button>

                      {/* TIME */}

                      <span className="
                        text-xs
                        sm:text-sm
                        text-gray-300
                        whitespace-nowrap
                        ml-1
                      ">
                        {formatTime(
                          currentTime
                        )}

                        {" / "}

                        {formatTime(
                          duration
                        )}
                      </span>

                      {/* SPACER */}

                      <div className="flex-1" />

                      {/* MUTE */}

                      <button
                        type="button"
                        onClick={
                          handleMute
                        }
                        className="
                          rounded-lg
                          p-2
                          transition
                          hover:bg-white/10
                        "
                        title={
                          isMuted
                            ? "Unmute"
                            : "Mute"
                        }
                      >
                        {isMuted ? (
                          <VolumeX
                            size={20}
                          />
                        ) : (
                          <Volume2
                            size={20}
                          />
                        )}
                      </button>

                      {/* VOLUME */}

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
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
                          cursor-pointer
                          accent-blue-500
                        "
                      />

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
                          <Minimize
                            size={20}
                          />
                        ) : (
                          <Maximize
                            size={20}
                          />
                        )}
                      </button>

                    </div>
                  </div>
                )}

                {/* FLOATING EMOJI REACTIONS OVERLAY */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
                  <AnimatePresence>
                    {reactions.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 1, y: 0, scale: 0.8, x: `${r.x}%` }}
                        animate={{ opacity: 0, y: -220, scale: 1.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.2, ease: "easeOut" }}
                        className="absolute bottom-12 flex flex-col items-center"
                      >
                        <span className="text-3xl filter drop-shadow-lg">{r.emoji}</span>
                        <span className="text-[10px] font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-sm mt-0.5">
                          {r.user}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* LIVE REACTION BAR */}
              <div className="flex items-center justify-between px-4 py-3 border-t theme-border theme-card">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs font-semibold theme-text-secondary hidden sm:inline mr-1">
                    Live Reactions:
                  </span>
                  {["❤️", "🔥", "🎉", "👏", "🚀", "😂"].map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.25, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => sendReaction(emoji)}
                      className="text-xl sm:text-2xl p-1.5 rounded-xl hover:bg-gray-500/15 transition cursor-pointer select-none"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer"
                  >
                    <Link2 size={14} />
                    <span>Invite Link</span>
                  </button>
                </div>
              </div>

              {/* =================================================
                  VIDEO INFORMATION
              ================================================= */}

              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t theme-border">

                <div className="flex items-center gap-2">

                  <button
                    onClick={
                      handlePlayPause
                    }
                    className="
                      w-10
                      h-10
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-500
                      text-white
                      transition
                    "
                  >
                    {isPlaying ? (
                      <Pause
                        size={18}
                      />
                    ) : (
                      <Play
                        size={18}
                      />
                    )}
                  </button>

                  <span className="text-sm theme-text-muted">
                    {isPlaying
                      ? "Playing"
                      : "Paused"}
                  </span>

                </div>

                {/* HOST */}

                <div className="flex items-center gap-2 text-sm theme-text-muted">

                  <Crown
                    size={17}
                    className="text-yellow-500"
                  />

                  <span>
                    Host:{" "}

                    <span className="theme-text font-medium">
                      {room.host?.name ||
                        room.hostName ||
                        "Host"}
                    </span>
                  </span>

                </div>

              </div>
            </div>

            {/* =================================================
                ROOM CONTROLS
            ================================================= */}

            <div className="mt-4 grid grid-cols-3 gap-2">

              {/* PARTICIPANTS */}

              <button
                onClick={() =>
                  setShowParticipants(
                    !showParticipants
                  )
                }
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition ${
                  showParticipants
                    ? "bg-blue-600/10 border-blue-500/40 text-blue-500"
                    : "theme-card theme-border theme-text-muted"
                }`}
              >
                <Users size={18} />

                <span className="hidden sm:inline">
                  Participants
                </span>
              </button>

              {/* CHAT */}

              <button
                onClick={() =>
                  setShowChat(
                    !showChat
                  )
                }
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition ${
                  showChat
                    ? "bg-blue-600/10 border-blue-500/40 text-blue-500"
                    : "theme-card theme-border theme-text-muted"
                }`}
              >
                <MessageCircle
                  size={18}
                />

                <span className="hidden sm:inline">
                  Chat
                </span>
              </button>

              {/* VIDEO CALL */}

              <button
                onClick={() =>
                  setShowVideoCall(
                    !showVideoCall
                  )
                }
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition ${
                  showVideoCall
                    ? "bg-green-600/10 border-green-500/40 text-green-500"
                    : "theme-card theme-border theme-text-muted"
                }`}
              >
                <Video size={18} />

                <span className="hidden sm:inline">
                  Video Call
                </span>
              </button>

            </div>

            {/* =================================================
                VIDEO CALL
            ================================================= */}

            {showVideoCall && (
              <div className="mt-4">

                <VideoCall
                  roomCode={
                    roomCode
                  }
                  userId={
                    userId
                  }
                  userName={
                    userName
                  }
                  socket={
                    socket
                  }
                />

              </div>
            )}

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          {(showParticipants ||
            showChat) && (
            <div className="xl:col-span-4 space-y-6">

              {/* PARTICIPANTS */}

              {showParticipants && (
                <div className="theme-card border theme-border rounded-2xl overflow-hidden">

                  <div className="flex items-center justify-between p-4 border-b theme-border">

                    <div className="flex items-center gap-2">

                      <Users
                        size={19}
                        className="text-blue-500"
                      />

                      <h2 className="font-semibold">
                        Participants
                      </h2>

                    </div>

                    <span className="text-xs bg-blue-600/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded-full">
                      {participants.length}
                    </span>

                  </div>

                  <div className="max-h-72 overflow-y-auto">

                    <ParticipantList
                      participants={
                        participants
                      }
                      currentUserId={
                        userId
                      }
                      hostId={
                        hostId
                      }
                    />

                  </div>
                </div>
              )}

              {/* CHAT */}

              {showChat && (
                <div className="theme-card border theme-border rounded-2xl overflow-hidden">

                  <div className="flex items-center gap-2 p-4 border-b theme-border">

                    <MessageCircle
                      size={19}
                      className="text-blue-500"
                    />

                    <h2 className="font-semibold">
                      Live Chat
                    </h2>

                  </div>

                  <ChatBox
                    roomCode={
                      roomCode
                    }
                    userId={
                      userId
                    }
                    userName={
                      userName
                    }
                    socket={
                      socket
                    }
                  />

                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* LEAVE PARTY CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveRoom}
        title="Leave Watch Party?"
        message="Are you sure you want to leave this watch party session? You can rejoin anytime using the room code."
        confirmText="Yes, Leave Party"
        cancelText="Stay in Party"
        type="danger"
      />
    </div>
  );
}

export default WatchRoom;