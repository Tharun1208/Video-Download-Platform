import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";

import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { APP_NAME } from "../utils/constants";
import { registerUser } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "whatsapp",
    confirmText: "Proceed to Login",
    onConfirm: () => {},
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match! Please check and try again.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await registerUser(payload);

      if (response.data.success) {
        setModalConfig({
          isOpen: true,
          title: "Registration Successful! 🎉",
          message: `Welcome to ${APP_NAME}, ${formData.name}! Your account has been created. Click below to login and start streaming.`,
          type: "whatsapp",
          confirmText: "Proceed to Login",
          onConfirm: () => {
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
            navigate("/login");
          },
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration Failed. Please try again."
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
            Create Your Account 🚀
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Join {APP_NAME} and start watching today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

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
              className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                placeholder="Create a password (min 6 chars)"
                required
                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">
                Confirm Password
              </label>
              {formData.confirmPassword && (
                <span
                  className={`text-xs font-semibold ${
                    formData.password === formData.confirmPassword
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {formData.password === formData.confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className={`w-full mt-2 px-4 py-3 rounded-xl bg-gray-800 border text-white placeholder-gray-500 outline-none transition-all duration-300 ${
                  formData.confirmPassword
                    ? formData.password === formData.confirmPassword
                      ? "border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      : "border-rose-500/70 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-6 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff size={22} />
                ) : (
                  <MdVisibility size={22} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            icon={<UserPlus size={20} />}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Already have an account?
          <Link
            to="/login"
            className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            Login
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

export default Register;
