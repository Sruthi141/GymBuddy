const nodemailer = require("nodemailer");

const APP_NAME = "GymBuddy";
const BRAND_COLOR = "#00d9b5";
const BRAND_GRADIENT = "linear-gradient(135deg,#00d9b5 0%,#00a88a 100%)";

let transporterInstance = null;
let emailConfigured = false;

const getTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return transporterInstance;
};

const verifyMailConfig = async () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    emailConfigured = false;
    console.warn("⚠️ EMAIL not configured: EMAIL_USER and EMAIL_PASS are required.");
    return false;
  }

  try {
    const transporter = getTransporter();

    if (!transporter) {
      emailConfigured = false;
      console.error("❌ Transporter could not be created.");
      return false;
    }

    await transporter.verify();
    emailConfigured = true;
    console.log(`✅ Email configured successfully: ${user}`);
    return true;
  } catch (err) {
    emailConfigured = false;
    console.error("❌ Email verification failed:", err.message);
    console.error("   Check EMAIL_USER and EMAIL_PASS in .env");
    return false;
  }
};

const isEmailConfigured = () => emailConfigured;

const sendOTP = async (to, name, otp, purpose = "email-verify") => {
  const transporter = getTransporter();

  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!transporter) {
    console.log(`📧 [DEV] OTP for ${to}: ${otp} (${purpose})`);
    console.log("   Configure EMAIL_USER and EMAIL_PASS in .env to send real emails.");
    return { success: true, dev: true };
  }

  const subject =
    purpose === "password-reset"
      ? `🔐 ${APP_NAME} - Password Reset OTP`
      : `✉️ ${APP_NAME} - Verify Your Email`;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0f;border-radius:20px;overflow:hidden;border:1px solid rgba(0,217,181,0.2);">
      <div style="padding:28px;text-align:center;background:${BRAND_GRADIENT};">
        <h1 style="color:#030305;font-size:24px;margin:0;font-weight:800;">${APP_NAME}</h1>
        <p style="color:rgba(3,3,5,0.8);margin:6px 0 0;font-size:13px;">
          ${purpose === "password-reset" ? "Password Reset" : "Email Verification"}
        </p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#f8fafc;font-size:18px;margin:0 0 12px;">Hi ${name || "there"}!</h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Your verification code is:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;padding:16px 32px;background:rgba(0,217,181,0.15);border:2px solid ${BRAND_COLOR};border-radius:12px;font-size:28px;font-weight:800;letter-spacing:8px;color:#00d9b5;">
            ${otp}
          </span>
        </div>
        <p style="color:#64748b;font-size:12px;margin:0;">
          This code expires in 10 minutes. Never share it with anyone.
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #252530;">
        <p style="color:#4a4a5a;font-size:11px;margin:0;text-align:center;">
          Sent by ${APP_NAME}. If you didn't request this, please ignore.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.EMAIL_USER?.trim()}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 OTP email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendVerificationEmail = async (to, name, token) => {
  const transporter = getTransporter();
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify-email/${token}`;

  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!transporter) {
    console.log(`📧 [DEV] Verification link for ${to}: ${verifyUrl}`);
    return { success: true, dev: true };
  }

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;border-radius:20px;overflow:hidden;border:1px solid rgba(0,217,181,0.2);">
      <div style="padding:28px;text-align:center;background:${BRAND_GRADIENT};">
        <h1 style="color:#030305;font-size:24px;margin:0;font-weight:800;">${APP_NAME}</h1>
        <p style="color:rgba(3,3,5,0.8);margin:6px 0 0;font-size:13px;">Gym Owner Verification</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#f8fafc;font-size:18px;margin:0 0 12px;">Welcome, ${name || "there"}!</h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Verify your email to activate your gym owner account and start listing your gym.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:${BRAND_GRADIENT};color:#030305;text-decoration:none;border-radius:14px;font-weight:700;font-size:14px;">
          Verify My Email
        </a>
        <p style="color:#64748b;font-size:12px;margin:24px 0 0;">
          Link: <a href="${verifyUrl}" style="color:#00d9b5;">${verifyUrl}</a>
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #252530;">
        <p style="color:#4a4a5a;font-size:11px;margin:0;text-align:center;">Sent by ${APP_NAME}.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.EMAIL_USER?.trim()}>`,
      to,
      subject: `✅ Verify your ${APP_NAME} Gym Owner Account`,
      html,
    });

    console.log(`📧 Verification email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendPaymentReminder = async (to, name, gymName, amount, dueDate, isOverdue) => {
  const transporter = getTransporter();

  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!transporter) {
    console.log(
      `📧 [DEV] Payment reminder for ${to}: ${gymName} ₹${amount} ${isOverdue ? "overdue" : "due"} ${dueDate}`
    );
    return { success: true, dev: true };
  }

  const subject = isOverdue
    ? `⚠️ Payment overdue: ${gymName} membership`
    : `📅 Payment reminder: ${gymName} due ${new Date(dueDate).toLocaleDateString()}`;

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0f;border-radius:20px;overflow:hidden;border:1px solid rgba(0,217,181,0.2);">
      <div style="padding:28px;text-align:center;background:${BRAND_GRADIENT};">
        <h1 style="color:#030305;font-size:24px;margin:0;font-weight:800;">${APP_NAME}</h1>
        <p style="color:rgba(3,3,5,0.8);margin:6px 0 0;font-size:13px;">Payment ${isOverdue ? "Overdue" : "Reminder"}</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#f8fafc;font-size:18px;margin:0 0 12px;">Hi ${name || "there"}!</h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
          ${
            isOverdue
              ? `Your payment of ₹${amount} for <strong>${gymName}</strong> is overdue. Please pay at your earliest convenience.`
              : `Your payment of ₹${amount} for <strong>${gymName}</strong> is due on ${new Date(dueDate).toLocaleDateString()}.`
          }
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #252530;">
        <p style="color:#4a4a5a;font-size:11px;margin:0;text-align:center;">Sent by ${APP_NAME}.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.EMAIL_USER?.trim()}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Payment reminder sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Payment reminder failed to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendOTP,
  sendVerificationEmail,
  sendPaymentReminder,
  verifyMailConfig,
  isEmailConfigured,
  getTransporter,
};