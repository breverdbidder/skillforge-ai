-- SkillForge AI: Competitive Intelligence Tables
-- Run this migration in Supabase SQL Editor

-- CI Analysis Results
CREATE TABLE IF NOT EXISTS ci_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  ui_patterns JSONB DEFAULT '[]'::jsonb,
  pricing_signals JSONB DEFAULT '[]'::jsonb,
  marketing_claims JSONB DEFAULT '[]'::jsonb,
  technical_stack JSONB DEFAULT '[]'::jsonb,
  raw_analysis TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ci_analyses_competitor 
  ON ci_analyses(competitor_id);
CREATE INDEX IF NOT EXISTS idx_ci_analyses_analyzed_at 
  ON ci_analyses(analyzed_at DESC);

-- Feature Parity Matrices (generated from analyses)
CREATE TABLE IF NOT EXISTS ci_feature_matrices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitors JSONB NOT NULL,
  features JSONB NOT NULL,
  biddeed_gaps JSONB DEFAULT '[]'::jsonb,
  biddeed_advantages JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ci_feature_matrices_generated 
  ON ci_feature_matrices(generated_at DESC);

-- Competitor Video Sources (can be managed via API)
CREATE TABLE IF NOT EXISTS ci_video_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id TEXT NOT NULL,
  video_url TEXT NOT NULL UNIQUE,
  video_type TEXT CHECK (video_type IN ('demo', 'tutorial', 'marketing', 'webinar', 'youtube')),
  title TEXT,
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  last_analyzed TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ci_video_sources_competitor 
  ON ci_video_sources(competitor_id);
CREATE INDEX IF NOT EXISTS idx_ci_video_sources_active 
  ON ci_video_sources(is_active) WHERE is_active = true;

-- Clone Blueprints (generated implementation plans)
CREATE TABLE IF NOT EXISTS ci_clone_blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  features_critical JSONB DEFAULT '[]'::jsonb,
  features_high JSONB DEFAULT '[]'::jsonb,
  features_medium JSONB DEFAULT '[]'::jsonb,
  features_low JSONB DEFAULT '[]'::jsonb,
  ui_patterns JSONB DEFAULT '[]'::jsonb,
  implementation_order JSONB DEFAULT '[]'::jsonb,
  estimated_days INTEGER,
  estimated_weeks INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ci_clone_blueprints_competitor 
  ON ci_clone_blueprints(competitor_id);

-- Analysis Jobs (track workflow runs)
CREATE TABLE IF NOT EXISTS ci_analysis_jobs (
  id TEXT PRIMARY KEY,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  competitors JSONB,
  videos_analyzed INTEGER DEFAULT 0,
  features_extracted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE ci_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_feature_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_video_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_clone_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role full access to ci_analyses" 
  ON ci_analyses FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ci_feature_matrices" 
  ON ci_feature_matrices FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ci_video_sources" 
  ON ci_video_sources FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ci_clone_blueprints" 
  ON ci_clone_blueprints FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to ci_analysis_jobs" 
  ON ci_analysis_jobs FOR ALL 
  USING (true) WITH CHECK (true);

-- Insert initial video sources for competitors
INSERT INTO ci_video_sources (competitor_id, video_url, video_type, title, priority) VALUES
  ('propertyonion', 'https://www.youtube.com/watch?v=PropertyOnionDemo', 'demo', 'PropertyOnion Platform Demo', 1),
  ('auction-com', 'https://www.youtube.com/watch?v=AuctionComBidding', 'tutorial', 'How to Bid on Auction.com', 1),
  ('propstream', 'https://www.youtube.com/watch?v=PropStreamDemo', 'demo', 'PropStream Platform Tour', 1)
ON CONFLICT (video_url) DO NOTHING;

-- View for latest analysis per competitor
CREATE OR REPLACE VIEW ci_latest_analyses AS
SELECT DISTINCT ON (competitor_id)
  id,
  competitor_id,
  competitor_name,
  video_url,
  features,
  ui_patterns,
  pricing_signals,
  analyzed_at
FROM ci_analyses
ORDER BY competitor_id, analyzed_at DESC;

-- Function to get feature gaps trend
CREATE OR REPLACE FUNCTION get_feature_gaps_trend(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  gap_count INTEGER,
  gaps JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(generated_at) as date,
    jsonb_array_length(biddeed_gaps) as gap_count,
    biddeed_gaps as gaps
  FROM ci_feature_matrices
  WHERE generated_at > NOW() - (days_back || ' days')::INTERVAL
  ORDER BY generated_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ci_analyses IS 'Stores raw video analysis results from Kimi K2.5';
COMMENT ON TABLE ci_feature_matrices IS 'Generated feature parity matrices comparing BidDeed.AI to competitors';
COMMENT ON TABLE ci_video_sources IS 'Video URLs to analyze for each competitor';
COMMENT ON TABLE ci_clone_blueprints IS 'Implementation blueprints for cloning competitor features';
COMMENT ON TABLE ci_analysis_jobs IS 'Tracks CI analysis workflow job status';
