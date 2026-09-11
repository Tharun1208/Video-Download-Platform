import React, { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  User,
  Edit,
  Palette,
  Sun,
  Moon,
  Check,
  Clock,
  Laptop,
  Smartphone,
  MapPin,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import toast from "react-hot-toast";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../api/userApi";

import { getSavedTheme, getThemeMode, applyTheme } from "../utils/theme";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ==========================================
  // THEME STATE & PERSISTENCE
  // ==========================================

  const [selectedMode, setSelectedMode] = useState(getThemeMode());
  const [activeTheme, setActiveTheme] = useState(getSavedTheme());

  useEffect(() => {
    const handleThemeChange = (e) => {
      setActiveTheme(e.detail || getSavedTheme());
      setSelectedMode(getThemeMode());
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const handleThemeSelect = async (mode) => {
    setSelectedMode(mode);
    localStorage.setItem("theme_mode", mode);
    applyTheme(mode);
    setActiveTheme(getSavedTheme());
    setUser((prev) => (prev ? { ...prev, theme: mode } : prev));

    try {
      await updateProfile({ theme: mode });
    } catch (error) {
      console.error("Failed to save theme in profile:", error);
    }
  };

  // ==========================================
  // PASSWORD
  // ==========================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        const currentLocal = localStorage.getItem("theme_mode");
        const effectiveMode = currentLocal || response.data.user.theme || "auto";
        setSelectedMode(effectiveMode);
        localStorage.setItem("theme_mode", effectiveMode);
        applyTheme(effectiveMode);
        setActiveTheme(getSavedTheme());
      }
    } catch (error) {
      console.error(
        "Profile error:",
        error
      );
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      return toast.error("Please fill all fields.", { id: "settings-pw-empty" });
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      return toast.error("Passwords do not match.", { id: "settings-pw-mismatch" });
    }

    try {
      const response =
        await changePassword({
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        });

      toast.success(response.data.message || "Password changed successfully!", { id: "settings-pw-success" });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to change password.",
        { id: "settings-pw-error" }
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        p-6
        transition-colors
        duration-500
      "
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-8">
        <h1
          className="
            text-3xl
            md:text-4xl
            font-bold
            theme-text
          "
        >
          Settings
        </h1>

        <p
          className="
            mt-2
            text-sm
            md:text-base
            theme-text-secondary
          "
        >
          Manage your account and security settings.
        </p>
      </div>

      <div
        className="
          max-w-5xl
          space-y-6
        "
      >
        {/* =====================================
            ACCOUNT INFORMATION
        ===================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-blue-500
            hover:shadow-xl
            hover:shadow-blue-500/10
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
              "
            >
              <User
                className="text-blue-500"
                size={23}
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  md:text-2xl
                  font-semibold
                  theme-text
                "
              >
                Account Information
              </h2>

              <p
                className="
                  text-sm
                  theme-text-secondary
                  mt-1
                "
              >
                View and manage your account details.
              </p>
            </div>
          </div>

          {/* ACCOUNT DETAILS */}

          <div
            className="
              rounded-xl
              theme-bg
              theme-border
              border
              p-5
              space-y-4
            "
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-1
              "
            >
              <span
                className="
                  text-sm
                  theme-text-secondary
                "
              >
                Name
              </span>

              <span
                className="
                  font-semibold
                  theme-text
                "
              >
                {user?.name || "Loading..."}
              </span>
            </div>

            <div
              className="
                h-px
                theme-border
                bg-current
                opacity-10
              "
            />

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-1
              "
            >
              <span
                className="
                  text-sm
                  theme-text-secondary
                "
              >
                Email
              </span>

              <span
                className="
                  font-semibold
                  theme-text
                  break-all
                "
              >
                {user?.email || "Loading..."}
              </span>
            </div>
          </div>

          {/* EDIT PROFILE */}

          <Link to="/edit-profile">
            <Button
              variant="primary"
              icon={<Edit size={18} />}
              className="mt-6"
            >
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* =====================================
            APPEARANCE & THEME PREFERENCES
        ===================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-amber-500
            hover:shadow-xl
            hover:shadow-amber-500/10
          "
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Palette size={23} />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold theme-text">
                Appearance & Theme
              </h2>

              <p className="text-sm theme-text-secondary mt-0.5">
                Customize your visual theme. Saved directly to your profile.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl theme-bg border theme-border mb-6">
            <p className="text-xs theme-text-secondary leading-relaxed">
              <strong>Automatic schedule:</strong> Light theme is enabled by default between <strong>10:00 AM and 12:00 PM IST</strong>. Dark theme is applied at all other times. You can manually choose your preferred theme below to override it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* AUTOMATIC SCHEDULE */}
            <button
              type="button"
              onClick={() => handleThemeSelect("auto")}
              className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left min-h-[135px] overflow-hidden ${
                selectedMode === "auto"
                  ? "border-blue-600 bg-blue-500/15 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30"
                  : "theme-border hover:border-blue-500/50 theme-text-secondary hover:bg-gray-500/5 opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2 mb-3.5">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all shrink-0 ${
                    selectedMode === "auto"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  <Clock size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                    selectedMode === "auto"
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "theme-border bg-transparent"
                  }`}
                >
                  {selectedMode === "auto" && <Check size={13} strokeWidth={3.5} />}
                </div>
              </div>

              <div className="w-full min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm sm:text-base theme-text truncate">Automatic</p>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded shrink-0">
                    IST
                  </span>
                </div>
                <p className="text-xs theme-text-muted mt-1 truncate">
                  Active: <strong className="theme-text capitalize">{activeTheme}</strong>
                </p>
              </div>
            </button>

            {/* LIGHT THEME */}
            <button
              type="button"
              onClick={() => handleThemeSelect("light")}
              className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left min-h-[135px] overflow-hidden ${
                selectedMode === "light"
                  ? "border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30"
                  : "theme-border hover:border-amber-500/50 theme-text-secondary hover:bg-gray-500/5 opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2 mb-3.5">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all shrink-0 ${
                    selectedMode === "light"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  <Sun size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                    selectedMode === "light"
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "theme-border bg-transparent"
                  }`}
                >
                  {selectedMode === "light" && <Check size={13} strokeWidth={3.5} />}
                </div>
              </div>

              <div className="w-full min-w-0">
                <p className="font-bold text-sm sm:text-base theme-text truncate">Light Mode</p>
                <p className="text-xs theme-text-muted mt-1 truncate">Always light</p>
              </div>
            </button>

            {/* DARK THEME */}
            <button
              type="button"
              onClick={() => handleThemeSelect("dark")}
              className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left min-h-[135px] overflow-hidden ${
                selectedMode === "dark"
                  ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30"
                  : "theme-border hover:border-indigo-500/50 theme-text-secondary hover:bg-gray-500/5 opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2 mb-3.5">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all shrink-0 ${
                    selectedMode === "dark"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}
                >
                  <Moon size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                    selectedMode === "dark"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "theme-border bg-transparent"
                  }`}
                >
                  {selectedMode === "dark" && <Check size={13} strokeWidth={3.5} />}
                </div>
              </div>

              <div className="w-full min-w-0">
                <p className="font-bold text-sm sm:text-base theme-text truncate">Dark Mode</p>
                <p className="text-xs theme-text-muted mt-1 truncate">Always dark</p>
              </div>
            </button>
          </div>
        </div>

        {/* =====================================
            SECURITY
        ===================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-red-500
            hover:shadow-xl
            hover:shadow-red-500/10
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-red-500/10
                flex
                items-center
                justify-center
              "
            >
              <Shield
                className="text-red-500"
                size={23}
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  md:text-2xl
                  font-semibold
                  theme-text
                "
              >
                Change Password
              </h2>

              <p
                className="
                  text-sm
                  theme-text-secondary
                  mt-1
                "
              >
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>

          {/* PASSWORD FORM */}

          <div className="space-y-4">
            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  theme-text
                  mb-2
                "
              >
                Current Password
              </label>

              <input
                type="password"
                placeholder="Enter current password"
                value={
                  passwordData.currentPassword
                }
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  theme-bg
                  theme-border
                  theme-text
                  border
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  transition-all
                  duration-300
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  theme-text
                  mb-2
                "
              >
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={
                  passwordData.newPassword
                }
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  theme-bg
                  theme-border
                  theme-text
                  border
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  transition-all
                  duration-300
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  theme-text
                  mb-2
                "
              >
                Confirm New Password
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={
                  passwordData.confirmPassword
                }
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  theme-bg
                  theme-border
                  theme-text
                  border
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  transition-all
                  duration-300
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                onClick={handlePasswordChange}
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>

        {/* =====================================
            ACTIVE SESSIONS & PROTECTION
        ===================================== */}

        <div
          className="
            theme-card
            theme-border
            border
            rounded-2xl
            p-6
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-blue-500
            hover:shadow-xl
            hover:shadow-blue-500/10
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck className="text-blue-500" size={24} />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold theme-text">
                Active Session & Security
              </h2>
              <p className="text-sm theme-text-secondary mt-1">
                Monitor your current device and account protection status.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* CURRENT DEVICE */}
            <div className="p-4 rounded-xl border theme-border theme-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  {navigator.userAgent.includes("Mobi") ? (
                    <Smartphone size={22} />
                  ) : (
                    <Laptop size={22} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm theme-text">
                      {navigator.userAgent.includes("Windows")
                        ? "Windows PC"
                        : navigator.userAgent.includes("Mac")
                        ? "Apple Mac"
                        : navigator.userAgent.includes("Android")
                        ? "Android Device"
                        : navigator.userAgent.includes("iPhone")
                        ? "Apple iPhone"
                        : "Web Browser"}
                    </p>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Current Session
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs theme-text-secondary mt-1">
                    <MapPin size={13} className="text-blue-500" />
                    <span>
                      {user?.lastLoginCity && user?.lastLoginState
                        ? `${user.lastLoginCity}, ${user.lastLoginState}`
                        : "India (Asia/Kolkata)"}
                    </span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">
                  OTP Protected
                </span>
              </div>
            </div>

            {/* PROTECTION BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl border theme-border theme-card flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <KeyRound size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold theme-text">Geo & Device OTP</p>
                  <p className="text-[11px] theme-text-secondary mt-0.5">
                    Unrecognized logins trigger a 6-digit email OTP.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border theme-border theme-card flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold theme-text">IST Time-Based Theme</p>
                  <p className="text-[11px] theme-text-secondary mt-0.5">
                    Automatic schedule (10am–12pm IST Light, Dark otherwise).
                  </p>
                </div>
              </div>
            </div>

            {/* LOG OUT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;