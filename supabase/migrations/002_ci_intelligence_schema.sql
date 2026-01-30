-- ============================================================
-- SkillForge AI - CI Intelligence Database Schema
-- Comprehensive schema for 5-phase competitive intelligence
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PHASE 1: DISCOVERY TABLES
-- ============================================================

-- Competitors table (core entity)
CREATE TABLE IF NOT EXISTS ci_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    website TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'foreclosure',
    subcategory TEXT,
    description TEXT,
    logo_url TEXT,
    
    -- Company info
    founded TEXT,
    headquarters TEXT,
    employee_count TEXT,
    funding_stage TEXT,
    total_funding TEXT,
    
    -- Market positioning
    target_market TEXT[] DEFAULT '{}',
    value_proposition TEXT,
    pricing_model TEXT,
    pricing_tiers JSONB,
    
    -- Social links
    social_links JSONB DEFAULT '{}',
    
    -- Assessment
    threat_level TEXT DEFAULT 'medium' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    market_share DECIMAL,
    growth_rate TEXT,
    
    -- Metadata
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    discovered_via TEXT DEFAULT 'manual',
    is_active BOOLEAN DEFAULT true
);

-- Discovery insights
CREATE TABLE IF NOT EXISTS ci_discovery_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('market_gap', 'emerging_threat', 'opportunity', 'trend')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
    related_competitors TEXT[] DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHASE 2: COLLECTION TABLES
-- ============================================================

-- Collected competitor data
CREATE TABLE IF NOT EXISTS ci_collected_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    competitor_name TEXT NOT NULL,
    
    -- Website data
    website_data JSONB,
    
    -- Pricing data
    pricing_data JSONB,
    
    -- Feature data
    feature_data JSONB,
    
    -- Media data
    media_data JSONB,
    
    -- Social data
    social_data JSONB,
    
    -- Quality metrics
    data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    sources TEXT[] DEFAULT '{}',
    
    -- Metadata
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Traffic analysis (SimilarWeb data)
CREATE TABLE IF NOT EXISTS ci_traffic_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL UNIQUE,
    
    -- Traffic metrics
    total_visits BIGINT,
    monthly_growth DECIMAL,
    avg_visit_duration DECIMAL,
    pages_per_visit DECIMAL,
    bounce_rate DECIMAL,
    
    -- Traffic sources
    traffic_sources JSONB,
    
    -- Geographic data
    top_countries JSONB,
    
    -- Keywords
    organic_keywords JSONB,
    paid_keywords JSONB,
    
    -- Data quality
    data_quality TEXT DEFAULT 'estimated' CHECK (data_quality IN ('estimated', 'verified')),
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video analyses
CREATE TABLE IF NOT EXISTS ci_video_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    url TEXT NOT NULL,
    platform TEXT,
    title TEXT,
    duration_seconds INTEGER,
    
    -- Analysis results
    transcript TEXT,
    features_mentioned TEXT[] DEFAULT '{}',
    key_moments JSONB,
    analysis_summary TEXT,
    
    -- Metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screenshot analyses  
CREATE TABLE IF NOT EXISTS ci_screenshot_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    url TEXT NOT NULL,
    page_type TEXT,
    screenshot_path TEXT,
    
    -- Analysis results
    ui_patterns JSONB,
    features_identified TEXT[] DEFAULT '{}',
    design_notes TEXT,
    
    -- Metadata
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webpage analyses
CREATE TABLE IF NOT EXISTS ci_webpage_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    url TEXT NOT NULL,
    title TEXT,
    
    -- Content analysis
    content_summary TEXT,
    features_mentioned TEXT[] DEFAULT '{}',
    pricing_found BOOLEAN DEFAULT false,
    tech_stack TEXT[] DEFAULT '{}',
    
    -- Metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHASE 3: ANALYSIS TABLES
-- ============================================================

