import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils.js";

/**
 * StreamVault Brand Logo Component
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl' | number} [props.size='md'] Size preset or custom pixel number
 * @param {boolean} [props.withText=true] Whether to render the 'StreamVault' text next to icon
 * @param {boolean} [props.animated=true] Enable subtle hover animation
 * @param {boolean} [props.asLink=false] Wrap the logo in a React Router Link to home
 * @param {string} [props.className] Optional extra container classes
 */
export default function Logo({
  size = "md",
  withText = true,
  animated = true,
  asLink = false,
  className = "",
}) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 46,
    xl: 58,
  };

  const iconSize = typeof size === "number" ? size : pixelSizes[size] || pixelSizes.md;

  const logoSvg = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <motion.div
        whileHover={animated ? { scale: 1.06, rotate: 2 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="sv-vault-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="sv-accent-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="sv-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Vault Shield */}
          <path
            d="M24 4L39.5885 9.5V23C39.5885 33.2 32.9 41.5 24 44C15.1 41.5 8.41154 33.2 8.41154 23V9.5L24 4Z"
            fill="url(#sv-vault-gradient)"
            className="opacity-95"
          />

          {/* Inner Vault Border Rim */}
          <path
            d="M24 7L36.5 11.5V22.5C36.5 30.8 31.2 37.8 24 40C16.8 37.8 11.5 30.8 11.5 22.5V11.5L24 7Z"
            stroke="url(#sv-accent-gradient)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="rgba(15, 23, 42, 0.45)"
          />

          {/* Streaming Play Arrow */}
          <path
            d="M21 16.5L30.5 23L21 29.5V16.5Z"
            fill="#ffffff"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />

          {/* Vault Streaming Pulse Accent Rings */}
          <circle
            cx="24"
            cy="23"
            r="11"
            stroke="url(#sv-accent-gradient)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            className="opacity-70"
          />

          {/* Sparkle Node */}
          <circle cx="24" cy="10" r="1.5" fill="#67e8f9" />
        </svg>
      </motion.div>

      {withText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight font-extrabold text-lg sm:text-xl">
            <span className="theme-text">Stream</span>
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Vault
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-bold text-blue-500/80 -mt-0.5">
            Video Platform
          </span>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex focus:outline-none">
        {logoSvg}
      </Link>
    );
  }

  return logoSvg;
}
