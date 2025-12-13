const express = require("express");
require("./firebaseAdmin.cjs");            // Convert firebaseAdmin.js → firebaseAdmin.cjs
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const path = require("path");
const askRoute=require("./routes/ask.cjs")
const app = express();
const conversation =require("./routes/conversation.cjs")
const conversations=require("./routes/conversations.cjs")
// Static frontend

app.use(express.static(path.join(__dirname, "frontend")));

app.use(cors());
app.use(express.json());

// Middleware + Routes (CJS)
const { verifyToken } = require("./middleware/verifyToken.cjs");   // convert file to CJS
const uploadRoute = require("./routes/upload.cjs");                // your converted route

// Protected Upload Route
app.use("/upload",verifyToken, uploadRoute);
app.use("/",verifyToken,askRoute)
app.use("/",conversation);
app.use("/",conversations);
app.get("/", (req, res) => {
    res.send("AI Learning Assistant Backend is Live 🚀");
  });
// Start Server
const Port = process.env.PORT || 3000;
app.listen(Port, () => console.log(`🔥 Server running on ${Port}`));
