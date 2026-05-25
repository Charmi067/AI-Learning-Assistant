// src/components/AiDashboard.js
import "./css/AiDashboard.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sideBar";
import { getToken, getUser, clearSession } from "../utils/auth";

const AiDashboard = () => {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const [conversationId, setConversationId] = useState(null);
  const [lastFileId, setLastFileId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  // ── Upload document ────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLastFileId(response.data.fileId);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `📎 "${file.name}" uploaded — ${response.data.totalChunks} chunks indexed. Now in RAG mode.`,
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ ${msg}` },
      ]);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ── Ask a question ─────────────────────────────────────────
  const SubmitHandler = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setIsAsking(true);

    setMessages((prev) => [...prev, { role: "user", content: currentPrompt }]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/AiDashboard/ask`,
        {
          que: currentPrompt,
          fileId: lastFileId,
          conversationId: conversationId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      if (data.conversationId) setConversationId(data.conversationId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ ${msg}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // ── Start new chat ─────────────────────────────────────────
  const startNewChat = () => {
    setConversationId(null);
    setLastFileId(null);
    setMessages([]);
    setPrompt("");
  };

  // ── Load existing conversation from sidebar ────────────────
  const displayChat = (msgs) => {
    setMessages(
      msgs.map((m) => ({ role: m.role, content: m.content }))
    );
  };

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <Sidebar displayChat={displayChat} setConversationId={setConversationId} />
      </aside>

      {/* Main panel */}
      <div className="dashboard-main">

        {/* Top bar */}
        <header className="dashboard-header">
          <div className="header-brand">
            <span className="brand-dot" />
            <span className="brand-name">AI chatboat</span>
            {lastFileId && (
              <span className="rag-badge">RAG</span>
            )}
          </div>
          <div className="header-actions">
            <button className="btn-new-chat" onClick={startNewChat}>
              + New Chats
            </button>
            <div className="user-chip">
              <span className="user-avatar">{initials}</span>
              <span className="user-label">{user?.name || user?.email}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Chat area */}
        <main className="chat-area">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="empty-icon">✦</div>
              <p className="empty-title">How can I help you today?</p>
              <p className="empty-sub">
                Ask anything, or upload a document to enable RAG mode.
              </p>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message message--${msg.role}`}>
                  {msg.role !== "system" && (
                    <span className="message-label">
                      {msg.role === "user" ? "You" : "AI"}
                    </span>
                  )}
                  <div
                    className="message-bubble"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                </div>
              ))}
              {isAsking && (
                <div className="message message--assistant">
                  <span className="message-label">AI</span>
                  <div className="message-bubble">
                    <span className="typing-dots">
                      <span /><span /><span />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom bar */}
        <footer className="chat-footer">
          {/* File upload row */}
          <div className="upload-row">
            <label className="upload-label" htmlFor="fileInput">
              <span className="upload-icon">📎</span>
              {isUploading
                ? "Uploading…"
                : lastFileId
                ? "Document loaded"
                : "Upload PDF / DOCX / TXT"}
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              disabled={isUploading}
              className="upload-input"
            />
            {lastFileId && !isUploading && (
              <button
                className="btn-clear-doc"
                onClick={() => setLastFileId(null)}
                title="Remove document"
              >
                ✕
              </button>
            )}
          </div>

          {/* Input row */}
          <form className="input-row" onSubmit={SubmitHandler}>
            <textarea
              className="chat-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Message…"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  SubmitHandler(e);
                }
              }}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={isUploading || isAsking || !prompt.trim()}
            >
              {isAsking ? (
                <span className="send-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default AiDashboard;