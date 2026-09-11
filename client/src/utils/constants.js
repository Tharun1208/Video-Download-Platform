// ===============================
// Application
// ===============================

export const APP_NAME = "StreamVault";

export const APP_VERSION = "1.0.0";


// ===============================
// Subscription Plans
// ===============================

export const PLANS = {
  FREE: "Free",
  PREMIUM: "Premium",
};


// ===============================
// Download Limits
// ===============================

export const DOWNLOAD_LIMITS = {
  FREE: 1,
  PREMIUM: 25,
};


// ===============================
// Video Categories
// ===============================

export const VIDEO_CATEGORIES = [
  "All",
  "Frontend",
  "Backend",
  "Database",
  "Programming",
  "AI",
  "Cloud",
  "DevOps",
  "Full Stack",
];


// ===============================
// Routes
// ===============================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  VIDEOS: "/videos",
  VIDEO_DETAILS: "/video/:id",
  DOWNLOADS: "/downloads",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  SUBSCRIPTION: "/subscription",
  NOTIFICATIONS: "/notifications",
};


// ===============================
// Notifications
// ===============================

export const NOTIFICATIONS = [
  {
    id: 1,
    title: "Download Completed",
    message: "React Full Course downloaded successfully.",
    type: "success",
  },
  {
    id: 2,
    title: "Premium Offer",
    message: "Upgrade now and unlock more downloads.",
    type: "info",
  },
  {
    id: 3,
    title: "New Course Added",
    message: "Node.js Masterclass is now available.",
    type: "new",
  },
];