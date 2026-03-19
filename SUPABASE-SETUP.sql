-- Hoyt GPT Supabase Schema Setup
-- Run this in Supabase SQL Editor to create all required tables
-- Project: zpvmkkuadsgfzutsmhfk
-- Database: postgres

-- ============================================================================
-- CONVERSATIONS TABLE
-- Stores all message history (user + assistant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  bot_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  message_role VARCHAR(20) NOT NULL CHECK (message_role IN ('user', 'assistant')),
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_bot ON conversations(user_id, bot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);

COMMENT ON TABLE conversations IS 'Stores all chat messages between users and bots';
COMMENT ON COLUMN conversations.user_id IS 'User identifier (levi, john, jonny, lisa, paul, etc.)';
COMMENT ON COLUMN conversations.bot_id IS 'Bot identifier (wraybot, spike, mack, jane, gage, etc.)';
COMMENT ON COLUMN conversations.session_id IS 'Session identifier for grouping conversations';
COMMENT ON COLUMN conversations.message_role IS 'Either "user" or "assistant"';

-- ============================================================================
-- USER_CONTEXT TABLE
-- Stores user preferences, uploaded files, and email summaries
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) UNIQUE NOT NULL,
  bot_id VARCHAR(50),
  emails_summary TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_context_user ON user_context(user_id);

COMMENT ON TABLE user_context IS 'Stores user preferences and context (emails, files, settings)';
COMMENT ON COLUMN user_context.emails_summary IS 'JSON summary of recent emails from OpenClaw bridge';
COMMENT ON COLUMN user_context.uploaded_files IS 'JSON array of uploaded files: {name, url, type, summary}';
COMMENT ON COLUMN user_context.preferences IS 'User communication preferences and settings';

-- ============================================================================
-- REPAIRS_IDENTIFIED TABLE
-- Stores results from Claude Vision photo analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS repairs_identified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  upload_id VARCHAR(100),
  photo_url TEXT,
  items JSONB,
  analysis_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repairs_user ON repairs_identified(user_id);
CREATE INDEX IF NOT EXISTS idx_repairs_upload ON repairs_identified(upload_id);

COMMENT ON TABLE repairs_identified IS 'Stores photo analysis results from Claude Vision API';
COMMENT ON COLUMN repairs_identified.items IS 'JSON array of identified repairs: {type, severity, location, materials, recommendations}';
COMMENT ON COLUMN repairs_identified.analysis_text IS 'Full text analysis from Claude Vision';

-- ============================================================================
-- BIO_SYNC TABLE (optional - for future OpenClaw bridge)
-- Stores synced data from OpenClaw bots
-- ============================================================================

CREATE TABLE IF NOT EXISTS bio_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name VARCHAR(50),
  user_id VARCHAR(50),
  data_type VARCHAR(50), -- 'email', 'file', 'event', 'task'
  data_payload JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bio_sync_bot ON bio_sync(bot_name);
CREATE INDEX IF NOT EXISTS idx_bio_sync_user ON bio_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_sync_type ON bio_sync(data_type);

COMMENT ON TABLE bio_sync IS 'Synced data from OpenClaw bots (emails, files, events)';
COMMENT ON COLUMN bio_sync.bot_name IS 'Source bot (spike, wraybot, mack, jane, gage)';
COMMENT ON COLUMN bio_sync.data_type IS 'Type of data (email, file, event, task, contact)';

-- ============================================================================
-- AUDIT_LOG TABLE (optional - for debugging and compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100),
  user_id VARCHAR(50),
  bot_id VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(200),
  status VARCHAR(20), -- 'success', 'error', 'warning'
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);

COMMENT ON TABLE audit_log IS 'Audit trail of all actions in the system';
COMMENT ON COLUMN audit_log.action IS 'Action performed (message_sent, file_uploaded, webhook_called)';
COMMENT ON COLUMN audit_log.status IS 'Result of action (success, error, warning)';

-- ============================================================================
-- SEED DATA (optional - sample user contexts)
-- ============================================================================

-- Spike (John - Service Manager)
INSERT INTO user_context (user_id, bot_id, preferences)
VALUES ('john', 'spike', '{"timezone": "America/Chicago", "contact": "+16123232406"}')
ON CONFLICT (user_id) DO NOTHING;

-- Wraybot (Levi - Owner)
INSERT INTO user_context (user_id, bot_id, preferences)
VALUES ('levi', 'wraybot', '{"timezone": "America/Chicago", "notifications": "all"}')
ON CONFLICT (user_id) DO NOTHING;

-- Mack (Jonny - Project Manager)
INSERT INTO user_context (user_id, bot_id, preferences)
VALUES ('jonny', 'mack', '{"timezone": "America/Chicago"}')
ON CONFLICT (user_id) DO NOTHING;

-- Jane (Lisa - Office Manager)
INSERT INTO user_context (user_id, bot_id, preferences)
VALUES ('lisa', 'jane', '{"timezone": "America/Chicago"}')
ON CONFLICT (user_id) DO NOTHING;

-- Gage (Paul - Patriarch)
INSERT INTO user_context (user_id, bot_id, preferences)
VALUES ('paul', 'gage', '{"timezone": "America/Chicago"}')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (optional - for per-user data isolation)
-- ============================================================================

-- Uncomment if you want RLS enabled:
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE repairs_identified ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can only see their own conversations"
--   ON conversations FOR SELECT
--   USING (auth.uid()::text = user_id);
--
-- CREATE POLICY "Users can only see their own context"
--   ON user_context FOR SELECT
--   USING (auth.uid()::text = user_id);

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Check table creation:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('conversations', 'user_context', 'repairs_identified', 'bio_sync', 'audit_log');

-- Check indexes:
-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('conversations', 'user_context', 'repairs_identified', 'bio_sync', 'audit_log');

-- ============================================================================
-- CLEANUP (if needed - DO NOT RUN unless resetting)
-- ============================================================================

-- DROP TABLE IF EXISTS conversations CASCADE;
-- DROP TABLE IF EXISTS user_context CASCADE;
-- DROP TABLE IF EXISTS repairs_identified CASCADE;
-- DROP TABLE IF EXISTS bio_sync CASCADE;
-- DROP TABLE IF EXISTS audit_log CASCADE;

-- ============================================================================
-- GRANTS (if using separate db user)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON conversations TO hoyt_app_user;
-- GRANT SELECT, INSERT, UPDATE ON user_context TO hoyt_app_user;
-- GRANT SELECT, INSERT, UPDATE ON repairs_identified TO hoyt_app_user;
-- GRANT SELECT, INSERT ON bio_sync TO hoyt_app_user;
-- GRANT SELECT, INSERT ON audit_log TO hoyt_app_user;

-- ============================================================================
-- END OF SCHEMA SETUP
-- ============================================================================
--
-- Created for: Hoyt GPT
-- Version: 1.0
-- Date: 2026-03-19
--
-- Next Steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables were created
-- 3. Set environment variables in n8n
-- 4. Deploy n8n workflows
-- 5. Test via Hoyt GPT frontend
