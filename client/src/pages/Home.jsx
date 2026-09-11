import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/common/Button";
import Footer from "../components/layout/Footer";
import { APP_NAME } from "../utils/constants";
import {
  Play,
  Download,
  ShieldCheck,
  Crown,
  Users,
  Sparkles,
  Check,
} from "lucide-react";

function Home() {
  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        transition-colors
        duration-300
      "
    >
      {/* Navbar */}
      <nav
        className="
          flex
          items-center
          justify-between
          px-4
          sm:px-8
          py-4
          sm:py-5
          border-b
          theme-border
          glass-panel
          sticky
          top-0
          z-30
        "
      >
        <h1
          className="
            text-xl
            sm:text-2xl
            font-extrabold
            theme-text
            tracking-tight
          "
        >
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm" className="px-3 sm:px-4">
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button size="sm" className="px-3 sm:px-4">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center px-6 py-20 sm:py-24"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-blue-600/15 text-blue-500 font-medium text-xs sm:text-sm px-4 py-2 rounded-full border border-blue-600/30 mb-6 transition-all duration-300 hover:bg-blue-600/25 shadow-sm"
        >
          Secure Video Streaming & Download Platform
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black max-w-5xl leading-tight theme-text tracking-tight"
        >
          Stream, Share & Download
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
            Securely Anywhere.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 sm:mt-8 theme-text-secondary max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed"
        >
          StreamVault lets you stream and download videos securely with subscription-based limits, premium content, multi-language comments, and synchronized watch parties.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <Button icon={<Play size={20} />} size="lg">
              Get Started
            </Button>
          </Link>

          <Link to="/subscription">
            <Button variant="outline" icon={<Crown size={20} />} size="lg">
              Explore Plans
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Features with Scroll Reveal */}
      <section className="grid md:grid-cols-3 gap-6 px-6 sm:px-10 pb-20 max-w-7xl mx-auto">
        {/* Controlled Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          whileHover={{ y: -8 }}
          className="theme-card theme-border border p-7 rounded-3xl shadow-sm hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/15 transition-all cursor-pointer group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
            <Download size={30} />
          </div>

          <h3 className="text-xl font-bold mt-5 theme-text">
            Controlled Downloads
          </h3>

          <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
            Download videos based on your subscription tier with smart daily limits and history tracking.
          </p>
        </motion.div>

        {/* Secure Platform */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          whileHover={{ y: -8 }}
          className="theme-card theme-border border p-7 rounded-3xl shadow-sm hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/15 transition-all cursor-pointer group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
            <ShieldCheck size={30} />
          </div>

          <h3 className="text-xl font-bold mt-5 theme-text">
            Secure & Regionalized
          </h3>

          <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
            Protected with Email OTP on new devices, dynamic time-based greetings, and regional personalization.
          </p>
        </motion.div>

        {/* Premium Experience */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          whileHover={{ y: -8 }}
          className="theme-card theme-border border p-7 rounded-3xl shadow-sm hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/15 transition-all cursor-pointer group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
            <Users size={30} />
          </div>

          <h3 className="text-xl font-bold mt-5 theme-text">
            Live Watch Parties
          </h3>

          <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
            Synchronized video playback, floating live emoji reactions, room chat, and audio-video conferencing.
          </p>
        </motion.div>
      </section>

      {/* Pricing Preview with Scroll Reveal */}
      <section className="px-6 sm:px-10 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black theme-text">
            Choose Your Plan
          </h2>
          <p className="theme-text-secondary mt-2 text-sm sm:text-base">
            Upgrade anytime to get more daily downloads and premium perks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            whileHover={{ y: -6 }}
            className="theme-card theme-border border p-8 rounded-3xl shadow-sm hover:border-blue-500/40 hover:shadow-xl transition-all"
          >
            <h3 className="text-2xl font-bold theme-text">Free</h3>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold theme-text-muted">₹</span>
              <span className="text-4xl font-black tracking-tight tabular-nums bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                0
              </span>
            </p>

            <ul className="mt-6 theme-text-secondary space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-500 shrink-0" />
                <span>Watch Videos with 60s Preview</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-500 shrink-0" />
                <span>1 Video Download Per Day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-500 shrink-0" />
                <span>Basic Community Access</span>
              </li>
            </ul>

            <Link to="/register" className="mt-8 block">
              <Button variant="outline" fullWidth>
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/25 transition-all"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Gold Premium</h3>
              <span className="bg-amber-400 text-black text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                Unlimited
              </span>
            </div>

            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold opacity-80">₹</span>
              <span className="text-4xl font-black tracking-tight tabular-nums text-white">
                499
              </span>
              <span className="text-sm font-medium opacity-80 ml-1">/ month</span>
            </p>

            <ul className="mt-6 space-y-3 text-sm text-blue-50">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-amber-300 shrink-0" />
                <span>Unlimited Video Downloads / Day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-amber-300 shrink-0" />
                <span>Full Watch Time on All Premium Videos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-amber-300 shrink-0" />
                <span>100% Ad-Free Video Streaming</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-amber-300 shrink-0" />
                <span>VIP Watch Party Host Status</span>
              </li>
            </ul>

            <Link to="/subscription" className="mt-8 block">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer"
              >
                Upgrade to Gold
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;