// routes/auth.js
// ─────────────────────────────────────────────────────────────
// Public authentication routes — no token required.
//   POST /auth/signup          → Register new user
//   POST /auth/login           → Login with email + password
//   POST /auth/forgot-password → Send password reset email
// ─────────────────────────────────────────────────────────────
const express = require("express");
const supabase = require("../config/supabase.js");

const router = express.Router();

// ──────────────────────────────────────────────
// POST /auth/signup
// Body: { email, password, name }
// ──────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || "" }, // stored in user_metadata
    },
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({
    message: "Signup successful! Please check your email to verify your account.",
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  });
});

// ──────────────────────────────────────────────
// POST /auth/login
// Body: { email, password }
// Returns: { session: { access_token, ... }, user }
// ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  return res.json({
    message: "Login successful.",
    session: data.session,   // contains access_token — frontend stores this
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || "",
    },
  });
});

// ──────────────────────────────────────────────
// POST /auth/forgot-password
// Body: { email }
// Sends a password reset link to the user's email
// ──────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // Always return 200 even if email doesn't exist (security best practice)
  return res.json({
    message: "If this email is registered, a password reset link has been sent.",
  });
});

module.exports = router;
