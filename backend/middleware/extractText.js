// middleware/extractText.js
// ─────────────────────────────────────────────────────────────
// Extracts plain text from uploaded file buffers.
// Supported: PDF, DOCX, TXT
// Removed: textract (had heavy native system dependencies)
// ─────────────────────────────────────────────────────────────
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(mimeType, fileBuffer, fileName) {
  // PDF
  if (mimeType === "application/pdf") {
    const data = await pdfParse(fileBuffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF appears to be scanned/image-only. Text extraction failed.");
    }
    return data.text;
  }

  // DOCX
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ buffer: fileBuffer });
    return data.value;
  }

  // Plain text
  if (mimeType === "text/plain") {
    return fileBuffer.toString("utf8");
  }

  throw new Error(
    `Unsupported file type: ${mimeType}. Please upload a PDF, DOCX, or TXT file.`
  );
}

module.exports = extractText;
