// services/vectorService.js
// ─────────────────────────────────────────────────────────────
// All Qdrant operations are here:
//   - ensureCollection  → creates collection if it doesn't exist
//   - storeEmbeddings   → upserts text chunks + vectors into Qdrant
//   - searchSimilar     → finds top-k most relevant chunks for a query
//   - deleteFileVectors → removes all vectors belonging to a file
// ─────────────────────────────────────────────────────────────
const { v4: uuidv4 } = require("crypto");
const qdrant = require("../config/qdrant.js");
const crypto = require("crypto");

const VECTOR_SIZE = 3072; // Gemini text-embedding-004 output size  

/**
 * Creates a Qdrant collection for this user if it doesn't already exist.
 * Each user gets their own collection: user_<userId>_collection
 */
async function ensureCollection(collectionName) {
  try {
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
      optimizers_config: {
        default_segment_number: 2,
      },
    });

    // Create an index on fileId for fast filtered search
    await qdrant.createPayloadIndex(collectionName, {
      field_name: "fileId",
      field_schema: "keyword",
    });

    console.log(`✅ Qdrant collection created: ${collectionName}`);
  } catch (err) {
    // Qdrant throws an error if collection already exists — that's fine
    console.log(`ℹ️  Collection already exists: ${collectionName}`);
  }
}

/**
 * Stores text chunks and their corresponding embedding vectors into Qdrant.
 * Each chunk becomes one "point" with metadata (userId, fileId, chunkIndex, text).
 *
 * @param {string} collectionName
 * @param {string[]} chunks - Array of text strings
 * @param {number[][]} vectors - Array of embedding vectors (same length as chunks)
 * @param {string} userId
 * @param {string} fileId
 */
async function storeEmbeddings(collectionName, chunks, vectors, userId, fileId) {
  const points = chunks.map((chunk, i) => ({
    id: crypto.randomUUID(), // UUID string — safe and unique
    vector: vectors[i],
    payload: {
      userId,
      fileId,
      chunkIndex: i,
      text: chunk,
    },
  }));

  await qdrant.upsert(collectionName, { points });
  console.log(`✅ Stored ${points.length} vectors in ${collectionName}`);
}

/**
 * Searches for the top-k most similar chunks in a collection,
 * filtered by fileId so results only come from the specified document.
 *
 * @param {string} collectionName
 * @param {number[]} queryVector - Embedding of the user's question
 * @param {string} fileId - Filter to this document only
 * @param {number} limit - Number of results to return (default 8)
 * @returns {Promise<string[]>} - Array of matched text chunks
 */
async function searchSimilar(collectionName, queryVector, fileId, limit = 8) {
  const results = await qdrant.search(collectionName, {
    vector: queryVector,
    limit,
    filter: {
      must: [
        {
          key: "fileId",
          match: { value: fileId },
        },
      ],
    },
    with_payload: true,
  });

  return results.map((r) => r.payload.text);
}

/**
 * Deletes all vectors associated with a specific file from Qdrant.
 * Useful when a user deletes a document.
 *
 * @param {string} collectionName
 * @param {string} fileId
 */
async function deleteFileVectors(collectionName, fileId) {
  await qdrant.delete(collectionName, {
    filter: {
      must: [{ key: "fileId", match: { value: fileId } }],
    },
  });
  console.log(`🗑️  Deleted vectors for fileId: ${fileId}`);
}

module.exports = { ensureCollection, storeEmbeddings, searchSimilar, deleteFileVectors };
