import { useEffect, useRef, useState } from "react";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  PhoneOff,
  Monitor,
  UserCircle,
  Sun,
  Moon,
} from "lucide-react";

import toast from "react-hot-toast";

function VideoCall({
  roomCode,
  userId,
  userName,
  socket,
}) {
  // =========================================================
  // THEME
  // =========================================================

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    // Read the theme selected by App.jsx
    const savedTheme =
      localStorage.getItem("theme");

    return savedTheme !== "light";
  });

  // =========================================================
  // LISTEN TO APP THEME CHANGES
  // =========================================================

  useEffect(() => {
    const updateTheme = () => {
      const currentTheme =
        localStorage.getItem("theme");

      setIsDark(currentTheme !== "light");
    };

    // Initial theme
    updateTheme();

    // Listen for your App.jsx themeChanged event
    window.addEventListener(
      "themeChanged",
      updateTheme
    );

    // Also listen for localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        updateTheme();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "themeChanged",
        updateTheme
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // =========================================================
  // REFS
  // =========================================================

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const peerConnectionsRef = useRef({});
  const remoteStreamsRef = useRef({});
  const iceCandidateQueueRef = useRef({});

  // =========================================================
  // STATE
  // =========================================================

  const [started, setStarted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  // =========================================================
  // THEME CLASSES
  // =========================================================

  const theme = {
    container: isDark
      ? "bg-[#07111F] border-[#1E3A5F] text-white"
      : "bg-white border-slate-200 text-slate-900",

    card: isDark
      ? "bg-[#10243A] border-[#1E3A5F]"
      : "bg-slate-50 border-slate-200",

    secondaryText: isDark
      ? "text-gray-400"
      : "text-slate-500",

    mutedText: isDark
      ? "text-gray-500"
      : "text-slate-400",

    videoPlaceholder: isDark
      ? "bg-[#10243A] border-[#1E3A5F]"
      : "bg-slate-100 border-slate-200",

    videoBorder: isDark
      ? "border-[#1E3A5F]"
      : "border-slate-200",

    status: isDark
      ? "bg-black/70 text-white"
      : "bg-white/85 text-slate-800",

    waitingIcon: isDark
      ? "text-gray-600"
      : "text-slate-400",
  };

  // =========================================================
  // WEBRTC CONFIG
  // =========================================================

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };

  // =========================================================
  // ATTACH LOCAL STREAM
  // =========================================================

  const attachLocalStream = (stream) => {
    if (!localVideoRef.current) {
      return;
    }

    localVideoRef.current.srcObject = stream;

    localVideoRef.current
      .play()
      .catch(() => {});
  };

  // =========================================================
  // START CAMERA
  // =========================================================

  const startCamera = async () => {
    try {
      const existingStream =
        localStreamRef.current;

      if (existingStream) {
        const videoTrack =
          existingStream.getVideoTracks()[0];

        if (
          videoTrack &&
          videoTrack.readyState === "live"
        ) {
          attachLocalStream(existingStream);

          setStarted(true);

          return;
        }
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
            facingMode: "user",
          },
          audio: true,
        });

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      localStreamRef.current = stream;

      attachLocalStream(stream);

      setStarted(true);
      setCameraOff(false);
      setMicOff(false);

      Object.values(
        peerConnectionsRef.current
      ).forEach((peerConnection) => {
        const senders =
          peerConnection.getSenders();

        stream.getTracks().forEach((track) => {
          const sender = senders.find(
            (item) =>
              item.track &&
              item.track.kind === track.kind
          );

          if (sender) {
            sender
              .replaceTrack(track)
              .catch((error) => {
                console.error(
                  "replaceTrack error:",
                  error
                );
              });
          } else {
            peerConnection.addTrack(
              track,
              stream
            );
          }
        });
      });

      socket.emit("video-call-ready", {
        roomCode,
        userId,
        userName,
      });
    } catch (error) {
      console.error(
        "Camera / microphone error:",
        error
      );

      if (
        error.name === "NotAllowedError"
      ) {
        toast.error(
          "Camera or microphone permission was denied"
        );
      } else {
        toast.error(
          "Unable to access camera or microphone"
        );
      }
    }
  };

  // =========================================================
  // CREATE PEER CONNECTION
  // =========================================================

  const createPeerConnection = (
    remoteUserId,
    createOffer = false
  ) => {
    if (!remoteUserId) {
      return null;
    }

    if (
      peerConnectionsRef.current[
        remoteUserId
      ]
    ) {
      return peerConnectionsRef.current[
        remoteUserId
      ];
    }

    const peerConnection =
      new RTCPeerConnection(
        rtcConfig
      );

    peerConnectionsRef.current[
      remoteUserId
    ] = peerConnection;

    // -------------------------------------------------------
    // ADD LOCAL TRACKS
    // -------------------------------------------------------

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            localStreamRef.current
          );
        });
    }

    // -------------------------------------------------------
    // REMOTE STREAM
    // -------------------------------------------------------

    peerConnection.ontrack = (event) => {
      let stream =
        event.streams &&
        event.streams[0];

      if (!stream) {
        stream =
          remoteStreamsRef.current[
            remoteUserId
          ] || new MediaStream();

        if (
          !stream
            .getTracks()
            .some(
              (t) =>
                t.id ===
                event.track.id
            )
        ) {
          stream.addTrack(
            event.track
          );
        }
      }

      remoteStreamsRef.current[
        remoteUserId
      ] = stream;

      setRemoteStreams((prev) => ({
        ...prev,
        [remoteUserId]: stream,
      }));

      setConnectedUsers((prev) => {
        if (
          prev.includes(remoteUserId)
        ) {
          return prev;
        }

        return [
          ...prev,
          remoteUserId,
        ];
      });
    };

    // -------------------------------------------------------
    // ICE
    // -------------------------------------------------------

    peerConnection.onicecandidate =
      (event) => {
        if (!event.candidate) {
          return;
        }

        socket.emit(
          "video-call-ice-candidate",
          {
            roomCode,
            targetUserId:
              remoteUserId,
            fromUserId: userId,
            candidate:
              event.candidate,
          }
        );
      };

    // -------------------------------------------------------
    // CONNECTION STATE
    // -------------------------------------------------------

    peerConnection.onconnectionstatechange =
      () => {
        console.log(
          "Peer connection state:",
          remoteUserId,
          peerConnection.connectionState
        );

        if (
          peerConnection.connectionState ===
            "failed" ||
          peerConnection.connectionState ===
            "closed" ||
          peerConnection.connectionState ===
            "disconnected"
        ) {
          delete remoteStreamsRef.current[
            remoteUserId
          ];
          delete iceCandidateQueueRef.current[
            remoteUserId
          ];

          setRemoteStreams((prev) => {
            const updated = {
              ...prev,
            };

            delete updated[
              remoteUserId
            ];

            return updated;
          });

          setConnectedUsers((prev) =>
            prev.filter(
              (id) =>
                id !== remoteUserId
            )
          );
        }
      };

    // -------------------------------------------------------
    // OFFER
    // -------------------------------------------------------

    if (createOffer) {
      createOfferForUser(
        peerConnection,
        remoteUserId
      );
    }

    return peerConnection;
  };

  // =========================================================
  // FLUSH QUEUED ICE CANDIDATES
  // =========================================================

  const flushIceCandidates = async (
    targetUserId,
    peerConnection
  ) => {
    const queue =
      iceCandidateQueueRef.current[
        targetUserId
      ];

    if (queue && queue.length > 0) {
      const candidates = [...queue];
      iceCandidateQueueRef.current[
        targetUserId
      ] = [];

      for (const cand of candidates) {
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(cand)
          );
        } catch (err) {
          console.error(
            "Error adding queued ICE candidate:",
            err
          );
        }
      }
    }
  };

  // =========================================================
  // CREATE OFFER
  // =========================================================

  const createOfferForUser = async (
    peerConnection,
    remoteUserId
  ) => {
    try {
      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      socket.emit(
        "video-call-offer",
        {
          roomCode,
          targetUserId:
            remoteUserId,
          fromUserId: userId,
          offer,
        }
      );
    } catch (error) {
      console.error(
        "Create offer error:",
        error
      );
    }
  };

  // =========================================================
  // SOCKET EVENTS
  // =========================================================

  useEffect(() => {
    if (
      !socket ||
      !roomCode ||
      !userId
    ) {
      return;
    }

    // -------------------------------------------------------
    // USER READY
    // -------------------------------------------------------

    const handleUserReady = ({
      userId: remoteUserId,
    }) => {
      if (
        !remoteUserId ||
        remoteUserId === userId
      ) {
        return;
      }

      console.log(
        "Video user ready:",
        remoteUserId
      );

      setConnectedUsers((prev) => {
        if (
          prev.includes(remoteUserId)
        ) {
          return prev;
        }

        return [
          ...prev,
          remoteUserId,
        ];
      });

      if (
        localStreamRef.current
      ) {
        createPeerConnection(
          remoteUserId,
          true
        );
      }
    };

    // -------------------------------------------------------
    // OFFER
    // -------------------------------------------------------

    const handleOffer = async ({
      fromUserId,
      targetUserId,
      offer,
    }) => {
      if (!fromUserId || !offer) {
        return;
      }

      if (
        targetUserId &&
        String(targetUserId) !==
          String(userId)
      ) {
        return;
      }

      try {
        const peerConnection =
          createPeerConnection(
            fromUserId,
            false
          );

        if (!peerConnection) {
          return;
        }

        setConnectedUsers((prev) => {
          if (
            prev.includes(fromUserId)
          ) {
            return prev;
          }

          return [
            ...prev,
            fromUserId,
          ];
        });

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        await flushIceCandidates(
          fromUserId,
          peerConnection
        );

        const answer =
          await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(
          answer
        );

        socket.emit(
          "video-call-answer",
          {
            roomCode,
            targetUserId:
              fromUserId,
            fromUserId: userId,
            answer,
          }
        );
      } catch (error) {
        console.error(
          "Handle offer error:",
          error
        );
      }
    };

    // -------------------------------------------------------
    // ANSWER
    // -------------------------------------------------------

    const handleAnswer = async ({
      fromUserId,
      targetUserId,
      answer,
    }) => {
      if (!fromUserId || !answer) {
        return;
      }

      if (
        targetUserId &&
        String(targetUserId) !==
          String(userId)
      ) {
        return;
      }

      const peerConnection =
        peerConnectionsRef.current[
          fromUserId
        ];

      if (!peerConnection) {
        return;
      }

      setConnectedUsers((prev) => {
        if (
          prev.includes(fromUserId)
        ) {
          return prev;
        }

        return [
          ...prev,
          fromUserId,
        ];
      });

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        await flushIceCandidates(
          fromUserId,
          peerConnection
        );
      } catch (error) {
        console.error(
          "Handle answer error:",
          error
        );
      }
    };

    // -------------------------------------------------------
    // ICE
    // -------------------------------------------------------

    const handleIceCandidate = async ({
      fromUserId,
      targetUserId,
      candidate,
    }) => {
      if (
        !fromUserId ||
        !candidate
      ) {
        return;
      }

      if (
        targetUserId &&
        String(targetUserId) !==
          String(userId)
      ) {
        return;
      }

      const peerConnection =
        peerConnectionsRef.current[
          fromUserId
        ];

      if (
        !peerConnection ||
        !peerConnection.remoteDescription ||
        !peerConnection.remoteDescription.type
      ) {
        if (
          !iceCandidateQueueRef
            .current[fromUserId]
        ) {
          iceCandidateQueueRef.current[
            fromUserId
          ] = [];
        }

        iceCandidateQueueRef.current[
          fromUserId
        ].push(candidate);

        return;
      }

      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      } catch (error) {
        console.error(
          "ICE candidate error:",
          error
        );
      }
    };

    // -------------------------------------------------------
    // USER LEFT
    // -------------------------------------------------------

    const handleUserLeft = ({
      userId: remoteUserId,
    }) => {
      if (!remoteUserId) {
        return;
      }

      console.log(
        "Video user left:",
        remoteUserId
      );

      const peerConnection =
        peerConnectionsRef.current[
          remoteUserId
        ];

      if (peerConnection) {
        peerConnection.close();

        delete peerConnectionsRef.current[
          remoteUserId
        ];
      }

      delete remoteStreamsRef.current[
        remoteUserId
      ];
      delete iceCandidateQueueRef.current[
        remoteUserId
      ];

      setConnectedUsers((prev) =>
        prev.filter(
          (id) =>
            id !== remoteUserId
        )
      );

      setRemoteStreams((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[
          remoteUserId
        ];

        return updated;
      });
    };

    socket.on(
      "video-call-ready",
      handleUserReady
    );

    socket.on(
      "video-call-offer",
      handleOffer
    );

    socket.on(
      "video-call-answer",
      handleAnswer
    );

    socket.on(
      "video-call-ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "video-call-user-left",
      handleUserLeft
    );

    return () => {
      socket.off(
        "video-call-ready",
        handleUserReady
      );

      socket.off(
        "video-call-offer",
        handleOffer
      );

      socket.off(
        "video-call-answer",
        handleAnswer
      );

      socket.off(
        "video-call-ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "video-call-user-left",
        handleUserLeft
      );
    };
  }, [
    socket,
    roomCode,
    userId,
  ]);

  // =========================================================
  // CAMERA TOGGLE
  // =========================================================

  const toggleCamera = async () => {
    let stream =
      localStreamRef.current;

    if (!stream) {
      await startCamera();
      return;
    }

    let videoTrack =
      stream.getVideoTracks()[0];

    if (
      !videoTrack ||
      videoTrack.readyState === "ended"
    ) {
      await startCamera();
      return;
    }

    if (videoTrack.enabled) {
      videoTrack.enabled = false;

      setCameraOff(true);

      toast("Camera turned off");
    } else {
      videoTrack.enabled = true;

      setCameraOff(false);

      attachLocalStream(stream);

      toast.success(
        "Camera turned on"
      );
    }
  };

  // =========================================================
  // MICROPHONE TOGGLE
  // =========================================================

  const toggleMicrophone = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTrack =
      stream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicOff(
      !audioTrack.enabled
    );

    if (audioTrack.enabled) {
      toast.success(
        "Microphone unmuted"
      );
    } else {
      toast(
        "Microphone muted"
      );
    }
  };

  // =========================================================
  // SCREEN SHARE
  // =========================================================

  const shareScreen = async () => {
    try {
      if (
        !localStreamRef.current
      ) {
        toast.error(
          "Start the camera first"
        );

        return;
      }

      const screenStream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
            audio: false,
          }
        );

      const screenTrack =
        screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        return;
      }

      screenStreamRef.current =
        screenStream;

      screenTrackRef.current =
        screenTrack;

      Object.values(
        peerConnectionsRef.current
      ).forEach(
        (peerConnection) => {
          const sender =
            peerConnection
              .getSenders()
              .find(
                (item) =>
                  item.track &&
                  item.track.kind ===
                    "video"
              );

          if (sender) {
            sender.replaceTrack(
              screenTrack
            );
          }
        }
      );

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      setIsSharing(true);

      socket.emit(
        "screen-share-start",
        {
          roomCode,
          userId,
          userName,
        }
      );

      toast.success(
        "Screen sharing started"
      );

      screenTrack.onended =
        () => {
          stopScreenShare();
        };
    } catch (error) {
      console.error(
        "Screen share error:",
        error
      );

      if (
        error.name !==
        "NotAllowedError"
      ) {
        toast.error(
          "Unable to share screen"
        );
      }
    }
  };

  // =========================================================
  // STOP SCREEN SHARE
  // =========================================================

  const stopScreenShare = () => {
    const cameraTrack =
      localStreamRef.current?.getVideoTracks()[0];

    Object.values(
      peerConnectionsRef.current
    ).forEach(
      (peerConnection) => {
        const sender =
          peerConnection
            .getSenders()
            .find(
              (item) =>
                item.track &&
                item.track.kind ===
                  "video"
            );

        if (
          sender &&
          cameraTrack
        ) {
          sender
            .replaceTrack(
              cameraTrack
            )
            .catch((error) => {
              console.error(
                "Camera replace error:",
                error
              );
            });
        }
      }
    );

    if (
      screenStreamRef.current
    ) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    screenStreamRef.current =
      null;

    screenTrackRef.current =
      null;

    if (
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject =
        localStreamRef.current;

      localVideoRef.current
        .play()
        .catch(() => {});
    }

    setIsSharing(false);

    socket.emit(
      "screen-share-stop",
      {
        roomCode,
        userId,
      }
    );

    toast(
      "Screen sharing stopped"
    );
  };

  // =========================================================
  // END CALL
  // =========================================================

  const endCall = () => {
    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      localStreamRef.current =
        null;
    }

    if (
      screenStreamRef.current
    ) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      screenStreamRef.current =
        null;
    }

    screenTrackRef.current =
      null;

    Object.values(
      peerConnectionsRef.current
    ).forEach(
      (peerConnection) => {
        peerConnection.close();
      }
    );

    peerConnectionsRef.current =
      {};
    remoteStreamsRef.current =
      {};
    iceCandidateQueueRef.current =
      {};

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    socket.emit(
      "video-call-left",
      {
        roomCode,
        userId,
      }
    );

    setRemoteStreams({});
    setConnectedUsers([]);
    setStarted(false);
    setCameraOff(false);
    setMicOff(false);
    setIsSharing(false);

    toast.success(
      "Call ended"
    );
  };

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      if (
        localStreamRef.current
      ) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        localStreamRef.current =
          null;
      }

      if (
        screenStreamRef.current
      ) {
        screenStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        screenStreamRef.current =
          null;
      }

      Object.values(
        peerConnectionsRef.current
      ).forEach(
        (peerConnection) => {
          peerConnection.close();
        }
      );

      peerConnectionsRef.current =
        {};
      remoteStreamsRef.current =
        {};
      iceCandidateQueueRef.current =
        {};
    };
  }, []);

  // =========================================================
  // REMOTE USERS
  // =========================================================

  const remoteUsers = Array.from(
    new Set([
      ...connectedUsers,
      ...Object.keys(remoteStreams),
    ])
  ).filter(
    (id) => id && String(id) !== String(userId)
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className={`w-full border rounded-2xl p-4 sm:p-5 transition-colors duration-500 ${theme.container}`}
    >
      {/* =====================================================
          AUTOMATIC THEME INDICATOR
      ====================================================== */}

      <div className="flex justify-end mb-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            isDark
              ? "bg-slate-800/70 border-slate-700 text-slate-300"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          {isDark ? (
            <Moon size={14} />
          ) : (
            <Sun size={14} />
          )}

          <span>
            {isDark
              ? "Dark Mode"
              : "Light Mode"}
          </span>

          <span className="opacity-60">
            • Auto
          </span>
        </div>
      </div>

      {/* =====================================================
          NOT STARTED
      ====================================================== */}

      {!started ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark
                ? "bg-blue-600/20 border border-blue-500/30"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <Video
              size={30}
              className="text-blue-500"
            />
          </div>

          <h3 className="text-lg font-semibold">
            Start Video Call
          </h3>

          <p
            className={`text-sm mt-2 text-center max-w-md ${theme.secondaryText}`}
          >
            Turn on your camera and microphone
            to join the video call.
          </p>

          <button
            onClick={startCamera}
            className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition hover:scale-105"
          >
            <Video size={19} />
            Start Camera
          </button>
        </div>
      ) : (
        <>
          {/* =================================================
              VIDEO GRID
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CURRENT USER */}

            <div
              className={`relative aspect-video rounded-2xl overflow-hidden bg-black border ${theme.videoBorder}`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* CAMERA OFF */}

              {cameraOff && (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center ${
                    isDark
                      ? "bg-[#10243A]"
                      : "bg-slate-100"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                    {userName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <p
                    className={`text-sm mt-3 ${theme.secondaryText}`}
                  >
                    Camera Off
                  </p>
                </div>
              )}

              {/* SCREEN SHARING */}

              {isSharing && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                  <Monitor size={14} />
                  Sharing Screen
                </div>
              )}

              {/* USER NAME */}

              <div
                className={`absolute bottom-3 left-3 flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs sm:text-sm ${theme.status}`}
              >
                <div className="w-2 h-2 rounded-full bg-green-400" />

                {userName || "You"} (You)
              </div>
            </div>

            {/* REMOTE USER */}

            {remoteUsers.length > 0 ? (
              remoteUsers.map(
                (remoteUserId) => {
                  const remoteStream =
                    remoteStreams[
                      remoteUserId
                    ];

                  return (
                    <RemoteVideo
                      key={remoteUserId}
                      remoteUserId={
                        remoteUserId
                      }
                      stream={
                        remoteStream
                      }
                      isDark={isDark}
                    />
                  );
                }
              )
            ) : (
              <div
                className={`relative aspect-video rounded-2xl flex items-center justify-center border ${theme.videoPlaceholder}`}
              >
                <div className="text-center">
                  <UserCircle
                    size={48}
                    className={`mx-auto ${theme.waitingIcon}`}
                  />

                  <p
                    className={`text-sm mt-3 ${theme.secondaryText}`}
                  >
                    Waiting for another participant...
                  </p>

                  <p
                    className={`text-xs mt-1 ${theme.mutedText}`}
                  >
                    Ask them to start their camera.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              CONTROLS
          ================================================== */}

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mt-5">
            {/* MICROPHONE */}

            <button
              onClick={toggleMicrophone}
              title={
                micOff
                  ? "Unmute microphone"
                  : "Mute microphone"
              }
              className={`flex items-center justify-center gap-2 w-12 h-12 sm:w-32 rounded-xl transition hover:scale-105 text-white ${
                micOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
            >
              {micOff ? (
                <MicOff size={19} />
              ) : (
                <Mic size={19} />
              )}

              <span className="hidden sm:inline text-sm font-semibold">
                {micOff
                  ? "Unmute"
                  : "Mute"}
              </span>
            </button>

            {/* CAMERA */}

            <button
              onClick={toggleCamera}
              title={
                cameraOff
                  ? "Turn camera on"
                  : "Turn camera off"
              }
              className={`flex items-center justify-center gap-2 w-12 h-12 sm:w-32 rounded-xl transition hover:scale-105 text-white ${
                cameraOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {cameraOff ? (
                <Video size={19} />
              ) : (
                <VideoOff size={19} />
              )}

              <span className="hidden sm:inline text-sm font-semibold">
                {cameraOff
                  ? "Camera On"
                  : "Camera Off"}
              </span>
            </button>

            {/* SCREEN SHARE */}

            {!isSharing ? (
              <button
                onClick={shareScreen}
                title="Share screen"
                className="flex items-center justify-center gap-2 w-12 h-12 sm:w-36 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition hover:scale-105"
              >
                <MonitorUp size={19} />

                <span className="hidden sm:inline text-sm font-semibold">
                  Share Screen
                </span>
              </button>
            ) : (
              <button
                onClick={stopScreenShare}
                title="Stop screen sharing"
                className="flex items-center justify-center gap-2 w-12 h-12 sm:w-36 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition hover:scale-105"
              >
                <MonitorOff size={19} />

                <span className="hidden sm:inline text-sm font-semibold">
                  Stop Sharing
                </span>
              </button>
            )}

            {/* END CALL */}

            <button
              onClick={endCall}
              title="End call"
              className="flex items-center justify-center gap-2 w-12 h-12 sm:w-32 rounded-xl bg-red-600 hover:bg-red-500 text-white transition hover:scale-105"
            >
              <PhoneOff size={19} />

              <span className="hidden sm:inline text-sm font-semibold">
                End Call
              </span>
            </button>
          </div>

          {/* =================================================
              SCREEN SHARE STATUS
          ================================================== */}

          {isSharing && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-full text-xs sm:text-sm">
                <Monitor size={15} />
                You are sharing your screen
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===========================================================
// REMOTE VIDEO
// ===========================================================

function RemoteVideo({
  remoteUserId,
  stream,
  isDark,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (
      !videoRef.current ||
      !stream
    ) {
      return;
    }

    videoRef.current.srcObject =
      stream;

    videoRef.current
      .play()
      .catch((err) => {
        console.warn("Remote video auto-play prevented:", err);
      });
  }, [stream]);

  return (
    <div
      onClick={() => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }}
      className={`relative aspect-video rounded-2xl overflow-hidden bg-black border cursor-pointer ${
        isDark
          ? "border-[#1E3A5F]"
          : "border-slate-200"
      }`}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onLoadedMetadata={() => {
            videoRef.current
              ?.play()
              .catch(() => {});
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${
            isDark
              ? "bg-[#10243A]"
              : "bg-slate-100"
          }`}
        >
          <UserCircle
            size={48}
            className="text-cyan-500 animate-pulse"
          />

          <p
            className={`text-sm mt-3 ${
              isDark
                ? "text-gray-400"
                : "text-slate-500"
            }`}
          >
            Connecting to participant...
          </p>
        </div>
      )}

      <div
        className={`absolute bottom-3 left-3 flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs sm:text-sm ${
          isDark
            ? "bg-black/70 text-white"
            : "bg-white/85 text-slate-800"
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400" />

        Participant
      </div>
    </div>
  );
}

export default VideoCall;