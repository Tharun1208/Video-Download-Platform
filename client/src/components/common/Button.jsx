import React from "react";
import { motion } from "framer-motion";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  icon = null,
  onClick,
  className = "",
  disabled = false,
  loading = false,
  fullWidth = false,
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 border border-blue-500/30",

    secondary:
      "bg-gray-800/90 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 shadow-sm",

    success:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40",

    danger:
      "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40",

    outline:
      "border border-gray-400/40 dark:border-gray-600 text-current hover:bg-blue-500/10 hover:border-blue-500/60 transition-colors",

    light:
      "bg-white text-blue-600 hover:bg-gray-50 shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-2xl",
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        gap-2.5
        font-semibold
        cursor-pointer
        select-none
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:transform-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}

export default Button;