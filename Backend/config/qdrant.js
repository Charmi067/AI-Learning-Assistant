// config/qdrant.js
// ─────────────────────────────────────────────────────────────
// Qdrant vector database client.
// Connects to your Qdrant Cloud cluster (or local if URL is localhost).
// ─────────────────────────────────────────────────────────────
const { QdrantClient } = require("@qdrant/js-client-rest");
require("dotenv").config();

if (!process.env.QDRANT_URL || !process.env.QDRANT_KEY) {
  throw new Error("❌  Missing QDRANT_URL or QDRANT_KEY in .env");
}

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_KEY,
});

module.exports = qdrant;
