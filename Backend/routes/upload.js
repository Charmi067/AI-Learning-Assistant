// routes/upload.js
// ─────────────────────────────────────────────────────────────
// Protected route (requires Bearer token).
// Full RAG document ingestion pipeline:
//   1. Receive uploaded file via multer
//   2. Extract text (PDF / DOCX / TXT)
//   3. Chunk the text
//   4. Generate Gemini embeddings for each chunk
//   5. Store vectors in Qdrant (user-specific collection)
//   6. Save document metadata to Supabase (documents table)
// ─────────────────────────────────────────────────────────────
const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const upload = require("../middleware/multer.js");
const extractText = require("../middleware/extractText.js");
const chunkText = require("../utils/chunkText.js");
const { generateEmbedding } = require("../services/embeddingService.js");
const { ensureCollection, storeEmbeddings } = require("../services/vectorService.js");
const supabase = require("../config/supabase.js");

// POST /upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { mimetype, buffer, originalname } = req.file;
    const userId = req.user.id; // from verifyToken middleware
    const fileId = crypto.randomUUID();

    // ── Step 1: Extract text from file ──────────────────────
    let text;
    try {
      text = await extractText(mimetype, buffer, originalname);
    } catch (extractErr) {
      return res.status(422).json({ error: extractErr.message });
    }

    if (!text || text.trim().length < 10) {
      return res.status(422).json({ error: "Could not extract meaningful text from this file." });
    }

    // ── Step 2: Split into chunks ────────────────────────────
    const chunks = chunkText(text);
    console.log(`📄 File: ${originalname} → ${chunks.length} chunks`);

    // ── Step 3: Ensure Qdrant collection exists ──────────────
    const collectionName = `user_${userId}_collection`;
    await ensureCollection(collectionName);

    // ── Step 4: Generate embeddings for every chunk ──────────
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const vector = await generateEmbedding(chunks[i]);
      vectors.push(vector);
      // Small log every 10 chunks so you can track progress
      if ((i + 1) % 10 === 0) {
        console.log(`  Embedded ${i + 1}/${chunks.length} chunks...`);
      }
    }

    // ── Step 5: Upsert into Qdrant ───────────────────────────
    await storeEmbeddings(collectionName, chunks, vectors, userId, fileId);

    // ── Step 6: Save metadata to Supabase ───────────────────
    const { error: dbError } = await supabase.from("documents").insert({
      user_id: userId,
      file_name: originalname,
      file_id: fileId,
    });

    if (dbError) {
      // Log but don't fail — vectors are already stored
      console.error("Supabase document insert error:", dbError.message);
    }

    return res.status(201).json({
      message: "Document processed and stored successfully!",
      fileId,
      fileName: originalname,
      totalChunks: chunks.length,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ error: "Failed to process document." });
  }
});

module.exports = router;
