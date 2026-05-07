// routes/conversation.js
// ─────────────────────────────────────────────────────────────
// Protected route (requires Bearer token).
// GET /AiDashboard/:userId/:conversationId
// Returns all messages for a specific conversation.
// Security: verifies the conversation belongs to req.user.id
// ─────────────────────────────────────────────────────────────
const express = require("express");
const supabase = require("../config/supabase.js");

const router = express.Router();

router.get("/AiDashboard/:userId/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id; // from verifyToken — always trust this, not the URL param

    // Verify this conversation belongs to the authenticated user
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (convErr || !conv) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied.",
      });
    }

    // Fetch messages ordered by creation time
    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    return res.json({ success: true, conversationMessages: messages });
  } catch (err) {
    console.error("Conversation route error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
