require("dotenv").config();

async function generateEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Embedding API error: ${JSON.stringify(data.error)}`);
  }

  return data.embedding.values;
}

module.exports = { generateEmbedding };