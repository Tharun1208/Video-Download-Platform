import React from "react";

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
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30",

    secondary:
      "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700",

    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/30",

    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/30",

    outline:
      "border border-gray-600 text-white hover:bg-gray-800",

    light:
      "bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-white/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-7 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        transition-all
        duration-300
        ease-in-out
        hover:-translate-y-1
        hover:scale-105
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
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

          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;