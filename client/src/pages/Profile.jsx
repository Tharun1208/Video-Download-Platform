import React, { useEffect, useState } from "react";
import {
  AtSign,
  Mail,
  Crown,
  Download,
  Calendar,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import { getProfile } from "../api/userApi";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();

      if (response.data.success) {
        setUser(response.data.user);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex justify-center items-center text-white">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      {/* Profile Card */}

      <div
        className="
        bg-gray-900
        border
        border-gray-800
        rounded-2xl
        p-8
        transition-all
        duration-300
        hover:border-blue-500
        hover:shadow-2xl
        hover:shadow-blue-500/20
        "
      >

        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Avatar */}

          {
            user?.avatar ? (

              <img
                src={user.avatar}
                alt="Profile"
                className="
                w-32
                h-32
                rounded-full
                object-cover
                border-4
                border-blue-500
                "
              />

            ) : (

              <div
                className="
                w-32
                h-32
                rounded-full
                bg-blue-600
                flex
                items-center
                justify-center
                text-5xl
                font-bold
                "
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>

            )
          }

          {/* User Details */}

          <div className="flex-1">

            <h2 className="text-3xl font-bold">
              {user?.name}
            </h2>

            <p className="flex items-center gap-2 text-gray-400 mt-4">
              <AtSign size={18} />
              {
                user?.username ||
                user?.name?.toLowerCase().replace(/\s+/g, "")
              }
            </p>

            <p className="flex items-center gap-2 text-gray-400 mt-3">
              <Mail size={18} />
              {user?.email}
            </p>

            <Link to="/edit-profile">

              <Button
                icon={<Edit size={18} />}
                className="mt-6"
              >
                Edit Profile
              </Button>

            </Link>

          </div>

        </div>

      </div>


      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* Total Downloads */}

        <div
          className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-6
          transition-all
          duration-300
          hover:border-blue-500
          hover:shadow-2xl
          hover:shadow-blue-500/20
          hover:-translate-y-1
          "
        >

          <div className="flex items-center gap-3">

            <Download className="text-blue-500" />

            <h3 className="font-semibold text-gray-300">
              Total Downloads
            </h3>

          </div>

          <p className="text-4xl font-bold mt-4">
            {user?.totalDownloads || 0}
          </p>

        </div>


        {/* Current Plan */}

        <div
          className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-6
          transition-all
          duration-300
          hover:border-yellow-500
          hover:shadow-2xl
          hover:shadow-yellow-500/20
          hover:-translate-y-1
          "
        >

          <div className="flex items-center gap-3">

            <Crown className="text-yellow-500" />

            <h3 className="font-semibold text-gray-300">
              Current Plan
            </h3>

          </div>

          <p className="text-4xl font-bold mt-4">
            {user?.plan}
          </p>

        </div>


        {/* Joined Date */}

        <div
          className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-6
          transition-all
          duration-300
          hover:border-green-500
          hover:shadow-2xl
          hover:shadow-green-500/20
          hover:-translate-y-1
          "
        >

          <div className="flex items-center gap-3">

            <Calendar className="text-green-500" />

            <h3 className="font-semibold text-gray-300">
              Joined
            </h3>

          </div>

          <p className="text-2xl font-bold mt-4">
            {new Date(user?.createdAt).toLocaleDateString()}
          </p>

        </div>

      </div>


      {/* Premium Banner */}

      {
        user?.plan === "Free" && (

          <div
            className="
            mt-8
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            rounded-2xl
            p-8
            transition-all
            duration-300
            hover:shadow-2xl
            hover:shadow-purple-500/30
            hover:-translate-y-1
            "
          >

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              <div>

                <h2 className="text-3xl font-bold">
                  Upgrade To Premium 👑
                </h2>

                <p className="mt-2 text-blue-100">
                  Get more daily downloads, premium videos and exclusive features.
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">

                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    🚀 Faster Downloads
                  </span>

                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    🎬 Premium Videos
                  </span>

                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    ⭐ Exclusive Features
                  </span>

                </div>

              </div>

              <Link to="/subscription">

                <Button
                  variant="light"
                  className="
                  transition-all
                  duration-300
                  hover:scale-105
                  "
                >
                  View Plans
                </Button>

              </Link>

            </div>

          </div>

        )
      }

    </div>
  );
}

export default Profile;