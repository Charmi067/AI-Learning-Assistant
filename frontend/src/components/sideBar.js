// src/components/sideBar.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken, getUser } from "../utils/auth";
import "./css/sideBar.css";

const SideBar = ({ displayChat, setConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(null);
  const [loading, setLoading]             = useState(true);

  const token = getToken();
  const user  = getUser();

  // Fetch all conversations on mount
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/AiDashboard/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(response.data.conversations || []);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Load messages for a selected conversation
  const ConvHandler = async (convId) => {
    setActiveId(convId);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/AiDashboard/${user.id}/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      displayChat(response.data.conversationMessages || []);
      setConversationId(convId);
    } catch (err) {
      console.error("Error loading conversation:", err);
    }
  };

  return (
    <div className="sidebar">

      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Conversations</span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="sidebar-skeleton">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-item" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="sidebar-empty">
          <div className="sidebar-empty-icon">💬</div>
          <p className="sidebar-empty-text">
            No conversations yet.
            <br />Start a new chat!
          </p>
        </div>
      ) : (
        <ul className="sidebar-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`chat-title${activeId === conv.id ? " active" : ""}`}
              onClick={() => ConvHandler(conv.id)}
            >
              {/* Chat bubble icon */}
              <svg
                className="chat-title-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>

              <span className="chat-title-text">
                {conv.title || "Untitled Chat"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer hint */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          {conversations.length > 0
            ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
            : "Chat history appears here"}
        </p>
      </div>

    </div>
  );
};

export default SideBar;