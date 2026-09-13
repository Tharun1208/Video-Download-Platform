import nodemailer from "nodemailer";

// =========================================================
// GMAIL TRANSPORTER
// =========================================================

export const getTransporter = () => {
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
// VERIFY EMAIL CONFIGURATION
// =========================================================

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.error(
        "Email transporter verification failed:",
        error.message
      );
    } else {
      console.log(
        "✅ Email server is ready to send messages:",
        process.env.EMAIL_USER
      );
    }
  });
} else {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_PASSWORD is missing in environment variables. Email sending is disabled."
  );
}

// =========================================================
// SEND SUBSCRIPTION EMAIL
// =========================================================

export const sendSubscriptionEmail = async ({
  name,
  email,
  plan,
  amount,
  orderId,
  paymentId,
  date,
}) => {
  try {
    const transporter = getTransporter();
    // =====================================================
    // VALIDATE EMAIL
    // =====================================================

    if (!email) {
      throw new Error(
        "Recipient email is missing."
      );
    }

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

    // =====================================================
    // MAIL OPTIONS
    // =====================================================

    const mailOptions = {
      from: `"StreamVault" <${process.env.EMAIL_USER}>`,

      to: email,

      subject:
        `StreamVault ${plan} Subscription Confirmation`,

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
    StreamVault Subscription Confirmation
  </title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #030712;
    font-family: Arial, Helvetica, sans-serif;
    color: #ffffff;
  "
>

  <div
    style="
      max-width: 650px;
      margin: 40px auto;
      background-color: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
    "
  >

    <!-- HEADER -->

    <div
      style="
        background-color: #2563eb;
        padding: 30px;
        text-align: center;
      "
    >

      <h1
        style="
          margin: 0;
          font-size: 30px;
          color: #ffffff;
        "
      >
        StreamVault
      </h1>

      <p
        style="
          margin: 8px 0 0;
          color: #dbeafe;
          font-size: 15px;
        "
      >
        Subscription Confirmation
      </p>

    </div>

    <!-- CONTENT -->

    <div style="padding: 30px;">

      <h2
        style="
          margin-top: 0;
          color: #ffffff;
        "
      >
        Hello ${name || "User"},
      </h2>

      <p
        style="
          color: #9ca3af;
          line-height: 1.6;
          font-size: 15px;
        "
      >
        Your StreamVault subscription has been
        successfully activated.
      </p>

      <!-- SUCCESS -->

      <div
        style="
          margin-top: 25px;
          padding: 15px;
          background-color: #052e16;
          border: 1px solid #166534;
          border-radius: 10px;
          text-align: center;
        "
      >

        <p
          style="
            margin: 0;
            color: #4ade80;
            font-weight: bold;
            font-size: 16px;
          "
        >
          Payment Successful
        </p>

      </div>

      <!-- SUBSCRIPTION DETAILS -->

      <div
        style="
          background-color: #030712;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 20px;
          margin-top: 25px;
        "
      >

        <h3
          style="
            margin-top: 0;
            color: #ffffff;
          "
        >
          Subscription Details
        </h3>

        <p style="color: #d1d5db;">
          <strong>Plan:</strong>
          ${plan}
        </p>

        <p style="color: #d1d5db;">
          <strong>Amount:</strong>
          ₹${amount}
        </p>

        <p style="color: #d1d5db;">
          <strong>Status:</strong>

          <span
            style="
              color: #22c55e;
              font-weight: bold;
            "
          >
            Successful
          </span>
        </p>

        <p style="color: #d1d5db;">
          <strong>Date:</strong>
          ${date}
        </p>

      </div>

      <!-- TRANSACTION DETAILS -->

      <div
        style="
          background-color: #030712;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        "
      >

        <h3
          style="
            margin-top: 0;
            color: #ffffff;
          "
        >
          Transaction Details
        </h3>

        <p
          style="
            color: #d1d5db;
            word-break: break-all;
          "
        >
          <strong>Order ID:</strong>
          <br />
          ${orderId}
        </p>

        <p
          style="
            color: #d1d5db;
            word-break: break-all;
          "
        >
          <strong>Payment ID:</strong>
          <br />
          ${paymentId}
        </p>

      </div>

      <!-- BENEFITS -->

      <div style="margin-top: 25px;">

        <h3 style="color: #ffffff;">
          Your ${plan} Benefits
        </h3>

        ${
          plan === "Bronze"
            ? `
              <p style="color:#d1d5db;">
                ✓ 5 downloads per day
              </p>

              <p style="color:#d1d5db;">
                ✓ HD video quality
              </p>

              <p style="color:#d1d5db;">
                ✓ Faster downloads
              </p>

              <p style="color:#d1d5db;">
                ✓ Basic premium videos
              </p>
            `
            : ""
        }

        ${
          plan === "Silver"
            ? `
              <p style="color:#d1d5db;">
                ✓ 15 downloads per day
              </p>

              <p style="color:#d1d5db;">
                ✓ Full premium videos
              </p>

              <p style="color:#d1d5db;">
                ✓ High quality downloads
              </p>

              <p style="color:#d1d5db;">
                ✓ Priority support
              </p>

              <p style="color:#d1d5db;">
                ✓ No ads
              </p>
            `
            : ""
        }

        ${
          plan === "Gold"
            ? `
              <p style="color:#d1d5db;">
                ✓ Unlimited downloads
              </p>

              <p style="color:#d1d5db;">
                ✓ 4K video quality
              </p>

              <p style="color:#d1d5db;">
                ✓ No ads
              </p>

              <p style="color:#d1d5db;">
                ✓ Early access features
              </p>

              <p style="color:#d1d5db;">
                ✓ VIP support
              </p>
            `
            : ""
        }

      </div>

      <!-- FOOTER MESSAGE -->

      <p
        style="
          color: #9ca3af;
          margin-top: 30px;
          line-height: 1.6;
        "
      >
        Thank you for choosing
        <strong style="color:#ffffff;">
          StreamVault
        </strong>.

        <br />

        Enjoy your premium experience!
      </p>

    </div>

    <!-- FOOTER -->

    <div
      style="
        padding: 20px;
        text-align: center;
        border-top: 1px solid #1f2937;
        color: #6b7280;
        font-size: 13px;
      "
    >
      © ${new Date().getFullYear()}
      StreamVault.
      All rights reserved.
    </div>

  </div>

</body>

</html>
      `,
    };

    // =====================================================
    // SEND EMAIL
    // =====================================================

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "===================================="
    );

    console.log(
      "✅ EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "To:",
      email
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    console.log(
      "===================================="
    );

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {

    console.error(
      "===================================="
    );

    console.error(
      "❌ SEND EMAIL ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    throw error;
  }
};