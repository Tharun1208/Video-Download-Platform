import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer";

// =========================================================
// EMAIL TRANSPORTER
// =========================================================

const getTransporter = () => {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "").trim();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const transporter = getTransporter();

// =========================================================
// AUTOMATIC THEME
// =========================================================
//
// 10:00 AM to 12:00 PM IST  → LIGHT
// All other times            → DARK
//
// =========================================================

const getAutomaticTheme = () => {
  const now = new Date();

  const indiaTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const [hour, minute] = indiaTime
    .split(":")
    .map(Number);

  // 10:00 AM to 12:00 PM IST (exclusive of 12:00 PM onwards)
  if (hour >= 10 && (hour < 12 || (hour === 12 && minute === 0))) {
    return "light";
  }

  // All other times
  return "dark";
};

// =========================================================
// GENERATE OTP
// =========================================================

const generateOtp = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// =========================================================
// SEND LOGIN OTP EMAIL
// =========================================================

const sendLoginOtpEmail = async (
  email,
  name,
  otp
) => {
  if (!process.env.EMAIL_USER) {
    throw new Error(
      "EMAIL_USER is missing in .env"
    );
  }

  if (!process.env.EMAIL_PASSWORD) {
    throw new Error(
      "EMAIL_PASSWORD is missing in .env"
    );
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"StreamVault" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "StreamVault Login Verification OTP",

    html: `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    StreamVault Login Verification
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#030712;
    font-family:Arial,Helvetica,sans-serif;
    color:#ffffff;
  "
>

  <div
    style="
      max-width:500px;
      margin:40px auto;
      background:#111827;
      border:1px solid #1f2937;
      border-radius:16px;
      padding:30px;
    "
  >

    <h1
      style="
        text-align:center;
        color:#3b82f6;
        margin-top:0;
      "
    >
      StreamVault
    </h1>

    <h2>
      Login Verification
    </h2>

    <p style="color:#d1d5db;">
      Hello ${name || "User"},
    </p>

    <p
      style="
        color:#9ca3af;
        line-height:1.6;
      "
    >
      We detected a login from a new
      device or location.
    </p>

    <p
      style="
        color:#9ca3af;
        line-height:1.6;
      "
    >
      Use the OTP below to complete
      your login:
    </p>

    <div
      style="
        margin:25px 0;
        padding:20px;
        background:#030712;
        border:1px solid #374151;
        border-radius:12px;
        text-align:center;
      "
    >

      <span
        style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#60a5fa;
        "
      >
        ${otp}
      </span>

    </div>

    <p style="color:#9ca3af;">
      This OTP will expire in 10 minutes.
    </p>

    <p
      style="
        margin-top:30px;
        color:#6b7280;
        font-size:13px;
        line-height:1.5;
      "
    >
      If you did not attempt to log in,
      please secure your account immediately.
    </p>

  </div>

</body>

</html>
    `,
  });
};

// =========================================================
// REGISTER USER
// =========================================================

