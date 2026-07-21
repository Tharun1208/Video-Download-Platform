import React, { useState } from "react";
import {
  User,
  Mail,
  AtSign,
  MapPin,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Tharun",
    username: "tharunhs",
    email: "tharun@gmail.com",
    location: "Bengaluru, India",
    bio: "Passionate Full Stack Developer building modern web applications.",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Profile Updated Successfully!");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        {/* Heading */}

        <h1 className="text-3xl font-bold text-center text-white">
          Edit Profile
        </h1>

        <p className="text-center text-gray-400 mt-2">
          Update your personal information
        </p>

        {/* Avatar */}

        <div className="flex flex-col items-center mt-8">

          <div className="relative">

            <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white transition duration-300 hover:scale-105">
              T
            </div>

            <button
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition"
            >
              <Camera size={18} className="text-white" />
            </button>

          </div>

          <p className="text-gray-400 text-sm mt-3">
            Change Profile Picture
          </p>

        </div>

        {/* Form */}

        <div className="space-y-5 mt-8">

          {/* Full Name */}

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
                className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* Username */}

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
                className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* Email */}

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* Location */}

          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Location
            </label>

            <div className="relative">

              <MapPin
                size={18}
                className="absolute left-4 top-4 text-gray-500"
              />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* Bio */}

          <div>

            <label className="block text-sm text-gray-300 mb-2">
              Bio
            </label>

            <textarea
              rows={4}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl p-4 outline-none resize-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

        </div>

        {/* Buttons */}

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
            Save Changes
          </Button>

        </div>

      </div>

    </div>
  );
}

export default EditProfile;