/**
 * SkillForge AI - CI Intelligence API Server
 * REST API for 5-Phase Competitive Intelligence Pipeline
 * 
 * Endpoints:
 * - POST /ci/pipeline/run         - Run full 5-phase pipeline
 * - GET  /ci/competitors          - List all competitors
 * - POST /ci/competitors          - Add competitor
 * - GET  /ci/competitors/:id      - Get competitor details
 * - GET  /ci/battle-cards/:id     - Get battle card for competitor
 * - POST /ci/battle-cards/:id     - Generate battle card
 * - GET  /ci/blueprints/:id       - Get clone blueprint
 * - POST /ci/blueprints/:id       - Generate clone blueprint
 * - GET  /ci/reports              - List all reports
 * - GET  /ci/reports/:id          - Get specific report
 * - GET  /ci/feature-matrix       - Get feature comparison matrix
 * - GET  /ci/traffic/:domain      - Get SimilarWeb traffic data
 * - GET  /ci/health               - Health check
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NvidiaNimClient } from '../nvidia-nim-client.js';
import { FivePhasePipeline } from './pipeline/five-phase-pipeline.js';
import { BattleCardGenerator } from './pipeline/battle-card-generator.js';
import { CloneBlueprintGenerator } from './clone-blueprint/generator.js';
import { FullReportGenerator } from './pipeline/full-report-generator.js';
import { SimilarWebClient } from './similarweb/similarweb-client.js';

const app = express();
const PORT = process.env.CI_API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize clients
const supabaseUrl = process.env.SUPABASE_URL || 'https://mocerqjnksmhcjzxrewo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const nvidiaNimKey = process.env.NVIDIA_NIM_API_KEY || '';

let supabase: SupabaseClient;
let nvidiaNim: NvidiaNimClient;
let similarweb: SimilarWebClient | null = null;
let pipeline: FivePhasePipeline | null = null;

// Initialize services
function initializeServices() {
  supabase = createClient(supabaseUrl, supabaseKey);
  
  if (nvidiaNimKey) {
    nvidiaNim = new NvidiaNimClient({
      apiKey: nvidiaNimKey,
      model: 'kimi-k2.5',
      maxTokens: 8192,
    });
  }
  
  const similarwebKey = process.env.SIMILARWEB_API_KEY;
  if (similarwebKey) {
    similarweb = new SimilarWebClient({ apiKey: similarwebKey, useFreeEstimates: true }, supabase);
  }
  
  pipeline = new FivePhasePipeline({
    supabaseUrl,
    supabaseKey,
    nvidiaNimApiKey: nvidiaNimKey,
    similarwebApiKey: similarwebKey,
    maxConcurrentAnalyses: 3,
    saveIntermediateResults: true,
  });
}

// Error handler
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================================
// HEALTH & STATUS
// ============================================================

app.get('/ci/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ci-intelligence-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      supabase: !!supabaseKey,
      nvidiaNim: !!nvidiaNimKey,
      similarweb: !!process.env.SIMILARWEB_API_KEY,
    },
  });
});

// ============================================================
// PIPELINE ENDPOINTS
// ============================================================

/**
 * POST /ci/pipeline/run
 * Run the full 5-phase CI pipeline
 */
app.post('/ci/pipeline/run', asyncHandler(async (req: Request, res: Response) => {
  const { competitorIds } = req.body;
  
  if (!pipeline) {
    return res.status(503).json({ error: 'Pipeline not initialized' });
  }
  
  console.log('\n🚀 Starting CI Pipeline via API...');
  
  try {
    const result = await pipeline.runFullPipeline(competitorIds);
    
    res.json({
      success: result.success,
      phases: result.phases.map(p => ({
        phase: p.phase,
        status: p.status,
        duration_ms: p.duration_ms,
      })),
      summary: {
        competitorsAnalyzed: result.battleCards.length,
        battleCardsGenerated: result.battleCards.length,
        blueprintsGenerated: result.cloneBlueprints.length,
        reportGenerated: !!result.reports,
      },
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    res.status(500).json({ error: 'Pipeline execution failed', details: String(error) });
  }
}));

/**
 * GET /ci/pipeline/status
 * Get status of recent pipeline runs
 */
app.get('/ci/pipeline/status', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_pipeline_runs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  
  res.json({ runs: data });
}));

