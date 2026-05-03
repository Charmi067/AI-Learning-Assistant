// utils/chunkText.js
// ─────────────────────────────────────────────────────────────
// Splits a long text string into smaller chunks for embedding.
// Default chunk size: 1500 characters
// Overlap: 200 characters (so context is not lost at chunk edges)
// ─────────────────────────────────────────────────────────────

function chunkText(text, size = 1500, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap; // move forward with overlap
    if (start >= text.length) break;
  }

  return chunks;
}

module.exports = chunkText;
