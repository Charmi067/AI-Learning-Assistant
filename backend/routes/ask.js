// routes/ask.js
// ─────────────────────────────────────────────────────────────
// Protected route (requires Bearer token).
// RAG Query pipeline:
//   1. Accept user question + optional fileId + optional conversationId
//   2. If fileId → embed question → search Qdrant → build context
//   3. Send context + question to Gemini → get answer
//   4. Save conversation + messages to Supabase
// ─────────────────────────────────────────────────────────────
const express = require("express");

const router = express.Router();
const { generateEmbedding } = require("../services/embeddingService.js");
const { searchSimilar } = require("../services/vectorService.js");
const { generateAnswer } = require("../services/ragService.js");
const supabase = require("../config/supabase.js");

// POST /AiDashboard/ask
// Body: { que, fileId?, conversationId? }
router.post("/AiDashboard/ask", async (req, res) => {
  try {
    const { que, fileId, conversationId } = req.body;
    const userId = req.user.id;

    if (!que || que.trim() === "") {
      return res.status(400).json({ message: "Question cannot be empty." });
    }

    let contextChunks = [];

    // ── RAG Mode: retrieve relevant chunks from Qdrant ───────
    if (fileId) {
      const collectionName = `user_${userId}_collection`;
      const queryVector = await generateEmbedding(que);
      contextChunks = await searchSimilar(collectionName, queryVector, fileId);
    }

    // ── Generate AI answer ───────────────────────────────────
    const answer = await generateAnswer(que, contextChunks);
    const title = que.split(" ").slice(0, 5).join(" ");

    // ── Save to Supabase ─────────────────────────────────────
    let convId = conversationId;

    if (!convId) {
      // Create a new conversation
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (convErr) throw convErr;
      convId = newConv.id;
    } else {
      // Update existing conversation's updated_at and title
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), title })
        .eq("id", convId)
        .eq("user_id", userId); // security: ensure ownership
    }

    // Store user message + assistant reply
    const { error: msgErr } = await supabase.from("messages").insert([
      {
        conversation_id: convId,
        role: "user",
        content: que,
        used_chunks: [],
      },
      {
        conversation_id: convId,
        role: "assistant",
        content: answer,
        used_chunks: contextChunks, // stored as JSONB
      },
    ]);

    if (msgErr) {
      console.error("Message insert error:", msgErr.message);
    }

    return res.json({
      success: true,
      answer,
      conversationId: convId,
      chunksUsed: contextChunks.length,
    });
  } catch (err) {
    console.error("Ask route error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