// ============================================================
// COMPETITOR ENDPOINTS
// ============================================================

/**
 * GET /ci/competitors
 * List all competitors
 */
app.get('/ci/competitors', asyncHandler(async (req: Request, res: Response) => {
  const { category, threatLevel, limit = 50 } = req.query;
  
  let query = supabase
    .from('ci_competitors')
    .select('*')
    .eq('is_active', true)
    .order('threat_level', { ascending: false })
    .limit(Number(limit));
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (threatLevel) {
    query = query.eq('threat_level', threatLevel);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  res.json({ competitors: data, count: data?.length || 0 });
}));

/**
 * POST /ci/competitors
 * Add a new competitor
 */
app.post('/ci/competitors', asyncHandler(async (req: Request, res: Response) => {
  const { name, website, category, description, targetMarket, threatLevel } = req.body;
  
  if (!name || !website) {
    return res.status(400).json({ error: 'Name and website are required' });
  }
  
  const { data, error } = await supabase
    .from('ci_competitors')
    .insert({
      name,
      website,
      category: category || 'foreclosure',
      description,
      target_market: targetMarket || [],
      threat_level: threatLevel || 'medium',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  res.status(201).json({ competitor: data });
}));

/**
 * GET /ci/competitors/:id
 * Get competitor details with latest analysis
 */
app.get('/ci/competitors/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const { data: competitor, error: compError } = await supabase
    .from('ci_competitors')
    .select('*')
    .eq('id', id)
    .single();
  
  if (compError) throw compError;
  if (!competitor) return res.status(404).json({ error: 'Competitor not found' });
  
  // Get latest analysis
  const { data: analysis } = await supabase
    .from('ci_analysis_results')
    .select('*')
    .eq('competitor_id', id)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single();
  
  // Get traffic data
  const domain = competitor.website.replace(/https?:\/\//, '').replace(/\/$/, '');
  const { data: traffic } = await supabase
    .from('ci_traffic_analysis')
    .select('*')
    .eq('domain', domain)
    .single();
  
  res.json({
    competitor,
    analysis,
    traffic,
  });
}));

/**
 * DELETE /ci/competitors/:id
 * Deactivate a competitor
 */
app.delete('/ci/competitors/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const { error } = await supabase
    .from('ci_competitors')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) throw error;
  
  res.json({ success: true, message: 'Competitor deactivated' });
}));

// ============================================================
// BATTLE CARD ENDPOINTS
// ============================================================

/**
 * GET /ci/battle-cards
 * List all battle cards
 */
app.get('/ci/battle-cards', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_battle_cards')
    .select('id, competitor_id, competitor_name, generated_at, version')
    .order('generated_at', { ascending: false });
  
  if (error) throw error;
  
  res.json({ battleCards: data });
}));

/**
 * GET /ci/battle-cards/:competitorId
 * Get battle card for specific competitor
 */
app.get('/ci/battle-cards/:competitorId', asyncHandler(async (req: Request, res: Response) => {
  const { competitorId } = req.params;
  
  const { data, error } = await supabase
    .from('ci_battle_cards')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return res.status(404).json({ error: 'Battle card not found' });
  
  res.json({ battleCard: data.card_data });
}));

/**
 * POST /ci/battle-cards/:competitorId
 * Generate new battle card for competitor
 */
