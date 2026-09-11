import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import toast from "react-hot-toast";
import {
  getProfile,
  updateProfile,
} from "../api/userApi";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    avatar: "",
  });

  const [preview, setPreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // FETCH USER
  // =========================================================

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getProfile();

      console.log("PROFILE DATA:", response.data);

      if (response?.data?.success) {
        const user = response.data.user || {};

        setFormData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          avatar: user.avatar || "",
        });

        setPreview(user.avatar || "");
      }
    } catch (error) {
      console.error("Profile loading error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load profile",
        { id: "edit-profile-load-err" }
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Optional validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.", { id: "edit-profile-img-err" });
      return;
    }

    setSelectedImage(file);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await updateProfile({
        name: formData.name,
        username: formData.username,
        avatar: formData.avatar,
      });

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response.data
      );

      if (response?.data?.success) {
        toast.success("Profile Updated Successfully!", { id: "edit-profile-success" });

        navigate("/profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Profile update failed",
        { id: "edit-profile-save-err" }
      );
    } finally {
      setSaving(false);
    }
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

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        flex
        items-center
        justify-center
        px-4
        sm:px-5
        py-10
        transition-colors
        duration-500
      "
    >
      {/* =====================================================
          EDIT PROFILE CARD
      ===================================================== */}

      <div
        className="
          w-full
          max-w-xl
          theme-card
          theme-border
          border
          rounded-2xl
          shadow-xl
          p-6
          sm:p-8
          transition-all
          duration-500
          hover:border-blue-500
          hover:shadow-2xl
          hover:shadow-blue-500/10
        "
      >
        {/* ===================================================
            HEADING
        =================================================== */}

        <div className="text-center">
          <h1
            className="
              text-3xl
              font-bold
              theme-text
            "
          >
            Edit Profile
          </h1>

          <p
            className="
              theme-text-secondary
              mt-2
            "
          >
            Update your personal information
          </p>
        </div>

        {/* ===================================================
            PROFILE IMAGE
        =================================================== */}

        <div className="flex flex-col items-center mt-8">
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="
                  w-28
                  h-28
                  rounded-full
                  object-cover
                  border-4
                  border-blue-500
                  shadow-lg
                  shadow-blue-500/20
                "
              />
            ) : (
              <div
                className="
                  w-28
                  h-28
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-4xl
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                {(
                  formData.name ||
                  formData.username ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {/* IMAGE INPUT */}

            <input
              type="file"
              id="avatar"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            {/* CAMERA BUTTON */}

            <label
              htmlFor="avatar"
              className="
                absolute
                bottom-0
                right-0
                w-10
                h-10
                rounded-full
                bg-blue-600
                hover:bg-blue-700
                flex
                items-center
                justify-center
                transition
                cursor-pointer
                shadow-lg
              "
            >
              <Camera
                size={18}
                className="text-white"
              />
            </label>
          </div>

          <p
            className="
              theme-text-secondary
              text-sm
              mt-3
            "
          >
            Change Profile Picture
          </p>

          {selectedImage && (
            <p className="text-xs text-blue-500 mt-1">
              {selectedImage.name}
            </p>
          )}
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <div className="space-y-5 mt-8">
          {/* =================================================
              FULL NAME
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-medium
                theme-text-secondary
                mb-2
              "
            >
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  theme-text-muted
                "
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="
                  w-full
                  theme-input
                  theme-text
                  theme-border
                  border
                  rounded-xl
                  py-3
                  pl-11
                  pr-4
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />
            </div>
          </div>

          {/* =================================================
              USERNAME
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-medium
                theme-text-secondary
                mb-2
              "
            >
              Username
            </label>

            <div className="relative">
              <User
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  theme-text-muted
                "
              />

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="
                  w-full
                  theme-input
                  theme-text
                  theme-border
                  border
                  rounded-xl
                  py-3
                  pl-11
                  pr-4
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />
            </div>
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-medium
                theme-text-secondary
                mb-2
              "
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  theme-text-muted
                "
              />

              <input
                type="email"
                value={formData.email}
                disabled
                className="
                  w-full
                  theme-input
                  theme-text-secondary
                  theme-border
                  border
                  rounded-xl
                  py-3
                  pl-11
                  pr-4
                  outline-none
                  opacity-70
                  cursor-not-allowed
                "
              />
            </div>

            <p
              className="
                text-xs
                theme-text-secondary
                mt-2
              "
            >
              Email address cannot be changed.
            </p>
          </div>
        </div>

        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-4
            mt-8
          "
        >
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;