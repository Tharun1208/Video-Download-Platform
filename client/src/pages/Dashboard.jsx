import React, { useEffect, useState } from "react";
import {
  Download,
  Crown,
  PlaySquare,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Video,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { getProfile } from "../api/userApi";
import { applyTheme, getSavedTheme } from "../utils/theme";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setRenderTrigger] = useState(0);

  // ==========================================
  // SYNC WITH THEME CHANGES
  // ==========================================

  useEffect(() => {
    const handleThemeChange = () => {
      setRenderTrigger((prev) => prev + 1);
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  // ==========================================
  // FETCH USER
  // ==========================================

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getProfile();

      if (response.data.success) {
        setUser(response.data.user);

        const savedMode = localStorage.getItem("theme_mode");
        if (savedMode) {
          applyTheme(savedMode);
        } else if (response.data.user?.theme) {
          applyTheme(response.data.user.theme);
        } else {
          applyTheme("auto");
        }
      }
    } catch (error) {
      console.error(
        "Dashboard user error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PLAN LIMITS
  // ==========================================

  const planLimits = {
    Free: 1,
    Bronze: 5,
    Silver: 15,
    Gold: Infinity,
  };

  const currentPlan = user?.plan || "Free";

  const downloadLimit =
    planLimits[currentPlan] ?? 1;

  const downloadsToday =
    user?.downloadsToday || 0;

  const totalDownloads =
    user?.totalDownloads || 0;

  const remainingDownloads =
    downloadLimit === Infinity
      ? "Unlimited"
      : Math.max(
          0,
          downloadLimit - downloadsToday
        );

  const usagePercentage =
    downloadLimit === Infinity
      ? 100
      : Math.min(
          100,
          (downloadsToday / downloadLimit) * 100
        );

  // ==========================================
  // LOADING
  // ==========================================

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
          px-4
          transition-colors
          duration-500
        "
      >
        <div className="text-center">
          <div
            className="
              w-10
              h-10
              border-4
              border-gray-300
              dark:border-gray-700
              border-t-blue-600
              dark:border-t-blue-500
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <div className="theme-text-muted mt-4 text-sm sm:text-base">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        p-4
        sm:p-5
        md:p-6
        lg:p-8
        xl:p-10
        transition-colors
        duration-500
        overflow-x-hidden
      "
    >
      {/* ======================================
          MAIN CONTAINER
      ====================================== */}

      <div className="w-full max-w-[1600px] mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-6 sm:mb-8 md:mb-10">

          <h1
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              lg:text-5xl
              font-bold
              leading-tight
              break-words
            "
          >
            Welcome back,{" "}
            {user?.name || "User"}
          </h1>

          <p
            className="
              theme-text-secondary
              mt-2
              sm:mt-3
              text-sm
              sm:text-base
              md:text-lg
              max-w-2xl
            "
          >
            Manage your videos, downloads and
            subscription.
          </p>

        </div>

        {/* ======================================
            TOP CARDS
        ====================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-4
            sm:gap-5
            lg:gap-6
          "
        >

          {/* CURRENT PLAN */}

          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="
              group
              theme-card
              border
              theme-border
              rounded-2xl
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:-translate-y-1
              sm:hover:-translate-y-2
              hover:border-yellow-500
              hover:shadow-2xl
              hover:shadow-yellow-500/10
            "
          >

            <div className="flex items-center justify-between gap-3">

              <div
                className="
                  p-2.5
                  sm:p-3
                  bg-yellow-500/10
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:bg-yellow-500/20
                  group-hover:scale-105
                  sm:group-hover:scale-110
                  shrink-0
                "
              >
                <Crown
                  size={22}
                  className="text-yellow-400 sm:w-6 sm:h-6"
                />
              </div>

              <span className="text-xs sm:text-sm theme-text-muted">
                PLAN
              </span>

            </div>

            <p className="theme-text-secondary mt-4 sm:mt-5 text-sm">
              Current Plan
            </p>

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                mt-1
                truncate
              "
            >
              {currentPlan}
            </h2>

            <Link
              to="/subscription"
              className="
                text-blue-400
                text-xs
                sm:text-sm
                flex
                items-center
                gap-1
                mt-3
                sm:mt-4
                hover:text-blue-300
                transition
                w-fit
              "
            >
              Manage subscription

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  shrink-0
                "
              />
            </Link>

          </motion.div>

          {/* DOWNLOADS TODAY */}

          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="
              group
              theme-card
              border
              theme-border
              rounded-2xl
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:-translate-y-1
              sm:hover:-translate-y-2
              hover:border-blue-500
              hover:shadow-2xl
              hover:shadow-blue-500/10
            "
          >

            <div className="flex items-center justify-between gap-3">

              <div
                className="
                  p-2.5
                  sm:p-3
                  bg-blue-500/10
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:bg-blue-500/20
                  group-hover:scale-105
                  sm:group-hover:scale-110
                  shrink-0
                "
              >
                <Download
                  size={22}
                  className="text-blue-400 sm:w-6 sm:h-6"
                />
              </div>

              <span className="text-xs sm:text-sm theme-text-muted">
                TODAY
              </span>

            </div>

            <p className="theme-text-secondary mt-4 sm:mt-5 text-sm">
              Downloads Today
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-1">

              {downloadsToday}

              <span className="text-base sm:text-lg theme-text-muted">
                {" / "}
                {downloadLimit === Infinity
                  ? "∞"
                  : downloadLimit}
              </span>

            </h2>

          </motion.div>

          {/* REMAINING */}

          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="
              group
              theme-card
              border
              theme-border
              rounded-2xl
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:-translate-y-1
              sm:hover:-translate-y-2
              hover:border-green-500
              hover:shadow-2xl
              hover:shadow-green-500/10
            "
          >

            <div className="flex items-center justify-between gap-3">

              <div
                className="
                  p-2.5
                  sm:p-3
                  bg-green-500/10
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:bg-green-500/20
                  group-hover:scale-105
                  sm:group-hover:scale-110
                  shrink-0
                "
              >
                <CheckCircle
                  size={22}
                  className="text-green-400 sm:w-6 sm:h-6"
                />
              </div>

              <span className="text-xs sm:text-sm theme-text-muted">
                REMAINING
              </span>

            </div>

            <p className="theme-text-secondary mt-4 sm:mt-5 text-sm">
              Downloads Remaining
            </p>

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                mt-1
                break-words
              "
            >
              {remainingDownloads}
            </h2>

          </motion.div>

          {/* TOTAL DOWNLOADS */}

          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="
              group
              theme-card
              border
              theme-border
              rounded-2xl
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:-translate-y-1
              sm:hover:-translate-y-2
              hover:border-purple-500
              hover:shadow-2xl
              hover:shadow-purple-500/10
            "
          >

            <div className="flex items-center justify-between gap-3">

              <div
                className="
                  p-2.5
                  sm:p-3
                  bg-purple-500/10
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:bg-purple-500/20
                  group-hover:scale-105
                  sm:group-hover:scale-110
                  shrink-0
                "
              >
                <TrendingUp
                  size={22}
                  className="text-purple-400 sm:w-6 sm:h-6"
                />
              </div>

              <span className="text-xs sm:text-sm theme-text-muted">
                ALL TIME
              </span>

            </div>

            <p className="theme-text-secondary mt-4 sm:mt-5 text-sm">
              Total Downloads
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              {totalDownloads}
            </h2>

          </motion.div>

        </div>

        {/* ======================================
            DOWNLOAD USAGE
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="
            group
            mt-6
            sm:mt-8
            theme-card
            border
            theme-border
            rounded-2xl
            p-5
            sm:p-6
            md:p-7
            transition-all
            duration-300
            hover:border-blue-500
            hover:shadow-2xl
            hover:shadow-blue-500/10
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div>

              <h2 className="text-lg sm:text-xl font-bold">
                Today's Download Usage
              </h2>

              <p className="theme-text-secondary mt-1 text-sm sm:text-base">
                Your {currentPlan} plan download
                limit
              </p>

            </div>

            <div className="sm:text-right">

              <p className="text-xl sm:text-2xl font-bold">
                {downloadsToday}
                {" / "}
                {downloadLimit === Infinity
                  ? "∞"
                  : downloadLimit}
              </p>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-5">

            <div
              className="
                w-full
                h-2.5
                sm:h-3
                bg-gray-200
                dark:bg-gray-800
                rounded-full
                overflow-hidden
              "
            >

              <div
                className="
                  h-full
                  bg-blue-600
                  rounded-full
                  transition-all
                  duration-700
                  group-hover:bg-blue-500
                "
                style={{
                  width: `${usagePercentage}%`,
                }}
              />

            </div>

          </div>

          {downloadLimit !== Infinity && (
            <p className="theme-text-muted text-xs sm:text-sm mt-3">
              {remainingDownloads} download
              {remainingDownloads === 1
                ? ""
                : "s"}{" "}
              remaining today.
            </p>
          )}

          {downloadLimit === Infinity && (
            <p className="text-green-400 text-xs sm:text-sm mt-3">
              You have unlimited downloads with
              your Gold plan.
            </p>
          )}

        </motion.div>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="mt-6 sm:mt-8"
        >

          {/* ATTRACTIVE SECTION HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm">
                <Zap size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
                Fast Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                Quick Actions
              </span>
            </h2>
            <p className="theme-text-secondary text-sm sm:text-base mt-1">
              Instantly jump into discovering new content or managing your downloaded library.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
              sm:gap-6
            "
          >

            {/* BROWSE VIDEOS */}

            <Link
              to="/videos"
              className="
                group
                relative
                overflow-hidden
                theme-card
                border
                theme-border
                rounded-2xl
                p-5
                sm:p-6
                md:p-7
                transition-all
                duration-300
                hover:-translate-y-1
                sm:hover:-translate-y-2
                hover:border-blue-500
                hover:shadow-2xl
                hover:shadow-blue-500/15
              "
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between gap-4">

                <div
                  className="
                    p-3
                    sm:p-4
                    bg-gradient-to-br
                    from-blue-500/15
                    to-indigo-500/10
                    rounded-xl
                    transition-all
                    duration-300
                    group-hover:from-blue-500/25
                    group-hover:to-indigo-500/20
                    group-hover:scale-105
                    sm:group-hover:scale-110
                    border
                    border-blue-500/20
                  "
                >

                  <PlaySquare
                    size={26}
                    className="text-blue-500 dark:text-blue-400 sm:w-7 sm:h-7"
                  />

                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                    Explore
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight
                      size={16}
                      className="
                        text-blue-500
                        group-hover:text-white
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </div>

              </div>

              <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 group-hover:text-blue-500 transition-colors">
                Browse Videos
              </h3>

              <p className="theme-text-secondary mt-2 text-sm sm:text-base leading-relaxed">
                Discover trending releases, high-definition streams, and download your favorite titles seamlessly.
              </p>

              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                  Featured Videos
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-500/20">
                  High Bitrate
                </span>
              </div>

            </Link>

            {/* DOWNLOADS */}

            <Link
              to="/downloads"
              className="
                group
                relative
                overflow-hidden
                theme-card
                border
                theme-border
                rounded-2xl
                p-5
                sm:p-6
                md:p-7
                transition-all
                duration-300
                hover:-translate-y-1
                sm:hover:-translate-y-2
                hover:border-green-500
                hover:shadow-2xl
                hover:shadow-green-500/15
              "
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/15 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between gap-4">

                <div
                  className="
                    p-3
                    sm:p-4
                    bg-gradient-to-br
                    from-green-500/15
                    to-emerald-500/10
                    rounded-xl
                    transition-all
                    duration-300
                    group-hover:from-green-500/25
                    group-hover:to-emerald-500/20
                    group-hover:scale-105
                    sm:group-hover:scale-110
                    border
                    border-green-500/20
                  "
                >

                  <Download
                    size={26}
                    className="text-green-500 dark:text-green-400 sm:w-7 sm:h-7"
                  />

                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                    View Files
                  </span>
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight
                      size={16}
                      className="
                        text-green-500
                        group-hover:text-white
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </div>

              </div>

              <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 group-hover:text-green-500 transition-colors">
                My Downloads
              </h3>

              <p className="theme-text-secondary mt-2 text-sm sm:text-base leading-relaxed">
                Access your offline video vault, check download history, and manage your stored media files.
              </p>

              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium border border-green-500/20">
                  Offline Library
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                  Fast Storage
                </span>
              </div>

            </Link>

          </div>

        </motion.div>

        {/* ======================================
            WATCH PARTY
        ====================================== */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="mt-6 sm:mt-8"
        >

          {/* ATTRACTIVE SECTION HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm">
                <Sparkles size={13} className="text-pink-500" />
                Social Lounge
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Live Sync
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Watch Party
              </span>
            </h2>
            <p className="theme-text-secondary text-sm sm:text-base mt-1">
              Stream videos in real-time synchronization with friends, complete with live chat and interactive reactions.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
              sm:gap-6
            "
          >

            {/* CREATE WATCH PARTY */}

            <Link
              to="/watch-party/create"
              className="
                group
                relative
                overflow-hidden
                theme-card
                border
                theme-border
                rounded-2xl
                p-5
                sm:p-6
                md:p-7
                transition-all
                duration-300
                hover:-translate-y-1
                sm:hover:-translate-y-2
                hover:border-blue-500
                hover:shadow-2xl
                hover:shadow-blue-500/15
              "
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between gap-4">

                <div
                  className="
                    p-3
                    sm:p-4
                    bg-gradient-to-br
                    from-blue-500/15
                    to-indigo-500/10
                    rounded-xl
                    transition-all
                    duration-300
                    group-hover:from-blue-500/25
                    group-hover:to-indigo-500/20
                    group-hover:scale-105
                    sm:group-hover:scale-110
                    border
                    border-blue-500/20
                  "
                >

                  <Video
                    size={26}
                    className="text-blue-500 dark:text-blue-400 sm:w-7 sm:h-7"
                  />

                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                    Host
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight
                      size={16}
                      className="
                        text-blue-500
                        group-hover:text-white
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </div>

              </div>

              <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 group-hover:text-blue-500 transition-colors">
                Create Watch Party
              </h3>

              <p className="theme-text-secondary mt-2 text-sm sm:text-base leading-relaxed">
                Start your own private cinema room, invite friends with a share code, and control playback together in real time.
              </p>

              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                  Host Theater
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium border border-green-500/20">
                  Real-time Sync
                </span>
              </div>

            </Link>

            {/* JOIN WATCH PARTY */}

            <Link
              to="/watch-party/join"
              className="
                group
                relative
                overflow-hidden
                theme-card
                border
                theme-border
                rounded-2xl
                p-5
                sm:p-6
                md:p-7
                transition-all
                duration-300
                hover:-translate-y-1
                sm:hover:-translate-y-2
                hover:border-purple-500
                hover:shadow-2xl
                hover:shadow-purple-500/15
              "
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between gap-4">

                <div
                  className="
                    p-3
                    sm:p-4
                    bg-gradient-to-br
                    from-purple-500/15
                    to-pink-500/10
                    rounded-xl
                    transition-all
                    duration-300
                    group-hover:from-purple-500/25
                    group-hover:to-pink-500/20
                    group-hover:scale-105
                    sm:group-hover:scale-110
                    border
                    border-purple-500/20
                  "
                >

                  <Users
                    size={26}
                    className="text-purple-500 dark:text-purple-400 sm:w-7 sm:h-7"
                  />

                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                    Join
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight
                      size={16}
                      className="
                        text-purple-500
                        group-hover:text-white
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </div>

              </div>

              <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 group-hover:text-purple-500 transition-colors">
                Join Watch Party
              </h3>

              <p className="theme-text-secondary mt-2 text-sm sm:text-base leading-relaxed">
                Enter an existing room with a 6-digit party code and immediately enjoy synchronized movies with your crew.
              </p>

              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium border border-purple-500/20">
                  Instant Connect
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-medium border border-pink-500/20">
                  Watch Together
                </span>
              </div>

            </Link>

          </div>

        </motion.div>

        {/* ======================================
            UPGRADE SECTION
        ====================================== */}

        {currentPlan === "Free" && (

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.45 }}
            className="
              group
              mt-6
              sm:mt-8
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              rounded-2xl
              p-5
              sm:p-6
              md:p-8
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-2xl
              hover:shadow-purple-500/20
            "
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-6
              "
            >

              <div className="min-w-0">

                <div className="flex items-start sm:items-center gap-3">

                  <Crown
                    size={26}
                    className="
                      text-yellow-300
                      transition-transform
                      duration-300
                      group-hover:scale-110
                      group-hover:rotate-6
                      shrink-0
                      sm:w-8
                      sm:h-8
                    "
                  />

                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      md:text-3xl
                      font-bold
                      text-white
                    "
                  >
                    Upgrade Your Plan
                  </h2>

                </div>

                <p className="text-blue-100 mt-3 max-w-2xl text-sm sm:text-base">
                  Get more downloads, premium
                  videos, higher quality and
                  additional features.
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">

                  <span className="bg-white/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-white transition hover:bg-white/25">
                    5+ Downloads
                  </span>

                  <span className="bg-white/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-white transition hover:bg-white/25">
                    Premium Videos
                  </span>

                  <span className="bg-white/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-white transition hover:bg-white/25">
                    HD Quality
                  </span>

                </div>

              </div>

              <Link
                to="/subscription"
                className="
                  shrink-0
                  w-full
                  lg:w-auto
                "
              >

                <button
                  className="
                    w-full
                    lg:w-auto
                    justify-center
                    bg-white
                    text-blue-600
                    font-bold
                    px-6
                    sm:px-7
                    py-3
                    rounded-xl
                    transition-all
                    duration-300
                    flex
                    items-center
                    gap-2
                    hover:bg-gray-100
                    hover:scale-[1.02]
                    sm:hover:scale-105
                    hover:shadow-xl
                  "
                >

                  View Plans

                  <ArrowRight
                    size={18}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />

                </button>

              </Link>

            </div>

          </motion.div>

        )}

        {/* ======================================
            PREMIUM USER MESSAGE
        ====================================== */}

        {currentPlan !== "Free" && (

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.45 }}
            className="
              group
              mt-6
              sm:mt-8
              theme-card
              border
              theme-border
              rounded-2xl
              p-5
              sm:p-6
              md:p-7
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-yellow-500
              hover:shadow-2xl
              hover:shadow-yellow-500/10
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-start
                gap-4
              "
            >

              <div
                className="
                  p-3
                  bg-yellow-500/10
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:bg-yellow-500/20
                  group-hover:scale-110
                  shrink-0
                "
              >

                <Crown
                  size={26}
                  className="text-yellow-400 sm:w-7 sm:h-7"
                />

              </div>

              <div className="min-w-0">

                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    break-words
                  "
                >
                  You're enjoying{" "}
                  {currentPlan} benefits
                </h2>

                <p className="theme-text-secondary mt-1 text-sm sm:text-base">
                  Continue enjoying your premium
                  features and downloads.
                </p>

              </div>

            </div>

          </motion.div>

        )}

      </div>
    </div>
  );
}

export default Dashboard;