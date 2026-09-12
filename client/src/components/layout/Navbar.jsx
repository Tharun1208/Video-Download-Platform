import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  House,
  LayoutDashboard,
  PlaySquare,
  Download,
  Crown,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getNotifications } from "../../api/notificationApi";
import { getSavedTheme, applyTheme } from "../../utils/theme";
import { updateProfile } from "../../api/userApi";
import axios from "axios";
import ConfirmationModal from "../common/ConfirmationModal";
import Logo from "../common/Logo";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme());
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const [user, setUser] = useState({
    name: "User",
    plan: "Free",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail || getSavedTheme());
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const toggleTheme = async () => {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    setCurrentTheme(nextTheme);

    if (localStorage.getItem("token")) {
      try {
        await updateProfile({ theme: nextTheme });
      } catch (err) {
        console.error("Failed to sync theme with profile:", err);
      }
    }
  };

  // =========================================================
  // FETCH USER + NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    fetchUser();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // FETCH USER
  // =========================================================

  const fetchUser = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://video-download-platform.onrender.com";
      const response = await axios.get(
        `${baseUrl}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setUser({
          name: response.data.user.name,
          plan: response.data.user.plan,
        });
      }
    } catch (error) {
      console.log("User profile error:", error);
    }
  };

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();

      if (response.data.success) {
        const unread =
          response.data.notifications.filter(
            (notification) =>
              notification.isRead === false
          );

        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.log("Notification error:", error);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingLoginEmail");

    setOpen(false);
    setMobileNavOpen(false);
    setShowLogoutConfirm(false);

    navigate("/login");
  };

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".navbar-user-menu")
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // NAVBAR
  // =========================================================

  return (
    <header className="sticky top-0 z-40 h-16 flex-shrink-0 glass-panel theme-border border-b flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* LEFT: MOBILE THREE-BAR BUTTON + WEBSITE LOGO */}
      <div className="flex items-center gap-3">
        {/* MOBILE THREE-BAR (HAMBURGER) BUTTON */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          className="lg:hidden rounded-xl p-2 theme-text-secondary hover:theme-card hover:text-blue-500 border theme-border transition-colors cursor-pointer"
          title={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileNavOpen ? (
            <X size={22} className="text-blue-500" />
          ) : (
            <Menu size={22} />
          )}
        </button>

        {/* WEBSITE LOGO */}
        <Logo asLink={true} size="md" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* THEME SWITCHER */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 theme-text-secondary hover:theme-card hover:text-amber-500 transition-colors cursor-pointer"
          title={`Switch to ${currentTheme === "light" ? "Dark" : "Light"} Mode`}
        >
          {currentTheme === "light" ? (
            <Moon size={20} className="text-indigo-400 hover:text-indigo-300 transition-colors" />
          ) : (
            <Sun size={20} className="text-amber-400 hover:text-amber-300 transition-colors" />
          )}
        </button>

        {/* NOTIFICATIONS */}
        <Link
          to="/notifications"
          className="relative rounded-xl p-2 theme-text-secondary hover:theme-card hover:text-blue-500 transition-colors"
          title="Notifications"
        >
          <motion.div
            animate={unreadCount > 0 ? { rotate: [0, 15, -12, 10, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bell size={21} />
          </motion.div>

          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 border-2 theme-bg-secondary shadow-md"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Link>

        {/* USER MENU */}
        <div className="relative navbar-user-menu">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="flex items-center gap-3 theme-text rounded-2xl px-2.5 py-1.5 hover:theme-card border border-transparent hover:theme-border transition-all cursor-pointer"
          >
            {/* AVATAR */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-blue-500/20">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            {/* USER INFORMATION */}
            <div className="hidden md:block text-left min-w-[90px]">
              <p className="font-semibold text-xs theme-text truncate">
                {user.name}
              </p>
              <p className="text-[11px] font-medium text-blue-500 dark:text-blue-400">
                {user.plan} Plan
              </p>
            </div>

            {/* ARROW */}
            <ChevronDown
              size={16}
              className={`theme-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </motion.button>

          {/* DROPDOWN */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-56 theme-card theme-border border rounded-2xl shadow-2xl overflow-hidden z-[100] p-1.5"
              >
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-colors"
                >
                  <User size={17} />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-colors"
                >
                  <Settings size={17} />
                  <span>Settings</span>
                </Link>

                <div className="theme-border border-t my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE DROPDOWN NAVIGATION MENU */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-16 left-0 right-0 theme-card theme-border border-b shadow-2xl overflow-hidden z-50 px-4 py-3 space-y-1"
          >
            {/* USER & THEME BAR */}
            <div className="px-3 py-2 mb-2 rounded-xl theme-bg border theme-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-xs theme-text truncate">{user.name}</p>
                  <p className="text-[10px] font-medium text-blue-500">{user.plan} Plan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg theme-card border theme-border text-xs theme-text font-medium cursor-pointer"
              >
                {currentTheme === "light" ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-400" />}
                <span>{currentTheme === "light" ? "Dark" : "Light"}</span>
              </button>
            </div>

            <Link
              to="/"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <House size={18} className="text-blue-500" />
              <span>Home</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <LayoutDashboard size={18} className="text-indigo-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/videos"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <PlaySquare size={18} className="text-emerald-500" />
              <span>Browse Videos</span>
            </Link>

            <Link
              to="/downloads"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <Download size={18} className="text-cyan-500" />
              <span>Downloads</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <User size={18} className="text-purple-500" />
              <span>Profile</span>
            </Link>

            <Link
              to="/subscription"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <Crown size={18} className="text-amber-500" />
              <span>Subscription</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            >
              <Settings size={18} className="text-slate-400" />
              <span>Settings</span>
            </Link>

            <div className="pt-2 border-t theme-border">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp-Style Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log out of StreamVault?"
        message="Are you sure you want to log out of your account on this device?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </header>
  );
}

export default Navbar;