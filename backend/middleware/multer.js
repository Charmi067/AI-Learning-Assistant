// middleware/multer.js
// ─────────────────────────────────────────────────────────────
// Multer configured with memoryStorage so uploaded files are
// available as req.file.buffer (no disk I/O needed).
// Limit: 10MB per file.
// ─────────────────────────────────────────────────────────────
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

module.exports = upload;
