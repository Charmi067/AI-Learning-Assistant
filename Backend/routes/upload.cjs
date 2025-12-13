const express = require("express");
const qdrant = require("../vector/Qdrant.cjs");   // convert this file too if needed
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const crypto = require("crypto")
const router = express.Router();
const upload = require("../middleware/multer.cjs");
const extractText= require("../middleware/extractText.cjs");
// -----------------------------
// ✅ Initialize Gemini
// -----------------------------
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Embedding model
const embedModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
});

function chunkText(text, size = 1500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

router.post("/", upload.single("file"), async (req, res) => {
    try {
        const fileId = crypto.randomUUID();
        const mimeType= req.file.mimetype;
        const fileBuffer= req.file.buffer;
        const fileName = req.file.originalname;
        console.log("mimeType======",mimeType);
        const text= await extractText(mimeType,fileBuffer,fileName);
        console.log("text",text);
        const textChunks = chunkText(text);
        const userId = req.user.uid;
        // 4️⃣ Qdrant User Collection
        const qdrantCollection = `user_${userId}_collection`;
        // Create collection only if not exists
        try {
            await qdrant.createCollection(qdrantCollection, {
                vectors: {
                    size:768,
                    distance: "Cosine",
                },
                // ADD THIS
                sparse_vectors: {},
                // CREATE INDEXES
                optimizers_config: {
                    default_segment_number: 2
                }
            });
            await qdrant.createPayloadIndex(qdrantCollection, {
                field_name: "fileId",
                field_schema: "keyword"
            });
            
        } catch (err) {
            console.log("Collection exists, skipping creation...");
        }
        // Generate embeddings and push to Qdrant
        let points = [];

        for (let i = 0; i < textChunks.length; i++) {
            const result = await embedModel.embedContent({
                content:
                {
                    parts: [{ text: textChunks[i] }]
                }
            });
            const vector = result.embedding.values;
            points.push({
                id: Date.now(),  // FIXED UNIQUE ID
                vector,
                payload: {
                    UID:userId,
                    fileId:fileId,
                    chunkIndex: i,
                    text: textChunks[i],
                }
            });
        }

        await qdrant.upsert(qdrantCollection, { points });

        res.json({
            message: "PDF processed and stored successfully!",
            totalChunks: textChunks.length,
            fileId: fileId
        });

    } catch (err) {
        console.error("ERROR IN PDF PROCESSING:", err);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

module.exports = router;