app.post('/ci/battle-cards/:competitorId', asyncHandler(async (req: Request, res: Response) => {
  const { competitorId } = req.params;
  
  if (!nvidiaNim) {
    return res.status(503).json({ error: 'NVIDIA NIM not configured' });
  }
  
  // Get competitor analysis
  const { data: analysis, error: analysisError } = await supabase
    .from('ci_analysis_results')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single();
  
  if (analysisError || !analysis) {
    return res.status(404).json({ error: 'No analysis found for competitor. Run pipeline first.' });
  }
  
  // Generate battle card
  const generator = new BattleCardGenerator(nvidiaNim);
  const battleCard = await generator.generate(analysis);
  
  // Store battle card
  const { error: insertError } = await supabase
    .from('ci_battle_cards')
    .insert({
      competitor_id: competitorId,
      competitor_name: analysis.competitor_name,
      card_data: battleCard,
      overview: battleCard.overview?.description,
      when_we_win: battleCard.whenWeWin,
      when_we_lose: battleCard.whenWeLose,
      key_differentiators: battleCard.featureComparison?.our_advantages,
      objections: battleCard.objections,
      landmines: battleCard.landmines,
      discovery_questions: battleCard.discoveryQuestions,
      closing_strategies: battleCard.closingStrategies,
      quick_reference: battleCard.quickReference,
    });
  
  if (insertError) throw insertError;
  
  res.status(201).json({ battleCard, message: 'Battle card generated successfully' });
}));

// ============================================================
// CLONE BLUEPRINT ENDPOINTS
// ============================================================

/**
 * GET /ci/blueprints
 * List all clone blueprints
 */
app.get('/ci/blueprints', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_clone_blueprints')
    .select('id, competitor_id, competitor_name, feature_count, total_effort_days, priority_score, generated_at')
    .order('generated_at', { ascending: false });
  
  if (error) throw error;
  
  res.json({ blueprints: data });
}));

/**
 * GET /ci/blueprints/:competitorId
 * Get clone blueprint for specific competitor
 */
app.get('/ci/blueprints/:competitorId', asyncHandler(async (req: Request, res: Response) => {
  const { competitorId } = req.params;
  
  const { data, error } = await supabase
    .from('ci_clone_blueprints')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return res.status(404).json({ error: 'Clone blueprint not found' });
  
  res.json({ blueprint: data.blueprint_data });
}));

/**
 * POST /ci/blueprints/:competitorId
 * Generate new clone blueprint for competitor
 */
app.post('/ci/blueprints/:competitorId', asyncHandler(async (req: Request, res: Response) => {
  const { competitorId } = req.params;
  const { config } = req.body;
  
  // Get collected data
  const { data: collectedData, error: dataError } = await supabase
    .from('ci_collected_data')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('collected_at', { ascending: false })
    .limit(1)
    .single();
  
  if (dataError || !collectedData) {
    return res.status(404).json({ error: 'No collected data found. Run pipeline first.' });
  }
  
  // Generate blueprint
  const generator = new CloneBlueprintGenerator(supabase, nvidiaNim);
  const blueprint = await generator.generateBlueprint(collectedData, config || {
    prioritizeML: true,
    includeUIPatterns: true,
    maxFeaturesPerBlueprint: 10,
    effortThreshold: 'any',
  });
  
  res.status(201).json({ blueprint, message: 'Clone blueprint generated successfully' });
}));

// ============================================================
// REPORT ENDPOINTS
// ============================================================

/**
 * GET /ci/reports
 * List all CI reports
 */
app.get('/ci/reports', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_full_reports')
    .select('id, title, competitor_count, generated_at')
    .order('generated_at', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  
  res.json({ reports: data });
}));

/**
 * GET /ci/reports/:id
 * Get specific CI report
 */
app.get('/ci/reports/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('ci_full_reports')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Report not found' });
  
  res.json({ report: data.report_data });
}));

/**
 * GET /ci/reports/latest
 * Get the latest CI report
 */
app.get('/ci/reports/latest', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_full_reports')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return res.status(404).json({ error: 'No reports found' });
  
  res.json({ report: data.report_data });
}));

// ============================================================
// FEATURE MATRIX ENDPOINTS
// ============================================================

/**
 * GET /ci/feature-matrix
 * Get feature comparison matrix
 */
app.get('/ci/feature-matrix', asyncHandler(async (req: Request, res: Response) => {
  const { category, priority } = req.query;
  
  let query = supabase
    .from('ci_feature_matrix')
    .select('*')
    .order('priority')
    .order('feature_category');
  
  if (category) {
    query = query.eq('feature_category', category);
  }
  
  if (priority) {
    query = query.eq('priority', priority);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  res.json({ features: data, count: data?.length || 0 });
}));

/**
 * GET /ci/feature-matrix/gaps
 * Get feature gaps (not implemented by BidDeed.AI)
 */
app.get('/ci/feature-matrix/gaps', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('ci_feature_matrix')
    .select('*')
    .in('biddeed_status', ['not_started', 'planned'])
    .order('priority')
    .order('complexity');
  
  if (error) throw error;
  
  res.json({ gaps: data, count: data?.length || 0 });
}));

