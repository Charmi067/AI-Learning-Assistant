// server.js
// ─────────────────────────────────────────────────────────────
// Main Express server entry point.
// Firebase has been fully removed.
// Auth is now handled by Supabase.
// ─────────────────────────────────────────────────────────────
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ── Route imports ────────────────────────────────────────────
const authRoutes = require("./routes/auth.js");
const uploadRoute = require("./routes/upload.js");
const askRoute = require("./routes/ask.js");
const conversationRoute = require("./routes/conversation.js");
const conversationsRoute = require("./routes/conversations.js");

// ── Middleware imports ───────────────────────────────────────
const { verifyToken } = require("./middleware/verifyToken.js");

const app = express();

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://127.0.0.1:3001",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://ai-learning-assistant-rust.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ── Public routes (no auth required) ─────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 AI Learning Assistant Backend is Live");
});

app.use("/auth", authRoutes); // signup, login, forgot-password

// ── Protected routes (Bearer token required) ─────────────────
app.use("/upload", verifyToken, uploadRoute);
app.use("/", verifyToken, askRoute);
app.use("/", verifyToken, conversationRoute);
app.use("/", verifyToken, conversationsRoute);

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Auth: Supabase`);
  console.log(`🔢 Vector DB: Qdrant`);
  console.log(`🤖 AI Model: Gemini 2.0 Flash\n`);
});
