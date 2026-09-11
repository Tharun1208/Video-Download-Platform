import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    isHost: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    roomName: {
      type: String,
      required: true,
      trim: true,
    },

    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },

    videoId: {
      type: String,
      default: null,
    },

    privacy: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },

    host: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },
    },

    participants: {
      type: [participantSchema],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;