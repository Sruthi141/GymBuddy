const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log(
  "EMAIL_PASS length:",
  process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim().length : 0
);

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { verifyMailConfig } = require("./services/emailService");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const matchRoutes = require("./routes/matches");
const ticketRoutes = require("./routes/tickets");
const gymRoutes = require("./routes/gyms");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const postRoutes = require("./routes/posts");
const paymentRoutes = require("./routes/payments");

const app = express();

// Trust proxy if deployed behind reverse proxy
app.set("trust proxy", 1);

// -----------------------------
// Core middleware
// -----------------------------
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Stripe webhook needs raw body before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    const { webhook } = require("./controllers/paymentController");
    webhook(req, res).catch(next);
  }
);

// JSON parser for all remaining routes
app.use(express.json({ limit: "10mb" }));

// -----------------------------
// Rate limiter
// -----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
  },
});

app.use("/api", limiter);

// -----------------------------
// Health routes
// -----------------------------
app.get("/", (req, res) => {
  res.send("GymBuddy API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "GymBuddy API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api", (req, res) => {
  res.json({
    name: "GymBuddy API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login and get JWT",
        "GET /api/auth/me": "Get current user (auth required)",
      },
      users: {
        "GET /api/users/profile": "Get profile (auth required)",
        "PUT /api/users/profile": "Update profile (auth required)",
      },
      matches: {
        "GET /api/matches": "Get compatible matches (auth required)",
        "POST /api/matches/request": "Send match request (auth required)",
        "POST /api/matches/respond": "Accept/reject match (auth required)",
      },
      tickets: {
        "POST /api/tickets/create": "Create collaboration ticket (auth required)",
        "GET /api/tickets": "Get user tickets (auth required)",
        "PUT /api/tickets/update-status": "Update ticket status (auth required)",
      },
      gyms: {
        "GET /api/gyms": "Browse gyms (public)",
        "GET /api/gyms/:id": "Get gym details (public)",
        "POST /api/gyms": "Create gym (gym owner)",
        "PUT /api/gyms/:id": "Update gym (gym owner)",
      },
      notifications: {
        "GET /api/notifications": "Get notifications (auth required)",
        "PUT /api/notifications/:id/read": "Mark notification read (auth required)",
      },
      admin: {
        "GET /api/admin/stats": "Platform stats (admin)",
        "GET /api/admin/users": "List all users (admin)",
        "DELETE /api/admin/users/:id": "Delete user (admin)",
      },
      posts: {
        "GET /api/posts": "Get all posts",
        "POST /api/posts": "Create a post",
      },
      payments: {
        "POST /api/payments/create-checkout-session":
          "Create Stripe checkout session",
        "POST /api/payments/webhook": "Stripe webhook endpoint",
      },
    },
  });
});

// -----------------------------
// API routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/payments", paymentRoutes);

// -----------------------------
// 404 handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -----------------------------
// Global error handler
// -----------------------------
app.use(errorHandler);

// -----------------------------
// Startup function
// -----------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    await verifyMailConfig();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 GymBuddy API running on port ${PORT}`);
      console.log(`🌐 Local: http://127.0.0.1:${PORT}`);
      console.log(`📋 API docs: http://127.0.0.1:${PORT}/api`);
      console.log(`❤️ Health check: http://127.0.0.1:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;