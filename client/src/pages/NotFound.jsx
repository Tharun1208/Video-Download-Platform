import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Film, Compass, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen theme-bg theme-text flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-2xl w-full text-center z-10"
      >
        {/* Error Hero Visual */}
        <div className="relative mx-auto mb-8 w-full max-w-md h-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop"
            alt="Lost in Cinema"
            className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col items-center justify-center p-4">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              className="text-7xl sm:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-lg"
            >
              404
            </motion.span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium mt-1">
              <Film size={14} />
              <span>Scene Not Found</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Lost in the Reel?
        </h1>
        <p className="theme-text-secondary text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          The video or page you're searching for seems to have been removed, renamed, or never made the final cut.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10",
              "theme-card hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer shadow-sm active:scale-95"
            )}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
              "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
              "text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            )}
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>

          <Link
            to="/videos"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-blue-500/30",
              "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-semibold transition-all active:scale-95"
            )}
          >
            <Compass size={16} />
            <span>Browse Videos</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
