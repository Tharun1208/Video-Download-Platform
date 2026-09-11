import React, {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Button from "../components/common/Button";

import {
  verifyLoginOtp,
  resendLoginOtp,
} from "../api/authApi";

function LoginOtp() {

  const navigate =
    useNavigate();

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState("");

  // =========================================================
  // GET PENDING EMAIL
  // =========================================================

  useEffect(() => {

    const pendingEmail =
      localStorage.getItem(
        "pendingLoginEmail"
      );

    if (!pendingEmail) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    setEmail(
      pendingEmail
    );

  }, [navigate]);

  // =========================================================
  // APPLY THEME
  // =========================================================

  const applyTheme = (theme) => {

    const selectedTheme =
      theme === "light"
        ? "light"
        : "dark";

    console.log(
      "Applying OTP theme:",
      selectedTheme
    );

    localStorage.setItem(
      "theme",
      selectedTheme
    );

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      selectedTheme
    );

    document.body.classList.remove(
      "light",
      "dark"
    );

    document.body.classList.add(
      selectedTheme
    );

    const root =
      document.getElementById(
        "root"
      );

    if (root) {

      root.classList.remove(
        "light",
        "dark"
      );

      root.classList.add(
        selectedTheme
      );

    }

    window.dispatchEvent(
      new CustomEvent(
        "themeChanged",
        {
          detail:
            selectedTheme,
        }
      )
    );
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    if (
      !otp ||
      otp.length !== 6
    ) {

      toast.error(
        "Please enter the 6-digit OTP"
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await verifyLoginOtp({
          email,
          otp,
        });

      console.log(
        "OTP verification:",
        response.data
      );

      if (
        response.data.success
      ) {

        // Save token

        localStorage.setItem(
          "token",
          response.data.token
        );

        // Save user

        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        );

        // Apply theme

        const userTheme =
          response.data
            .user?.theme ||
          "dark";

        applyTheme(
          userTheme
        );

        // Remove pending email

        localStorage.removeItem(
          "pendingLoginEmail"
        );

        toast.success(
          "Login successful!"
        );

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      }

    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
        "Invalid OTP"
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResend = async () => {

    if (!email) return;

    try {

      setResending(true);

      const response =
        await resendLoginOtp({
          email,
        });

      if (
        response.data.success
      ) {

        toast.success(
          "A new OTP has been sent to your email."
        );

      }

    } catch (error) {

      console.error(
        "Resend OTP error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
        "Unable to resend OTP"
      );

    } finally {

      setResending(false);

    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-h-screen theme-bg flex items-center justify-center px-5">

      <div className="w-full max-w-md theme-card theme-border border rounded-2xl shadow-2xl p-8 theme-text">

        {/* ICON */}

        <div className="flex justify-center mb-6">

          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">

            <ShieldCheck
              size={34}
              className="text-blue-400"
            />

          </div>

        </div>

        {/* TITLE */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold theme-text">
            Verify Your Login
          </h1>

          <p className="theme-text-secondary mt-3">
            We detected a login
            from a new device
            or location.
          </p>

          <p className="theme-text-muted text-sm mt-2">
            Enter the 6-digit OTP
            sent to
          </p>

          <p className="text-blue-500 font-medium mt-1 break-all">
            {email}
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          <div>

            <label className="theme-text-secondary text-sm">
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(
                      0,
                      6
                    )
                )
              }
              placeholder="Enter 6-digit OTP"
              className="w-full mt-2 px-4 py-4 rounded-xl theme-input theme-border border theme-text text-center text-2xl tracking-[0.5em] placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />

          </div>

          <Button
            type="submit"
            icon={
              <ShieldCheck
                size={20}
              />
            }
            className="w-full"
            disabled={
              loading
            }
          >

            {loading
              ? "Verifying..."
              : "Verify OTP"}

          </Button>

        </form>

        {/* RESEND */}

        <div className="text-center mt-6">

          <p className="theme-text-muted text-sm mb-3">
            Didn't receive the
            OTP?
          </p>

          <button
            type="button"
            onClick={
              handleResend
            }
            disabled={
              resending
            }
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 disabled:opacity-50"
          >

            <RefreshCw
              size={16}
              className={
                resending
                  ? "animate-spin"
                  : ""
              }
            />

            {resending
              ? "Sending..."
              : "Resend OTP"}

          </button>

        </div>

        {/* BACK */}

        <button
          type="button"
          onClick={() => {

            localStorage.removeItem(
              "pendingLoginEmail"
            );

            navigate(
              "/login"
            );

          }}
          className="w-full mt-6 flex items-center justify-center gap-2 theme-text-muted hover:theme-text transition"
        >

          <ArrowLeft
            size={17}
          />

          Back to Login

        </button>

      </div>

    </div>
  );
}

export default LoginOtp;