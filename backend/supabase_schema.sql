-- ═══════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA
-- AI Learning Assistant — Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- NOTE: Supabase creates an "auth.users" table automatically.
-- Your tables below reference it with ON DELETE CASCADE,
-- so when a user is deleted, their data is deleted too.
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────
-- TABLE: documents
-- Stores metadata about each uploaded document.
-- The actual text+vectors live in Qdrant.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_id     TEXT UNIQUE NOT NULL,   -- UUID used as Qdrant filter key
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index to quickly fetch all documents for a user
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);


-- ─────────────────────────────────────────────
-- TABLE: conversations
-- Each row is one chat session.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index to quickly list conversations for a user
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);


-- ─────────────────────────────────────────────
-- TABLE: messages
-- Each row is one message (user or assistant) in a conversation.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  used_chunks     JSONB DEFAULT '[]',   -- stores the text chunks used for RAG answers
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index to quickly load messages for a conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Prevents users from accessing other users' data.
-- The backend uses the SERVICE ROLE key (bypasses RLS),
-- but enable RLS anyway as a safety layer.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Documents: users can only see their own
CREATE POLICY "Users see own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);

-- Conversations: users can only see their own
CREATE POLICY "Users see own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);

-- Messages: users can see messages in their own conversations
CREATE POLICY "Users see own messages"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