-- Analysis results
CREATE TABLE IF NOT EXISTS ci_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    competitor_name TEXT NOT NULL,
    
    -- SWOT analysis
    swot JSONB,
    
    -- Positioning analysis
    positioning JSONB,
    
    -- Feature analysis
    feature_score INTEGER,
    feature_gaps TEXT[] DEFAULT '{}',
    feature_advantages TEXT[] DEFAULT '{}',
    
    -- Pricing analysis
    pricing_position TEXT,
    price_performance_ratio DECIMAL,
    
    -- UX analysis
    ux_score INTEGER,
    ux_strengths TEXT[] DEFAULT '{}',
    ux_weaknesses TEXT[] DEFAULT '{}',
    
    -- Overall scores
    overall_score INTEGER,
    competitive_index INTEGER,
    
    -- Metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature matrix
CREATE TABLE IF NOT EXISTS ci_feature_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name TEXT NOT NULL UNIQUE,
    feature_category TEXT NOT NULL,
    
    -- BidDeed.AI status
    biddeed_status TEXT DEFAULT 'not_started' 
        CHECK (biddeed_status IN ('not_started', 'in_progress', 'completed', 'planned')),
    biddeed_maturity TEXT DEFAULT 'none'
        CHECK (biddeed_maturity IN ('none', 'basic', 'intermediate', 'advanced')),
    
    -- Competitor data
    competitor_data JSONB DEFAULT '{}',
    
    -- Priority and planning
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    complexity INTEGER DEFAULT 3 CHECK (complexity >= 1 AND complexity <= 5),
    estimated_days INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHASE 4: SYNTHESIS TABLES
-- ============================================================

