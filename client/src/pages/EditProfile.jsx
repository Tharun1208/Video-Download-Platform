import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  AtSign,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import { getProfile, updateProfile } from "../api/userApi";

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

  useEffect(() => {
    fetchUser();
  }, []);

const fetchUser = async () => {
  try {

    const response = await getProfile();

    console.log("PROFILE DATA:", response.data);

    if (response.data.success) {

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

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to load profile"
    );

  } finally {

    setLoading(false);

  }
};
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      setSelectedImage(file);

      setPreview(URL.createObjectURL(file));

    }

  };

  const handleSave = async () => {

    try {

      setSaving(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("username", formData.username);

      if (selectedImage) {
        data.append("avatar", selectedImage);
      }

      const response = await updateProfile(data);

      if (response.data.success) {

        alert("Profile Updated Successfully!");

        navigate("/profile");

      }

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Profile update failed"
      );

    } finally {

      setSaving(false);

    }

  };

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading Profile...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <h1 className="text-3xl font-bold text-center text-white">
          Edit Profile
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Update your personal information
        </p>

        <div className="flex flex-col items-center mt-8">

          <div className="relative">

            {
              preview ? (

                <img
                  src={preview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                />

              ) : (

                <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white">

                  {formData.name?.charAt(0).toUpperCase()}

                </div>

              )
            }

            <input
              type="file"
              id="avatar"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <label
              htmlFor="avatar"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition cursor-pointer"
            >

              <Camera size={18} className="text-white" />

            </label>

          </div>

          <p className="text-gray-400 text-sm mt-3">
            Change Profile Picture
          </p>

        </div>

        <div className="space-y-5 mt-8">

          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-4 text-gray-500"
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Username
            </label>

            <div className="relative">

              <AtSign
                size={18}
                className="absolute left-4 top-4 text-gray-500"
              />

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-4 text-gray-500"
              />

              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none"
              />

            </div>

          </div>

        </div>

        <div className="flex gap-4 mt-8">

          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>

        </div>

      </div>

    </div>

  );

}

export default EditProfile;