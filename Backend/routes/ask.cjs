const express = require("express");
const qdrant = require("../vector/Qdrant.cjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Firestore
const { db } = require("../firebaseAdmin.cjs");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");

router.post("/AiDashboard/ask", async (req, res) => {
    try {
        const { userId, que, fileId, conversationId } = req.body;

        if (!que) {
            return res.status(400).json({ message: "You Can Not Send Empty Message!!!" });
        }

        let prompt = "";
        let matchedChunks = [];
        let usedChunkIds = [];

        // CASE 1️⃣ — No file → Normal AI answer
        if (!fileId) {
            prompt = `
            ###very important
             kindly remember do not include extra mess in starting and ending of the answer...
            You are an AI assistant. ALWAYS reply in a clean, structured, user-friendly format.

            ### Formatting Rules:
            - Use ⭐, 🔥, ⚡, 📌, 📚, ➤, ✔️, ❌ icons
            - Use headings (### Title)
            - Use bullet points
            - Use short paragraphs
            - Add a final summary
            - add new line for headings

            Return ONLY HTML using:
            <h2>, <p>, <ul><li>, <b> with emojis (🔥✨📌)
            ### User Question:
            ${que}
            `;
        }

        // CASE 2️⃣ — With File → RAG mode
        else {
            // Generate embedding
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const embeddingResult = await model.embedContent(que);
            const userVector = embeddingResult.embedding.values;

            const qdrantCollection = `user_${userId}_collection`;

            // Search Qdrant
            const searchRes = await qdrant.search(qdrantCollection, {
                vector: userVector,
                limit: 10,
                filter: {
                    must: [{
                        key: "fileId",
                        match: { value: fileId }
                    }]
                }
            });

            matchedChunks = searchRes.map(i => i.payload.text);
            usedChunkIds = searchRes.map(i => i.id);

            prompt = `
            You are an AI assistant. ALWAYS reply in a clean structured HTML format.

            ### Context:
            ${matchedChunks.join("\n\n")}

            ### User Question:
            ${que}

            ### Your Answer:
            `;
        }

        // AI RESPONSE
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await chatModel.generateContent(prompt);
        const answer = result.response.text();

        const title = que.split(" ").slice(0, 5).join(" ");

        // Firestore Conversation Reference
        const convRef = db.collection("users").doc(userId).collection("conversations").doc(conversationId);

        // Create / Update Conversation
        await convRef.set({
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            title,
            ...(fileId && { fileIDs: FieldValue.arrayUnion(fileId) }),
            ...(usedChunkIds.length > 0 && { usedChunks: FieldValue.arrayUnion(...usedChunkIds) })
        }, { merge: true });

        // Store User Message
        await convRef.collection("messages").add({
            role: "user",
            content: que,
            Timestamp: Timestamp.now(),
            usedChunks: []
        });

        // Store AI Message
        await convRef.collection("messages").add({
            role: "assistant",
            content: answer,
            Timestamp: Timestamp.now(),
            usedChunks: usedChunkIds
        });

        return res.json({
            success: true,
            answer,
            chunks: matchedChunks
        });

    } catch (err) {
        console.error("Error occured during ask route:", err);
        return res.status(500).json({ message: "AI Error" });
    }
});

module.exports = router;
