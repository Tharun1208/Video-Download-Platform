import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import pexelsRoutes from "./routes/pexelsRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import Room from "./models/Room.js";

// ==========================================
// DATABASE
// ==========================================

connectDB();

const app = express();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()) : []),
];

const checkOrigin = (origin, callback) => {
  // Allow requests without an origin (e.g. mobile apps, curl, Postman, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  const isAllowed =
    allowedOrigins.includes(origin) ||
    allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed)) ||
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".netlify.app") ||
    origin.endsWith(".onrender.com");

  if (isAllowed) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};

app.use(
  cors({
    origin: checkOrigin,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    credentials: true,

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==========================================
// BODY PARSERS
// ==========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Video Download Platform Backend is Running...",
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// User
app.use(
  "/api/users",
  userRoutes
);

// Videos
app.use(
  "/api/videos",
  videoRoutes
);

// Downloads
app.use(
  "/api/downloads",
  downloadRoutes
);

// Subscription
app.use(
  "/api/subscription",
  subscriptionRoutes
);

// Admin
app.use(
  "/api/admin",
  adminRoutes
);

// Upload
app.use(
  "/api/upload",
  uploadRoutes
);

// Notifications
app.use(
  "/api/notifications",
  notificationRoutes
);

// Pexels
app.use(
  "/api/pexels",
  pexelsRoutes
);

// Comments
app.use(
  "/api/comments",
  commentRoutes
);

// ==========================================
// GEMINI TRANSLATION
// POST /api/translate
// ==========================================

app.use(
  "/api/translate",
  translationRoutes
);

// ==========================================
// WATCH PARTY
// ==========================================

app.use(
  "/api/rooms",
  roomRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  console.log(
    "404 ROUTE:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    console.error(
      "===================================="
    );

    console.error(
      "SERVER ERROR:"
    );

    console.error(err);

    console.error(
      "===================================="
    );

    // CORS error
    if (
      err.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS policy blocked this request.",
      });
    }

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// ==========================================
// HTTP SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

const server =
  http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
  cors: {
    origin: checkOrigin,

    methods: [
      "GET",
      "POST",
    ],

    credentials: true,
  },
});

// ==========================================
// WATCH PARTY SOCKET STATE
// ==========================================

const rooms = new Map();
const roomMessages = new Map();

// Helper to get active deduplicated participants for a room
const getRoomParticipants = (code) => {
  if (!rooms.has(code)) return [];
  const roomUsers = rooms.get(code);
  const uniqueUsers = new Map();

  for (const user of roomUsers.values()) {
    if (user.userId && !uniqueUsers.has(String(user.userId))) {
      uniqueUsers.set(String(user.userId), {
        userId: user.userId,
        name: user.name || "User",
        socketId: user.socketId,
      });
    }
  }

  return Array.from(uniqueUsers.values());
};

// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on(
  "connection",
  (socket) => {
    console.log(
      "Socket connected:",
      socket.id
    );

    // ========================================
    // JOIN ROOM
    // ========================================

    socket.on(
      "join-room",
      ({
        roomCode,
        userId,
        userName,
      }) => {
        try {
          if (
            !roomCode ||
            !userId
          ) {
            console.log(
              "Join room failed: missing data"
            );

            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          // Join Socket.IO room
          socket.join(code);

          // Store socket information
          socket.data.roomCode =
            code;

          socket.data.userId =
            userId;

          socket.data.userName =
            userName || "User";

          // Create room if it doesn't exist
          if (!rooms.has(code)) {
            rooms.set(
              code,
              new Map()
            );
          }

          const roomUsers =
            rooms.get(code);

          // Add user
          roomUsers.set(
            socket.id,
            {
              socketId:
                socket.id,

              userId,

              name:
                userName ||
                "User",
            }
          );

          console.log(
            `${
              userName ||
              "User"
            } joined room ${code}`
          );

          // ====================================
          // BROADCAST ACTIVE PARTICIPANTS
          // ====================================

          const activeParticipants = getRoomParticipants(code);
          io.to(code).emit("participants-update", activeParticipants);

          // Sync participant to Room document in MongoDB
          Room.updateOne(
            { roomCode: code },
            {
              $addToSet: {
                participants: {
                  userId,
                  name: userName || "User",
                  isHost: false,
                },
              },
            }
          ).catch((err) =>
            console.error("Room participant DB sync error:", err)
          );

          // ====================================
          // SEND CHAT HISTORY TO NEW USER
          // ====================================

          const history = roomMessages.get(code) || [];
          socket.emit("chat-history", history);

          // ====================================
          // NOTIFY OTHER USERS (FOR TOASTS)
          // ====================================

          socket
            .to(code)
            .emit(
              "user-joined",
              {
                userId,

                name:
                  userName ||
                  "User",
              }
            );
        } catch (error) {
          console.error(
            "join-room error:",
            error
          );
        }
      }
    );

    // ========================================
    // GET PARTICIPANTS ON DEMAND
    // ========================================

    socket.on("get-participants", ({ roomCode }) => {
      try {
        if (!roomCode) return;
        const code = String(roomCode).toUpperCase();
        const activeParticipants = getRoomParticipants(code);
        socket.emit("participants-update", activeParticipants);
      } catch (err) {
        console.error("get-participants error:", err);
      }
    });

    // ========================================
    // VIDEO PLAY
    // ========================================

    socket.on(
      "video-play",
      (data) => {
        try {
          const roomCode =
            data?.roomCode;

          const currentTime =
            Number(
              data?.currentTime ||
                0
            );

          if (!roomCode) {
            console.log(
              "video-play: roomCode missing"
            );

            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          console.log(
            `▶ Video PLAY | Room: ${code} | Time: ${currentTime}`
          );

          socket
            .to(code)
            .emit(
              "video-play",
              {
                roomCode:
                  code,

                currentTime,
              }
            );
        } catch (error) {
          console.error(
            "video-play error:",
            error
          );
        }
      }
    );

    // ========================================
    // VIDEO PAUSE
    // ========================================

    socket.on(
      "video-pause",
      (data) => {
        try {
          const roomCode =
            data?.roomCode;

          const currentTime =
            Number(
              data?.currentTime ||
                0
            );

          if (!roomCode) {
            console.log(
              "video-pause: roomCode missing"
            );

            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          console.log(
            `⏸ Video PAUSE | Room: ${code} | Time: ${currentTime}`
          );

          socket
            .to(code)
            .emit(
              "video-pause",
              {
                roomCode:
                  code,

                currentTime,
              }
            );
        } catch (error) {
          console.error(
            "video-pause error:",
            error
          );
        }
      }
    );

    // ========================================
    // VIDEO SEEK
    // ========================================

    socket.on(
      "video-seek",
      (data) => {
        try {
          const roomCode =
            data?.roomCode;

          const currentTime =
            Number(
              data?.currentTime ||
                0
            );

          if (!roomCode) {
            console.log(
              "video-seek: roomCode missing"
            );

            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          console.log(
            `⏩ Video SEEK | Room: ${code} | Time: ${currentTime}`
          );

          socket
            .to(code)
            .emit(
              "video-seek",
              {
                roomCode:
                  code,

                currentTime,
              }
            );
        } catch (error) {
          console.error(
            "video-seek error:",
            error
          );
        }
      }
    );

    // ========================================
    // EMOJI REACTION BURST
    // ========================================

    socket.on("send-reaction", (data) => {
      try {
        const roomCode = String(data?.roomCode || "").toUpperCase();
        if (!roomCode) return;

        io.to(roomCode).emit("new-reaction", {
          id: Math.random().toString(36).substring(2, 9),
          emoji: data?.emoji || "❤️",
          user: data?.user || "Guest",
          createdAt: Date.now(),
        });
      } catch (err) {
        console.error("send-reaction error:", err);
      }
    });

    // ========================================
    // CHAT
    // ========================================

    socket.on(
      "send-message",
      ({
        roomCode,
        userId,
        userName,
        message,
      }) => {
        try {
          if (
            !roomCode ||
            !message?.trim()
          ) {
            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          const chatMessage = {
            id: `${userId}-${Date.now()}`,

            userId,

            userName:
              userName ||
              "User",

            senderId:
              userId,

            sender:
              userName ||
              "User",

            message:
              message.trim(),

            createdAt:
              new Date().toISOString(),
          };

          console.log(
            `💬 Chat message | Room: ${code} | User: ${
              userName ||
              "User"
            }`
          );

          if (!roomMessages.has(code)) {
            roomMessages.set(code, []);
          }
          const msgs = roomMessages.get(code);
          msgs.push(chatMessage);
          if (msgs.length > 100) {
            msgs.shift();
          }

          io.to(code).emit(
            "receive-message",
            chatMessage
          );
        } catch (error) {
          console.error(
            "send-message error:",
            error
          );
        }
      }
    );

    // ========================================
    // LEAVE ROOM
    // ========================================

    socket.on(
      "leave-room",
      ({
        roomCode,
        userId,
        userName,
      }) => {
        try {
          if (!roomCode) {
            return;
          }

          const code =
            String(
              roomCode
            ).toUpperCase();

          socket.leave(code);

          if (rooms.has(code)) {
            const roomUsers =
              rooms.get(code);

            roomUsers.delete(
              socket.id
            );

            socket
              .to(code)
              .emit(
                "user-left",
                {
                  userId,

                  name:
                    userName ||
                    "User",
                }
              );

            const updatedParticipants = getRoomParticipants(code);
            io.to(code).emit("participants-update", updatedParticipants);

            if (
              roomUsers.size ===
              0
            ) {
              rooms.delete(
                code
              );
            }
          }

          socket.data.roomCode =
            null;

          console.log(
            `${
              userName ||
              "User"
            } left room ${code}`
          );
        } catch (error) {
          console.error(
            "leave-room error:",
            error
          );
        }
      }
    );

    // ========================================
    // WEBRTC VIDEO CALL SIGNALING
    // ========================================

    socket.on(
      "video-call-ready",
      ({ roomCode, userId, userName }) => {
        try {
          if (!roomCode || !userId) return;
          const code = String(roomCode).toUpperCase();
          socket.to(code).emit("video-call-ready", {
            userId,
            userName: userName || socket.data.userName || "User",
          });
        } catch (error) {
          console.error("video-call-ready error:", error);
        }
      }
    );

    socket.on(
      "video-call-offer",
      ({ roomCode, targetUserId, offer }) => {
        try {
          if (!roomCode || !targetUserId || !offer) return;
          const code = String(roomCode).toUpperCase();
          const roomUsers = rooms.get(code);
          const fromUserId = socket.data.userId;

          if (roomUsers) {
            for (const [targetSocketId, user] of roomUsers.entries()) {
              if (String(user.userId) === String(targetUserId)) {
                io.to(targetSocketId).emit("video-call-offer", {
                  fromUserId,
                  offer,
                });
                return;
              }
            }
          }

          socket.to(code).emit("video-call-offer", {
            fromUserId,
            targetUserId,
            offer,
          });
        } catch (error) {
          console.error("video-call-offer error:", error);
        }
      }
    );

    socket.on(
      "video-call-answer",
      ({ roomCode, targetUserId, answer }) => {
        try {
          if (!roomCode || !targetUserId || !answer) return;
          const code = String(roomCode).toUpperCase();
          const roomUsers = rooms.get(code);
          const fromUserId = socket.data.userId;

          if (roomUsers) {
            for (const [targetSocketId, user] of roomUsers.entries()) {
              if (String(user.userId) === String(targetUserId)) {
                io.to(targetSocketId).emit("video-call-answer", {
                  fromUserId,
                  answer,
                });
                return;
              }
            }
          }

          socket.to(code).emit("video-call-answer", {
            fromUserId,
            targetUserId,
            answer,
          });
        } catch (error) {
          console.error("video-call-answer error:", error);
        }
      }
    );

    socket.on(
      "video-call-ice-candidate",
      ({ roomCode, targetUserId, candidate }) => {
        try {
          if (!roomCode || !targetUserId || !candidate) return;
          const code = String(roomCode).toUpperCase();
          const roomUsers = rooms.get(code);
          const fromUserId = socket.data.userId;

          if (roomUsers) {
            for (const [targetSocketId, user] of roomUsers.entries()) {
              if (String(user.userId) === String(targetUserId)) {
                io.to(targetSocketId).emit("video-call-ice-candidate", {
                  fromUserId,
                  candidate,
                });
                return;
              }
            }
          }

          socket.to(code).emit("video-call-ice-candidate", {
            fromUserId,
            targetUserId,
            candidate,
          });
        } catch (error) {
          console.error("video-call-ice-candidate error:", error);
        }
      }
    );

    socket.on(
      "video-call-left",
      ({ roomCode, userId }) => {
        try {
          if (!roomCode) return;
          const code = String(roomCode).toUpperCase();
          socket.to(code).emit("video-call-user-left", {
            userId: userId || socket.data.userId,
          });
        } catch (error) {
          console.error("video-call-left error:", error);
        }
      }
    );

    socket.on(
      "screen-share-start",
      ({ roomCode, userId, userName }) => {
        try {
          if (!roomCode) return;
          const code = String(roomCode).toUpperCase();
          socket.to(code).emit("screen-share-start", {
            userId: userId || socket.data.userId,
            userName: userName || socket.data.userName || "User",
          });
        } catch (error) {
          console.error("screen-share-start error:", error);
        }
      }
    );

    socket.on(
      "screen-share-stop",
      ({ roomCode, userId }) => {
        try {
          if (!roomCode) return;
          const code = String(roomCode).toUpperCase();
          socket.to(code).emit("screen-share-stop", {
            userId: userId || socket.data.userId,
          });
        } catch (error) {
          console.error("screen-share-stop error:", error);
        }
      }
    );

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on(
      "disconnect",
      () => {
        try {
          const roomCode =
            socket.data
              .roomCode;

          const userId =
            socket.data
              .userId;

          const userName =
            socket.data
              .userName;

          if (
            roomCode &&
            rooms.has(roomCode)
          ) {
            const roomUsers =
              rooms.get(
                roomCode
              );

            roomUsers.delete(
              socket.id
            );

            socket
              .to(roomCode)
              .emit(
                "user-left",
                {
                  userId,

                  name:
                    userName ||
                    "User",
                }
              );

            socket
              .to(roomCode)
              .emit(
                "video-call-user-left",
                {
                  userId,
                }
              );

            const updatedParticipants = getRoomParticipants(roomCode);
            io.to(roomCode).emit("participants-update", updatedParticipants);

            if (
              roomUsers.size ===
              0
            ) {
              rooms.delete(
                roomCode
              );
            }
          }

          console.log(
            "Socket disconnected:",
            socket.id
          );
        } catch (error) {
          console.error(
            "disconnect error:",
            error
          );
        }
      }
    );
  }
);

// ==========================================
// START SERVER
// ==========================================

server.listen(
  PORT,
  () => {
    console.log(
      "===================================="
    );

    console.log(
      `Server is running on Port ${PORT}`
    );

    console.log(
      "Socket.IO server is ready"
    );

    console.log(
      "Gemini Translation API is ready"
    );

    console.log(
      "Translation endpoint:"
    );

    console.log(
      `http://localhost:${PORT}/api/translate`
    );

    console.log(
      "===================================="
    );
  }
);