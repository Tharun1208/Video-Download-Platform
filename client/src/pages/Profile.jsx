import React from "react";
import {
  AtSign,
  Mail,
  MapPin,
  Crown,
  Download,
  Calendar,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";

function Profile() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      {/* Profile Card */}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">

        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Avatar */}

          <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold transition-all duration-300 hover:scale-105">
            T
          </div>

          {/* Profile Info */}

          <div className="flex-1">

            <h2 className="text-3xl font-bold">
              Tharun
            </h2>

            <p className="flex items-center gap-2 text-gray-400 mt-4">
              <AtSign size={18} />
              tharunhs
            </p>

            <p className="flex items-center gap-2 text-gray-400 mt-3">
              <Mail size={18} />
              tharun@gmail.com
            </p>

            <p className="flex items-center gap-2 text-gray-400 mt-3">
              <MapPin size={18} />
              Bengaluru, India
            </p>

            <p className="text-gray-400 mt-5 leading-7 max-w-2xl">
              Passionate Full Stack Developer building modern web applications.
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

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">

          <div className="flex items-center gap-3">

            <Download className="text-blue-500" />

            <h3 className="font-semibold text-gray-300">
              Total Downloads
            </h3>

          </div>

          <p className="text-4xl font-bold mt-4">
            25
          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">

          <div className="flex items-center gap-3">

            <Crown className="text-yellow-500" />

            <h3 className="font-semibold text-gray-300">
              Current Plan
            </h3>

          </div>

          <p className="text-4xl font-bold mt-4">
            Free
          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">

          <div className="flex items-center gap-3">

            <Calendar className="text-green-500" />

            <h3 className="font-semibold text-gray-300">
              Joined
            </h3>

          </div>

          <p className="text-4xl font-bold mt-4">
            2026
          </p>

        </div>

      </div>

      {/* Premium Banner */}

      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/40">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div>

            <h2 className="text-3xl font-bold">
              Upgrade To Premium
            </h2>

            <p className="mt-2 text-blue-100">
              Get more daily downloads, premium videos and exclusive features.
            </p>

          </div>

          <Link to="/subscription">
            <Button variant="light">
              View Plans
            </Button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Profile;