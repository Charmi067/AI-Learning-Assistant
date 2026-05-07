// routes/conversations.js
// ─────────────────────────────────────────────────────────────
// Protected route (requires Bearer token).
// GET /AiDashboard/:user
// Returns all conversations for the authenticated user,
// sorted by most recently updated first.
// ─────────────────────────────────────────────────────────────
const express = require("express");
const supabase = require("../config/supabase.js");

const router = express.Router();

router.get("/AiDashboard/:user", async (req, res) => {
  try {
    const userId = req.user.id; // always use authenticated user, not URL param

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, conversations });
  } catch (err) {
    console.error("Conversations list error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
