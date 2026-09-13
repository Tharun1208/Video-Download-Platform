import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import {
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import toast from "react-hot-toast";

import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { APP_NAME } from "../utils/constants";
import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "whatsapp",
    confirmText: "Continue",
    onConfirm: () => {},
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const detectClientLocationAndDevice = async () => {
    let city = "";
    let state = "";

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("https://ipwho.is/", { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        city = data.city || data.region || "";
        state = data.region || "";
      }
    } catch {
      // Geo-IP failed or timed out; continue without blocking login
    }

    const device =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      (navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop");

    return { city, state, device };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const clientContext = await detectClientLocationAndDevice();

      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        ...clientContext,
      };

      const response = await loginUser(payload);

      // Check if location or device change requires OTP verification
      if (response.data.requiresOtp) {
        localStorage.setItem(
          "pendingLoginEmail",
          formData.email.trim().toLowerCase()
        );

        setModalConfig({
          isOpen: true,
          title: "Location / Device Change Detected 🛡️",
          message:
            response.data.message ||
            "A new location or device was detected for your account. A 6-digit verification code (OTP) has been sent to your registered email.",
          type: "warning",
          confirmText: "Enter Verification Code",
          onConfirm: () => {
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
            navigate("/login-otp");
          },
        });
        return;
      }

      // Normal Successful Login
      if (response.data.success) {
        // Save JWT Token
        localStorage.setItem("token", response.data.token);

        // Save User Details
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setModalConfig({
          isOpen: true,
          title: "Login Successful! 🎉",
          message: `Welcome back, ${response.data.user?.name || "User"}! You are being redirected to your dashboard.`,
          type: "whatsapp",
          confirmText: "Go to Dashboard",
          onConfirm: () => {
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
            navigate("/dashboard");
          },
        });

        // Auto-redirect after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1600);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-white transition-all duration-300 hover:border-blue-500 hover:shadow-blue-500/20">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" withText={false} animated={true} />

          <h1 className="text-4xl font-bold mt-3">
            {APP_NAME}
          </h1>

          <p className="text-gray-400 mt-3">
            Welcome Back 👋
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Login to continue to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-6 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              >
                {showPassword ? (
                  <MdVisibilityOff size={22} />
                ) : (
                  <MdVisibility size={22} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            icon={<LogIn size={20} />}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Don't have an account?
          <Link
            to="/register"
            className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        showCancel={false}
      />
    </div>
  );
}

export default Login;