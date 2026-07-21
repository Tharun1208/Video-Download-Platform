import React from "react";
import { User, Mail, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import PlanBadge from "./PlanBadge";

function ProfileCard({
  name = "Tharun",
  email = "tharun@gmail.com",
  role = "Full Stack Developer",
  plan = "Free",
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

      <div className="flex flex-col md:flex-row justify-between gap-8">

        {/* Left */}

        <div className="flex items-center gap-6">

          <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold text-white">

            {name.charAt(0).toUpperCase()}

          </div>

          <div>

            <h2 className="text-3xl font-bold text-white">

              {name}

            </h2>

            <p className="flex items-center gap-2 text-gray-400 mt-3">

              <User size={18} />

              {role}

            </p>

            <p className="flex items-center gap-2 text-gray-400 mt-2">

              <Mail size={18} />

              {email}

            </p>

            <div className="mt-5">

              <PlanBadge plan={plan} />

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-start">

          <Link
            to="/settings"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white font-semibold transition"
          >
            <Edit size={18} />

            Edit Profile

          </Link>

        </div>

      </div>

    </div>
  );
}

export default ProfileCard;