-- =====================================================
-- PHASE 6: Advanced Study Features Migration
-- =====================================================
-- Features: Export to PDF, Multi-doc Cross-refs, 
--           Study Analytics, Smart Flashcards
-- =====================================================

-- =====================================================
-- 1. STUDY SESSIONS TABLE (Analytics Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session Details
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Activity Metrics
    questions_asked INTEGER DEFAULT 0,
    documents_referenced TEXT[], -- Array of document IDs/names
    topics_covered TEXT[], -- AI-extracted topics
    
    -- Engagement Metrics
    avg_response_time_seconds DECIMAL(10,2),
    total_tokens_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_start ON study_sessions(session_start DESC);
CREATE INDEX idx_study_sessions_topics ON study_sessions USING GIN(topics_covered);

-- =====================================================
-- 2. CONVERSATION EXPORTS TABLE (PDF Export History)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Export Details
    export_type VARCHAR(20) DEFAULT 'pdf' CHECK (export_type IN ('pdf', 'markdown', 'json')),
    chat_ids UUID[], -- Array of chat IDs included in export
    
    -- File Details
    file_url TEXT, -- Supabase storage URL if stored
    file_size_kb INTEGER,
    filename VARCHAR(255) NOT NULL,
    
    -- Export Metadata
    total_messages INTEGER DEFAULT 0,
    date_range_start TIMESTAMPTZ,
    date_range_end TIMESTAMPTZ,
    
    -- Timestamps
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exports_user_id ON conversation_exports(user_id);
CREATE INDEX idx_exports_date ON conversation_exports(exported_at DESC);

-- =====================================================
-- 3. FLASHCARDS TABLE (AI-Generated Study Cards)
-- =====================================================
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Flashcard Content
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_chat_id UUID, -- Reference to original chat if generated from conversation
    
    -- Organization
    topic VARCHAR(255),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    tags TEXT[], -- User-defined tags for categorization
    
    -- Spaced Repetition Metrics
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 algorithm
    interval_days INTEGER DEFAULT 1,
    
    -- Status
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_topic ON flashcards(topic);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review_at) WHERE NOT is_archived;
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);

-- =====================================================
-- 4. DOCUMENT REFERENCES TABLE (Cross-Document Links)
-- =====================================================
CREATE TABLE IF NOT EXISTS document_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Source and Target Documents
    source_doc_id VARCHAR(255) NOT NULL, -- From Pinecone metadata
    target_doc_id VARCHAR(255) NOT NULL, -- Related document
    
    -- Reference Details
    reference_type VARCHAR(50) DEFAULT 'related' 
        CHECK (reference_type IN ('related', 'citation', 'contradiction', 'expansion', 'summary')),
    
    -- Context
    source_context TEXT, -- Text snippet from source
    target_context TEXT, -- Text snippet from target
    similarity_score DECIMAL(5,4), -- 0-1 similarity score
    
    -- AI-generated explanation
    relationship_description TEXT,
    
    -- Metadata
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_doc_refs_user_id ON document_references(user_id);
CREATE INDEX idx_doc_refs_source ON document_references(source_doc_id);
CREATE INDEX idx_doc_refs_target ON document_references(target_doc_id);
CREATE INDEX idx_doc_refs_similarity ON document_references(similarity_score DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_references ENABLE ROW LEVEL SECURITY;

-- Study Sessions Policies
CREATE POLICY "Users can view their own study sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Conversation Exports Policies
CREATE POLICY "Users can view their own exports"
    ON conversation_exports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports"
    ON conversation_exports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports"
    ON conversation_exports FOR DELETE
    USING (auth.uid() = user_id);

-- Flashcards Policies
CREATE POLICY "Users can view their own flashcards"
    ON flashcards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards"
    ON flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
    ON flashcards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
    ON flashcards FOR DELETE
    USING (auth.uid() = user_id);

-- Document References Policies
CREATE POLICY "Users can view their own document references"
    ON document_references FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document references"
    ON document_references FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document references"
    ON document_references FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Study Sessions
CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Flashcards
CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to calculate study streak
CREATE OR REPLACE FUNCTION get_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
BEGIN
    -- Count consecutive days with sessions
    WHILE EXISTS (
        SELECT 1 FROM study_sessions
        WHERE user_id = p_user_id
        AND DATE(session_start) = check_date
    ) LOOP
        streak := streak + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get top topics
CREATE OR REPLACE FUNCTION get_top_topics(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(topic TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT UNNEST(topics_covered) as topic, COUNT(*) as count
    FROM study_sessions
    WHERE user_id = p_user_id
    GROUP BY topic
    ORDER BY count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON study_sessions TO authenticated;
GRANT ALL ON conversation_exports TO authenticated;
GRANT ALL ON flashcards TO authenticated;
GRANT ALL ON document_references TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- Then configure the backend services and API routes
-- =====================================================
