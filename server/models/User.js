import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },
    lastDownloadDate: {
      type: Date,
      default: null,
    },

    plan: {
      type: String,
      enum: ["Free", "Premium"],
      default: "Free",
    },

    downloadsToday: {
      type: Number,
      default: 0,
    },

    totalDownloads: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;