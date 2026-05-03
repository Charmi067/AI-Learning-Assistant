// services/ragService.js
// ─────────────────────────────────────────────────────────────
// Handles the final step of the RAG pipeline:
//   - If fileId was provided → RAG mode (context + question → LLM)
//   - If no fileId           → General AI mode (question → LLM)
//
// Uses Gemini 2.0 Flash for fast, structured HTML responses.
// ─────────────────────────────────────────────────────────────
// services/ragService.js
require("dotenv").config();

async function generateAnswer(question, contextChunks = []) {
  let prompt;

  if (contextChunks.length > 0) {
    prompt = `
You are an AI learning assistant. Use ONLY the context below to answer the question.
If the context doesn't contain enough information, say so honestly.

Reply in clean, structured HTML format using:
<h2> for headings, <p> for paragraphs, <ul><li> for lists, <b> for emphasis.
Add relevant emojis (📌 🔥 ✅ 📚 ⚡) to make it engaging.

### Context from uploaded document:
${contextChunks.join("\n\n---\n\n")}

### User Question:
${question}

### Your Answer (in HTML):
`;
  } else {
    prompt = `
You are an AI learning assistant. Answer the question clearly and helpfully.

Reply in clean, structured HTML format using:
<h2> for headings, <p> for paragraphs, <ul><li> for lists, <b> for emphasis.
Add relevant emojis (📌 🔥 ✅ 📚 ⚡) to make it engaging.

### User Question:
${question}

### Your Answer (in HTML):
`;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Gemini API error: ${JSON.stringify(data.error)}`);
  }

  return data.candidates[0].content.parts[0].text;
}

module.exports = { generateAnswer };