/**
 * PUT /ci/feature-matrix/:featureName
 * Update feature status
 */
app.put('/ci/feature-matrix/:featureName', asyncHandler(async (req: Request, res: Response) => {
  const { featureName } = req.params;
  const { status, maturity, priority, estimatedDays } = req.body;
  
  const updates: Record<string, any> = {};
  if (status) updates.biddeed_status = status;
  if (maturity) updates.biddeed_maturity = maturity;
  if (priority) updates.priority = priority;
  if (estimatedDays) updates.estimated_days = estimatedDays;
  
  const { data, error } = await supabase
    .from('ci_feature_matrix')
    .update(updates)
    .eq('feature_name', featureName)
    .select()
    .single();
  
  if (error) throw error;
  
  res.json({ feature: data });
}));

// ============================================================
// TRAFFIC ANALYSIS ENDPOINTS
// ============================================================

/**
 * GET /ci/traffic/:domain
 * Get SimilarWeb traffic analysis for domain
 */
app.get('/ci/traffic/:domain', asyncHandler(async (req: Request, res: Response) => {
  const { domain } = req.params;
  const cleanDomain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');
  
  // Check database first
  const { data: cached } = await supabase
    .from('ci_traffic_analysis')
    .select('*')
    .eq('domain', cleanDomain)
    .single();
  
  if (cached) {
    return res.json({ traffic: cached, source: 'cache' });
  }
  
  // Use SimilarWeb client if available
  if (similarweb) {
    const analysis = await similarweb.analyzeTraffic(cleanDomain);
    return res.json({ traffic: analysis, source: 'live' });
  }
  
  res.status(404).json({ error: 'No traffic data available' });
}));

/**
 * GET /ci/traffic/benchmark
 * Get traffic benchmark across all competitors
 */
app.get('/ci/traffic/benchmark', asyncHandler(async (req: Request, res: Response) => {
  const { data: competitors } = await supabase
    .from('ci_competitors')
    .select('website')
    .eq('is_active', true);
  
  if (!competitors || competitors.length === 0) {
    return res.status(404).json({ error: 'No competitors found' });
  }
  
  const domains = competitors.map(c => c.website.replace(/https?:\/\//, '').replace(/\/$/, ''));
  
  if (similarweb) {
    const benchmark = await similarweb.generateBenchmark(domains);
    return res.json({ benchmark });
  }
  
  // Fallback to cached data
  const { data: trafficData } = await supabase
    .from('ci_traffic_analysis')
    .select('*')
    .in('domain', domains);
  
  res.json({ traffic: trafficData });
}));

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// SERVER STARTUP
// ============================================================

async function startServer() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     SkillForge AI - CI Intelligence API Server            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Initialize services
  console.log('🔧 Initializing services...');
  initializeServices();
  console.log('   ✓ Supabase client initialized');
  console.log(`   ✓ NVIDIA NIM: ${nvidiaNimKey ? 'Configured' : 'Not configured'}`);
  console.log(`   ✓ SimilarWeb: ${process.env.SIMILARWEB_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`   ✓ Pipeline: Ready\n`);
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 CI Intelligence API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/ci/health`);
    console.log(`   Docs:   http://localhost:${PORT}/ci/docs\n`);
    console.log('Available endpoints:');
    console.log('   POST /ci/pipeline/run          - Run full pipeline');
    console.log('   GET  /ci/competitors           - List competitors');
    console.log('   GET  /ci/battle-cards/:id      - Get battle card');
    console.log('   GET  /ci/blueprints/:id        - Get clone blueprint');
    console.log('   GET  /ci/reports/latest        - Get latest report');
    console.log('   GET  /ci/feature-matrix        - Get feature matrix');
    console.log('   GET  /ci/traffic/:domain       - Get traffic data\n');
  });
}

// Export for testing
export { app };

// Start server
startServer().catch(console.error);