-- Synthesis results
CREATE TABLE IF NOT EXISTS ci_synthesis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Strategic outputs
    competitive_positioning JSONB,
    strategic_recommendations JSONB,
    win_loss_factors JSONB,
    battle_readiness JSONB,
    
    -- Roadmap inputs
    feature_prioritization JSONB,
    quick_wins JSONB,
    long_term_plays JSONB,
    
    -- Sales enablement
    sales_battle_cards JSONB,
    objections_library JSONB,
    competitor_talking_points JSONB,
    
    -- Metadata
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Battle cards
CREATE TABLE IF NOT EXISTS ci_battle_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES ci_competitors(id),
    competitor_name TEXT NOT NULL,
    
    -- Card content
    overview TEXT,
    when_we_win JSONB,
    when_we_lose JSONB,
    key_differentiators JSONB,
    objections JSONB,
    landmines JSONB,
    discovery_questions JSONB,
    closing_strategies JSONB,
    quick_reference JSONB,
    
    -- Full card data
    card_data JSONB,
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Clone blueprints
CREATE TABLE IF NOT EXISTS ci_clone_blueprints (
    id TEXT PRIMARY KEY,
    competitor_id UUID REFERENCES ci_competitors(id),
    competitor_name TEXT NOT NULL,
    
    -- Blueprint summary
    feature_count INTEGER,
    total_effort_days INTEGER,
    priority_score INTEGER,
    
    -- Full blueprint
    blueprint_data JSONB,
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHASE 5: ACTION TABLES
-- ============================================================

-- Action results
CREATE TABLE IF NOT EXISTS ci_action_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Full report
    full_report JSONB,
    
    -- Clone blueprints summary
    clone_blueprints JSONB,
    
    -- Battle card docs summary
    battle_card_docs JSONB,
    
    -- Action plan
    action_plan JSONB,
    
    -- Executive summary
    executive_summary JSONB,
    
    -- Exported files
    exported_files JSONB,
    
    -- Metadata
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Full CI reports
CREATE TABLE IF NOT EXISTS ci_full_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    
    -- Report sections
    executive_summary JSONB,
    market_overview JSONB,
    competitor_profiles JSONB,
    feature_analysis JSONB,
    pricing_intelligence JSONB,
    traffic_analysis JSONB,
    swot_matrix JSONB,
    competitive_positioning JSONB,
    strategic_recommendations JSONB,
    implementation_roadmap JSONB,
    
    -- Full report data
    report_data JSONB,
    
    -- Metadata
    competitor_count INTEGER,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PIPELINE TRACKING TABLES
-- ============================================================

-- Pipeline runs
CREATE TABLE IF NOT EXISTS ci_pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Phase results
    phases JSONB,
    
    -- Summary
    competitors_analyzed INTEGER,
    total_duration_ms BIGINT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
    
    -- Error tracking
    errors JSONB,
    
    -- Metadata
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS ci_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ci_competitors_category ON ci_competitors(category);
CREATE INDEX IF NOT EXISTS idx_ci_competitors_threat_level ON ci_competitors(threat_level);
CREATE INDEX IF NOT EXISTS idx_ci_collected_data_competitor ON ci_collected_data(competitor_id);
CREATE INDEX IF NOT EXISTS idx_ci_traffic_analysis_domain ON ci_traffic_analysis(domain);
CREATE INDEX IF NOT EXISTS idx_ci_analysis_results_competitor ON ci_analysis_results(competitor_id);
CREATE INDEX IF NOT EXISTS idx_ci_feature_matrix_category ON ci_feature_matrix(feature_category);
CREATE INDEX IF NOT EXISTS idx_ci_feature_matrix_priority ON ci_feature_matrix(priority);
CREATE INDEX IF NOT EXISTS idx_ci_battle_cards_competitor ON ci_battle_cards(competitor_id);
CREATE INDEX IF NOT EXISTS idx_ci_pipeline_runs_timestamp ON ci_pipeline_runs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ci_activity_log_timestamp ON ci_activity_log(timestamp);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE ci_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_discovery_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_collected_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_traffic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_screenshot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_webpage_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_feature_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_synthesis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_battle_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_clone_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_action_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_full_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_activity_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY "Service role full access on ci_competitors" ON ci_competitors
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_discovery_insights" ON ci_discovery_insights
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_collected_data" ON ci_collected_data
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_traffic_analysis" ON ci_traffic_analysis
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_video_analyses" ON ci_video_analyses
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_screenshot_analyses" ON ci_screenshot_analyses
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_webpage_analyses" ON ci_webpage_analyses
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_analysis_results" ON ci_analysis_results
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_feature_matrix" ON ci_feature_matrix
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_synthesis_results" ON ci_synthesis_results
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_battle_cards" ON ci_battle_cards
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_clone_blueprints" ON ci_clone_blueprints
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_action_results" ON ci_action_results
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_full_reports" ON ci_full_reports
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_pipeline_runs" ON ci_pipeline_runs
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ci_activity_log" ON ci_activity_log
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA: FORECLOSURE COMPETITORS
-- ============================================================

INSERT INTO ci_competitors (name, website, category, description, target_market, threat_level, pricing_model, pricing_tiers)
VALUES 
    ('PropertyOnion', 'https://propertyonion.com', 'foreclosure', 
     'Foreclosure data aggregator with 8 KPIs and auction tracking',
     ARRAY['Real estate investors', 'House flippers', 'Wholesalers'],
     'high', 'subscription',
     '{"tiers": [{"name": "Basic", "price": 49}, {"name": "Pro", "price": 99}, {"name": "Enterprise", "price": 199}]}'::jsonb),
     
    ('Auction.com', 'https://auction.com', 'foreclosure',
     'Largest online real estate auction marketplace',
     ARRAY['Institutional investors', 'Individual buyers', 'Banks'],
     'critical', 'usage-based',
     '{"tiers": [{"name": "Buyer", "price": 0, "note": "5% buyer premium"}]}'::jsonb),
     
    ('RealtyTrac', 'https://realtytrac.com', 'foreclosure',
     'Foreclosure listings and market analytics platform',
     ARRAY['Investors', 'Agents', 'Researchers'],
     'high', 'subscription',
     '{"tiers": [{"name": "Basic", "price": 29}, {"name": "Premium", "price": 99}, {"name": "Professional", "price": 299}]}'::jsonb),
     
    ('Foreclosure.com', 'https://foreclosure.com', 'foreclosure',
     'Foreclosure listings marketplace',
     ARRAY['Home buyers', 'Investors'],
     'medium', 'subscription',
     '{"tiers": [{"name": "Standard", "price": 39}, {"name": "Premium", "price": 79}]}'::jsonb),
     
    ('Hubzu', 'https://hubzu.com', 'foreclosure',
     'Online real estate auction platform by Altisource',
     ARRAY['Investors', 'Home buyers'],
     'medium', 'usage-based',
     '{"tiers": [{"name": "Buyer", "price": 0, "note": "Buyer premium varies"}]}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================
-- SEED DATA: BIDDEED.AI FEATURES
-- ============================================================

INSERT INTO ci_feature_matrix (feature_name, feature_category, biddeed_status, biddeed_maturity, priority, complexity)
VALUES
    ('Auction Calendar', 'core', 'completed', 'advanced', 'critical', 2),
    ('Property Details', 'core', 'completed', 'advanced', 'critical', 2),
    ('Photo Gallery', 'core', 'completed', 'advanced', 'high', 2),
    ('ML Third-Party Probability', 'analytics', 'completed', 'advanced', 'critical', 5),
    ('Lien Discovery Agent', 'analytics', 'completed', 'advanced', 'critical', 4),
    ('Max Bid Calculator', 'analytics', 'completed', 'advanced', 'high', 3),
    ('Tax Certificate Search', 'analytics', 'completed', 'intermediate', 'high', 3),
    ('Demographic Analysis', 'analytics', 'completed', 'intermediate', 'medium', 3),
    ('One-Page Reports', 'reporting', 'completed', 'advanced', 'high', 3),
    ('Decision Logging', 'reporting', 'completed', 'intermediate', 'medium', 2),
    ('Multi-County Support', 'platform', 'in_progress', 'basic', 'high', 4),
    ('Email Alerts', 'notifications', 'planned', 'none', 'critical', 3),
    ('Mobile App', 'platform', 'planned', 'none', 'medium', 5),
    ('API Access', 'platform', 'planned', 'none', 'medium', 4)
ON CONFLICT (feature_name) DO UPDATE SET
    biddeed_status = EXCLUDED.biddeed_status,
    biddeed_maturity = EXCLUDED.biddeed_maturity,
    updated_at = NOW();

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ci_competitors_updated_at
    BEFORE UPDATE ON ci_competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ci_feature_matrix_updated_at
    BEFORE UPDATE ON ci_feature_matrix
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Activity logging trigger
CREATE OR REPLACE FUNCTION log_ci_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ci_activity_log (action, entity_type, entity_id, details)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'new_data', to_jsonb(NEW),
            'old_data', to_jsonb(OLD)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable activity logging on key tables
CREATE TRIGGER log_ci_competitors_activity
    AFTER INSERT OR UPDATE OR DELETE ON ci_competitors
    FOR EACH ROW EXECUTE FUNCTION log_ci_activity();

CREATE TRIGGER log_ci_battle_cards_activity
    AFTER INSERT OR UPDATE OR DELETE ON ci_battle_cards
    FOR EACH ROW EXECUTE FUNCTION log_ci_activity();

CREATE TRIGGER log_ci_pipeline_runs_activity
    AFTER INSERT ON ci_pipeline_runs
    FOR EACH ROW EXECUTE FUNCTION log_ci_activity();

-- ============================================================
-- VIEWS
-- ============================================================

-- Competitor summary view
CREATE OR REPLACE VIEW v_competitor_summary AS
SELECT 
    c.id,
    c.name,
    c.website,
    c.threat_level,
    c.pricing_model,
    t.total_visits,
    t.monthly_growth,
    a.overall_score,
    a.competitive_index,
    (SELECT COUNT(*) FROM ci_battle_cards bc WHERE bc.competitor_id = c.id) as battle_cards_count,
    (SELECT COUNT(*) FROM ci_clone_blueprints cb WHERE cb.competitor_id = c.id) as blueprints_count
FROM ci_competitors c
LEFT JOIN ci_traffic_analysis t ON t.domain = REPLACE(REPLACE(c.website, 'https://', ''), 'http://', '')
LEFT JOIN ci_analysis_results a ON a.competitor_id = c.id
WHERE c.is_active = true
ORDER BY c.threat_level DESC, t.total_visits DESC NULLS LAST;

-- Feature gap view
CREATE OR REPLACE VIEW v_feature_gaps AS
SELECT 
    feature_name,
    feature_category,
    biddeed_status,
    priority,
    complexity,
    estimated_days,
    CASE 
        WHEN biddeed_status = 'not_started' AND priority = 'critical' THEN 1
        WHEN biddeed_status = 'not_started' AND priority = 'high' THEN 2
        WHEN biddeed_status = 'planned' AND priority = 'critical' THEN 3
        WHEN biddeed_status = 'planned' AND priority = 'high' THEN 4
        ELSE 5
    END as urgency_rank
FROM ci_feature_matrix
WHERE biddeed_status IN ('not_started', 'planned')
ORDER BY urgency_rank, complexity;

-- Recent pipeline runs view
CREATE OR REPLACE VIEW v_recent_pipeline_runs AS
SELECT 
    id,
    competitors_analyzed,
    total_duration_ms,
    status,
    timestamp,
    phases->'DISCOVERY'->>'status' as discovery_status,
    phases->'COLLECTION'->>'status' as collection_status,
    phases->'ANALYSIS'->>'status' as analysis_status,
    phases->'SYNTHESIS'->>'status' as synthesis_status,
    phases->'ACTION'->>'status' as action_status
FROM ci_pipeline_runs
ORDER BY timestamp DESC
LIMIT 20;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Get competitor by name
CREATE OR REPLACE FUNCTION get_competitor_by_name(p_name TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    website TEXT,
    threat_level TEXT,
    latest_analysis JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.website,
        c.threat_level,
        (
            SELECT to_jsonb(a.*)
            FROM ci_analysis_results a
            WHERE a.competitor_id = c.id
            ORDER BY a.analyzed_at DESC
            LIMIT 1
        ) as latest_analysis
    FROM ci_competitors c
    WHERE c.name ILIKE '%' || p_name || '%';
END;
$$ LANGUAGE plpgsql;

-- Get battle card for competitor
CREATE OR REPLACE FUNCTION get_battle_card(p_competitor_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_card JSONB;
BEGIN
    SELECT card_data INTO v_card
    FROM ci_battle_cards
    WHERE competitor_id = p_competitor_id
    ORDER BY generated_at DESC
    LIMIT 1;
    
    RETURN v_card;
END;
$$ LANGUAGE plpgsql;

-- Get clone blueprint for competitor
CREATE OR REPLACE FUNCTION get_clone_blueprint(p_competitor_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_blueprint JSONB;
BEGIN
    SELECT blueprint_data INTO v_blueprint
    FROM ci_clone_blueprints
    WHERE competitor_id = p_competitor_id
    ORDER BY generated_at DESC
    LIMIT 1;
    
    RETURN v_blueprint;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ci_competitors IS 'Core competitor profiles for CI Intelligence';
COMMENT ON TABLE ci_feature_matrix IS 'Feature comparison matrix between BidDeed.AI and competitors';
COMMENT ON TABLE ci_battle_cards IS 'Sales battle cards for each competitor';
COMMENT ON TABLE ci_clone_blueprints IS 'Feature cloning blueprints with implementation plans';
COMMENT ON TABLE ci_full_reports IS 'Comprehensive CI reports combining all analyses';