export const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required",
      });
    }

    if (
      confirmPassword !== undefined &&
      confirmPassword !== null &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    const user =
      await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,

        // AUTOMATIC THEME
        theme: getAutomaticTheme(),
      });

    return res.status(201).json({
      success: true,

      message:
        "Registration successful",

      token: generateToken(
        user._id
      ),

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// LOGIN USER
// =========================================================

export const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
      city,
      state,
      device,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // =====================================================
    // AUTOMATIC THEME
    // =====================================================

    const automaticTheme =
      getAutomaticTheme();

    // =====================================================
    // CURRENT LOGIN INFORMATION
    // =====================================================

    const currentCity =
      city || "";

    const currentState =
      state || "";

    const currentDevice =
      device || "";

    // =====================================================
    // CHECK NEW CITY
    // =====================================================

    const isNewCity =
      Boolean(
        currentCity &&
        user.lastLoginCity &&
        currentCity.toLowerCase() !==
          user.lastLoginCity.toLowerCase()
      );

    // =====================================================
    // CHECK NEW STATE
    // =====================================================

    const isNewState =
      Boolean(
        currentState &&
        user.lastLoginState &&
        currentState.toLowerCase() !==
          user.lastLoginState.toLowerCase()
      );

    // =====================================================
    // CHECK NEW DEVICE
    // =====================================================

    const isNewDevice =
      Boolean(
        currentDevice &&
        user.lastLoginDevice &&
        currentDevice !==
          user.lastLoginDevice
      );

    // =====================================================
    // CHECK PREVIOUS LOGIN
    // =====================================================

    const hasPreviousLogin =
      Boolean(
        user.lastLoginCity ||
        user.lastLoginState ||
        user.lastLoginDevice
      );

    // =====================================================
    // OTP REQUIRED?
    // =====================================================

    const requiresOtp =
      hasPreviousLogin &&
      (
        isNewCity ||
        isNewState ||
        isNewDevice
      );

    console.log(
      "===================================="
    );

    console.log(
      "LOGIN SECURITY CHECK"
    );

    console.log(
      "City:",
      currentCity
    );

    console.log(
      "State:",
      currentState
    );

    console.log(
      "Device:",
      currentDevice
    );

    console.log(
      "Previous City:",
      user.lastLoginCity
    );

    console.log(
      "Previous State:",
      user.lastLoginState
    );

    console.log(
      "Previous Device:",
      user.lastLoginDevice
    );

    console.log(
      "New City:",
      isNewCity
    );

    console.log(
      "New State:",
      isNewState
    );

    console.log(
      "New Device:",
      isNewDevice
    );

    console.log(
      "Requires OTP:",
      requiresOtp
    );

    console.log(
      "Automatic Theme:",
      automaticTheme
    );

    console.log(
      "===================================="
    );

    // =====================================================
    // NEW DEVICE / LOCATION
    // SEND OTP
    // =====================================================

    if (requiresOtp) {
      const otp =
        generateOtp();

      user.loginOtp = otp;

      user.loginOtpExpire =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      user.loginOtpVerified =
        false;

      user.pendingLoginCity =
        currentCity;

      user.pendingLoginState =
        currentState;

      user.pendingLoginDevice =
        currentDevice;

      // Save automatic theme for pending login
      user.pendingLoginTheme =
        automaticTheme;

      await user.save();

      try {
        await sendLoginOtpEmail(
          user.email,
          user.name,
          otp
        );

        console.log(
          "LOGIN OTP SENT TO:",
          user.email
        );
      } catch (emailError) {
        console.error(
          "LOGIN OTP EMAIL ERROR:",
          emailError
        );

        user.loginOtp = null;

        user.loginOtpExpire =
          null;

        user.loginOtpVerified =
          false;

        await user.save();

        return res.status(500).json({
          success: false,
          message:
            emailError?.message
              ? `Unable to send login OTP: ${emailError.message}`
              : "Unable to send login OTP. Please check your email configuration.",
        });
      }

      return res.status(200).json({
        success: false,

        requiresOtp: true,

        message:
          "New device or location detected. OTP sent to your registered email.",

        email: user.email,
      });
    }

    // =====================================================
    // NORMAL LOGIN
    // =====================================================

    user.theme =
      automaticTheme;

    user.lastLoginCity =
      currentCity;

    user.lastLoginState =
      currentState;

    user.lastLoginDevice =
      currentDevice;

    user.loginOtp =
      null;

    user.loginOtpExpire =
      null;

    user.loginOtpVerified =
      true;

    user.pendingLoginCity =
      "";

    user.pendingLoginState =
      "";

    user.pendingLoginDevice =
      "";

    user.pendingLoginTheme =
      null;

    await user.save();

    console.log(
      "LOGIN THEME:",
      user.theme
    );

    return res.status(200).json({
      success: true,

      requiresOtp: false,

      message:
        "Login successful",

      token: generateToken(
        user._id
      ),

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// VERIFY LOGIN OTP
// =========================================================

export const verifyLoginOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,

        message:
          "Email and OTP are required.",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found.",
      });
    }

    if (!user.loginOtp) {
      return res.status(400).json({
        success: false,

        message:
          "No login OTP is available.",
      });
    }

    // =====================================================
    // CHECK OTP EXPIRATION
    // =====================================================

    if (
      !user.loginOtpExpire ||
      user.loginOtpExpire <
        new Date()
    ) {
      user.loginOtp =
        null;

      user.loginOtpExpire =
        null;

      await user.save();

      return res.status(400).json({
        success: false,

        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // =====================================================
    // CHECK OTP
    // =====================================================

    if (
      String(user.loginOtp) !==
      String(otp)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid OTP.",
      });
    }

    // =====================================================
    // OTP VERIFIED
    // =====================================================

    user.lastLoginCity =
      user.pendingLoginCity ||
      "";

    user.lastLoginState =
      user.pendingLoginState ||
      "";

    user.lastLoginDevice =
      user.pendingLoginDevice ||
      "";

    // Use automatic theme saved when OTP was generated
    user.theme =
      user.pendingLoginTheme ||
      getAutomaticTheme();

    user.loginOtpVerified =
      true;

    user.loginOtp =
      null;

    user.loginOtpExpire =
      null;

    user.pendingLoginCity =
      "";

    user.pendingLoginState =
      "";

    user.pendingLoginDevice =
      "";

    user.pendingLoginTheme =
      null;

    await user.save();

    console.log(
      "===================================="
    );

    console.log(
      "LOGIN OTP VERIFIED:",
      user.email
    );

    console.log(
      "THEME:",
      user.theme
    );

    console.log(
      "===================================="
    );

    return res.status(200).json({
      success: true,

      requiresOtp: false,

      message:
        "OTP verified. Login successful.",

      token: generateToken(
        user._id
      ),

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// RESEND LOGIN OTP
// =========================================================

export const resendLoginOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,

        message:
          "Email is required.",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found.",
      });
    }

    const hasPendingLogin =
      user.pendingLoginCity ||
      user.pendingLoginState ||
      user.pendingLoginDevice;

    if (!hasPendingLogin) {
      return res.status(400).json({
        success: false,

        message:
          "There is no pending login verification.",
      });
    }

    const otp =
      generateOtp();

    user.loginOtp =
      otp;

    user.loginOtpExpire =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.loginOtpVerified =
      false;

    // Keep automatic theme
    user.pendingLoginTheme =
      getAutomaticTheme();

    await user.save();

    await sendLoginOtpEmail(
      user.email,
      user.name,
      otp
    );

    console.log(
      "LOGIN OTP RESENT:",
      user.email
    );

    return res.status(200).json({
      success: true,

      message:
        "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "Resend OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// UPDATE THEME
// =========================================================

export const updateTheme = async (
  req,
  res
) => {
  try {
    const {
      theme,
    } = req.body;

    if (
      theme !== "light" &&
      theme !== "dark"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Theme must be light or dark.",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found.",
      });
    }

    user.theme =
      theme;

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        "Theme updated successfully.",

      theme:
        user.theme,
    });
  } catch (error) {
    console.error(
      "Update theme error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

export const forgotPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,

        message:
          "Email is required",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    user.resetPasswordToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await user.save();

    const resetURL =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from:
        `"StreamVault" <${process.env.EMAIL_USER}>`,

      to:
        user.email,

      subject:
        "StreamVault Password Reset",

      html: `
<!DOCTYPE html>

<html>

<body
  style="
    font-family:Arial,sans-serif;
    background:#030712;
    color:white;
    padding:40px;
  "
>

  <div
    style="
      max-width:600px;
      margin:auto;
      background:#111827;
      padding:30px;
      border-radius:16px;
    "
  >

    <h2 style="color:#3b82f6;">
      StreamVault Password Reset
    </h2>

    <p style="color:#d1d5db;">
      We received a request to reset
      your StreamVault password.
    </p>

    <p>

      <a
        href="${resetURL}"
        style="
          display:inline-block;
          background:#2563eb;
          color:white;
          padding:12px 20px;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
        "
      >
        Reset Password
      </a>

    </p>

    <p style="color:#9ca3af;">
      This link expires in 15 minutes.
    </p>

  </div>

</body>

</html>
      `,
    });

    return res.json({
      success: true,

      message:
        "Password reset link sent to email",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// RESET PASSWORD
// =========================================================

export const resetPassword = async (
  req,
  res
) => {
  try {
    const resetToken =
      crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user =
      await User.findOne({
        resetPasswordToken:
          resetToken,

        resetPasswordExpire: {
          $gt: new Date(),
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid or expired token",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        req.body.password,
        salt
      );

    user.resetPasswordToken =
      null;

    user.resetPasswordExpire =
      null;

    await user.save();

    return res.json({
      success: true,

      message:
        "Password reset successful",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET PROFILE
// =========================================================

export const getProfile = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};