import Room from "../models/Room.js";

// ==========================================
// GENERATE ROOM CODE
// ==========================================

const generateRoomCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return code;
};

// ==========================================
// CREATE ROOM
// ==========================================

export const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      youtubeUrl,
      privacy,
      videoId,
    } = req.body;

    console.log("=================================");
    console.log("CREATE ROOM REQUEST");
    console.log("Body:", req.body);
    console.log("User:", req.user);
    console.log("=================================");

    // Validate room name
    if (!roomName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    // Validate YouTube URL
    if (!youtubeUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    // Check authenticated user
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const userName =
      req.user?.name ||
      req.user?.username ||
      "Host";

    // ========================================
    // GENERATE UNIQUE ROOM CODE
    // ========================================

    let roomCode;
    let existingRoom;

    do {
      roomCode = generateRoomCode();

      existingRoom = await Room.findOne({
        roomCode,
      });
    } while (existingRoom);

    // ========================================
    // CREATE ROOM
    // ========================================

    const room = await Room.create({
      roomCode,

      roomName: roomName.trim(),

      youtubeUrl: youtubeUrl.trim(),

      privacy:
        privacy === "Private"
          ? "Private"
          : "Public",

      videoId: videoId || null,

      host: {
        userId,
        name: userName,
      },

      participants: [
        {
          userId,
          name: userName,
          isHost: true,
        },
      ],
    });

    console.log("ROOM CREATED:", room.roomCode);

    return res.status(201).json({
      success: true,
      message: "Watch party created successfully",
      room,
    });
  } catch (error) {
    console.error("Create Room Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create watch party",
      error: error.message,
    });
  }
};

// ==========================================
// GET ROOM
// ==========================================

export const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Room code is required",
      });
    }

    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Watch party not found",
      });
    }

    // Ensure authenticated user is recorded as participant in room
    const currentUserId = req.user?._id || req.user?.id;
    const currentUserName =
      req.user?.name || req.user?.username || "User";

    if (currentUserId) {
      if (!Array.isArray(room.participants)) {
        room.participants = [];
      }

      const alreadyIn = room.participants.some(
        (p) => String(p.userId) === String(currentUserId)
      );

      if (!alreadyIn) {
        room.participants.push({
          userId: currentUserId,
          name: currentUserName,
          isHost: String(currentUserId) === String(room.host?.userId),
        });
        await room.save();
      }
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get Room Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load watch party",
      error: error.message,
    });
  }
};