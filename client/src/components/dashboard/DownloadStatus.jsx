import React from "react";
import {
  Download,
  Crown,
  Infinity,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../common/Button";

function DownloadStatus({ user }) {
  const used = user?.downloadsToday || 0;

  const planLimits = {
    Free: 1,
    Bronze: 5,
    Silver: 15,
  };

  const currentPlan =
    user?.plan || "Free";

  const isGold =
    currentPlan === "Gold";

  const limit =
    planLimits[currentPlan] || 1;

  const progress = isGold
    ? 100
    : Math.min(
        (used / limit) * 100,
        100
      );

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        theme-card
        theme-text
        border
        theme-border
        p-5
        shadow-xl
        transition-all
        duration-500
        sm:p-6
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-10
          h-32
          w-32
          rounded-full
          bg-purple-500/10
          blur-3xl
        "
      />

      <div className="relative">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>

            <h2
              className="
                text-xl
                font-bold
                theme-text
                sm:text-2xl
              "
            >
              Daily Download Limit
            </h2>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
                text-sm
                theme-text-muted
              "
            >
              <span>
                {currentPlan} Plan
              </span>

              {isGold && (
                <Crown
                  size={16}
                  className="text-yellow-500"
                />
              )}
            </div>

          </div>

          {/* Download Icon */}

          <div
            className="
              shrink-0
              rounded-xl
              bg-blue-500/10
              border
              border-blue-500/20
              p-3
              text-blue-500
              transition-colors
              duration-500
            "
          >
            <Download size={28} />
          </div>

        </div>

        {/* =====================================================
            DOWNLOAD COUNT
        ===================================================== */}

        <div className="mt-7">

          <div
            className="
              mb-2
              flex
              items-center
              justify-between
              gap-3
              text-sm
            "
          >

            <span className="theme-text-muted">
              Downloads Used
            </span>

            {isGold ? (
              <span
                className="
                  flex
                  items-center
                  gap-1
                  font-bold
                  theme-text
                "
              >
                {used}

                <span className="theme-text-muted">
                  / Unlimited
                </span>
              </span>
            ) : (
              <span className="font-bold theme-text">
                {used} / {limit}
              </span>
            )}

          </div>

          {/* ===================================================
              PROGRESS BAR
          =================================================== */}

          <div
            className="
              h-3
              w-full
              overflow-hidden
              rounded-full
              bg-gray-200
              dark:bg-gray-700
              transition-colors
              duration-500
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-blue-600
                dark:bg-blue-500
                transition-all
                duration-700
                ease-out
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* ===================================================
              STATUS TEXT
          =================================================== */}

          <div className="mt-2">

            {isGold ? (
              <p
                className="
                  text-xs
                  text-blue-600
                  dark:text-blue-400
                "
              >
                Unlimited downloads available
              </p>
            ) : used >= limit ? (
              <p
                className="
                  text-xs
                  font-medium
                  text-red-600
                  dark:text-red-400
                "
              >
                Daily limit reached
              </p>
            ) : (
              <p
                className="
                  text-xs
                  theme-text-muted
                "
              >
                {limit - used} download
                {limit - used !== 1
                  ? "s"
                  : ""}{" "}
                remaining today
              </p>
            )}

          </div>

        </div>

        {/* =====================================================
            BOTTOM SECTION
        ===================================================== */}

        <div
          className="
            mt-6
            flex
            flex-col
            items-start
            justify-between
            gap-4
            md:flex-row
            md:items-center
          "
        >

          {/* ===================================================
              PLAN MESSAGE
          =================================================== */}

          {currentPlan === "Free" ? (

            <div
              className="
                flex
                items-center
                gap-2
                text-yellow-600
                dark:text-yellow-400
              "
            >
              <Crown size={18} />

              <span className="text-sm">
                Upgrade your plan for more downloads
              </span>
            </div>

          ) : isGold ? (

            <div
              className="
                flex
                items-center
                gap-2
                text-yellow-600
                dark:text-yellow-400
              "
            >
              <Infinity size={20} />

              <span className="text-sm font-medium">
                Unlimited downloads enabled
              </span>
            </div>

          ) : (

            <div
              className="
                flex
                items-center
                gap-2
                text-green-600
                dark:text-green-400
              "
            >
              <Crown size={18} />

              <span className="text-sm">
                {currentPlan} Plan Active
              </span>
            </div>

          )}

          {/* ===================================================
              UPGRADE BUTTON
          =================================================== */}

          {currentPlan === "Free" && (
            <Link
              to="/subscription"
              className="w-full md:w-auto"
            >
              <Button>
                Upgrade Now
              </Button>
            </Link>
          )}

        </div>

      </div>
    </div>
  );
}

export default DownloadStatus;