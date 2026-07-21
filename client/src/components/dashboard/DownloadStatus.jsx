import React from "react";
import { Download, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

function DownloadStatus() {
  // Temporary data (replace with backend data later)
  const used = 1;
  const limit = 5;

  const progress = (used / limit) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            Daily Download Limit
          </h2>

          <p className="text-blue-100 mt-1">
            Free Plan
          </p>
        </div>

        <div className="bg-white/20 p-3 rounded-xl">
          <Download size={32} />
        </div>

      </div>

      {/* Progress */}
      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">
          <span>Used</span>

          <span>
            {used} / {limit}
          </span>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">

          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-yellow-300">

          <Crown size={18} />

          <span className="text-sm">
            Upgrade to Premium for more downloads
          </span>

        </div>

        <Link to="/subscription">

          <Button>
            Upgrade Now
          </Button>

        </Link>

      </div>

    </div>
  );
}

export default DownloadStatus;