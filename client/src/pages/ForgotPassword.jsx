import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Button from "../components/common/Button";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const baseUrl = import.meta.env.VITE_API_URL || "https://video-download-platform.onrender.com";
      const response = await axios.post(
        `${baseUrl}/api/auth/forgot-password`,
        {
          email,
        }
      );


      if (response.data.success) {

        setMessage(
          "Password reset link sent to your email"
        );

      }


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };


  return (
    <div className="min-h-screen theme-bg theme-text flex items-center justify-center p-4 sm:p-6 transition-colors duration-500">
      <div className="theme-card theme-border border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold theme-text text-center tracking-tight">
          Forgot Password
        </h1>

        <p className="theme-text-secondary text-center mt-2 text-sm">
          Enter your registered email address to receive a password reset link.
        </p>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full theme-input theme-text theme-border border px-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center mt-6 pt-4 border-t theme-border">
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;