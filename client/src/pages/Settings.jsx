import React, { useState } from "react";
import {
  Bell,
  Moon,
  Shield,
  User,
  Edit,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <h1 className="text-4xl font-bold mb-8">
        Settings
      </h1>

      <div className="space-y-6">

        {/* Account */}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20">

          <div className="flex items-center gap-3 mb-4">

            <User className="text-blue-500" size={24} />

            <h2 className="text-2xl font-semibold">
              Account Settings
            </h2>

          </div>

          <p className="text-gray-400 mb-5">
            Manage your profile information and account details.
          </p>

          <Link to="/edit-profile">

            <Button
              variant="primary"
              icon={<Edit size={18} />}
            >
              Edit Profile
            </Button>

          </Link>

        </div>

        {/* Notifications */}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/20">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Bell className="text-green-500" size={24} />

              <div>

                <h2 className="text-2xl font-semibold">
                  Notifications
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Receive download and subscription updates.
                </p>

              </div>

            </div>

            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${notifications ? "bg-green-500" : "bg-gray-700"
                }`}
            >

              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${notifications ? "left-7" : "left-1"
                  }`}
              />

            </button>

          </div>

        </div>

        {/* Theme */}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Moon className="text-purple-500" size={24} />

              <div>

                <h2 className="text-2xl font-semibold">
                  Dark Mode
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Enable dark mode for a better viewing experience.
                </p>

              </div>

            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${darkMode ? "bg-purple-500" : "bg-gray-700"
                }`}
            >

              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${darkMode ? "left-7" : "left-1"
                  }`}
              />

            </button>
          </div>

        </div>

        {/* Security */}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20">

          <div className="flex items-center gap-3 mb-4">

            <Shield className="text-red-500" size={24} />

            <h2 className="text-2xl font-semibold">
              Security
            </h2>

          </div>

          <p className="text-gray-400 mb-5">
            Manage your password and account security settings.
          </p>

          <Button
            variant="secondary"
            icon={<Lock size={18} />}
          >
            Change Password
          </Button>

        </div>

      </div>

    </div>
  );
}

export default Settings;