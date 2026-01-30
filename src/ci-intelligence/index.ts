/**
 * SkillForge AI - CI Intelligence Module
 * Main export file for all CI Intelligence components
 * 
 * 5-PHASE COMPETITIVE INTELLIGENCE PIPELINE:
 * ==========================================
 * Phase 1: DISCOVERY    - Identify competitors, catalog profiles
 * Phase 2: COLLECTION   - Gather data (web, video, SimilarWeb, social)
 * Phase 3: ANALYSIS     - AI-powered feature extraction, SWOT, positioning
 * Phase 4: SYNTHESIS    - Generate reports, battle cards, clone blueprints
 * Phase 5: ACTION       - Strategic recommendations, implementation roadmap
 * 
 * CORE CAPABILITIES:
 * - NVIDIA NIM Kimi K2.5 integration for multimodal analysis
 * - SimilarWeb traffic and market intelligence
 * - Automated battle card generation
 * - Clone blueprint methodology for feature replication
 * - Full competitive intelligence reports
 */

// Phase Modules
export { Phase1Discovery } from './phases/phase1-discovery.js';
export { Phase2Collection } from './phases/phase2-collection.js';
export { Phase3Analysis } from './phases/phase3-analysis.js';
export { Phase4Synthesis } from './phases/phase4-synthesis.js';
export { Phase5Action } from './phases/phase5-action.js';

// Pipeline Components
export { FivePhasePipeline, CIPhase } from './pipeline/five-phase-pipeline.js';
export { BattleCardGenerator } from './pipeline/battle-card-generator.js';
export { FullReportGenerator } from './pipeline/full-report-generator.js';

// Clone Blueprint System
export { CloneBlueprintGenerator } from './clone-blueprint/generator.js';

// SimilarWeb Integration
export { SimilarWebClient } from './similarweb/similarweb-client.js';

// Types
export type {
  // Discovery types
  CompetitorProfile,
  DiscoveryConfig,
  DiscoveryResult,
  DiscoveryInsight,
} from './phases/phase1-discovery.js';

export type {
  // Collection types
  CollectedData,
  WebsiteData,
  PricingData,
  FeatureData,
  MediaData,
  SocialData,
  CollectionConfig,
  CollectionResult,
} from './phases/phase2-collection.js';

export type {
  // Analysis types
  AnalysisResult,
  CompetitorAnalysis,
  SWOTAnalysis,
  FeatureMatrixEntry,
  PricingAnalysis,
  ThreatAssessment,
  Opportunity,
} from './phases/phase3-analysis.js';

export type {
  // Synthesis types
  SynthesisResult,
  CompetitivePositioning,
  StrategicRecommendation,
  WinLossAnalysis,
  BattleReadiness,
  FeaturePriority,
  QuickWin,
  LongTermPlay,
  SalesBattleCard,
  ObjectionResponse,
} from './phases/phase4-synthesis.js';

export type {
  // Action types
  ActionResult,
  CIFullReport,
  CloneBlueprint,
  BattleCardDocument,
  ActionPlan,
  ExecutiveSummary,
} from './phases/phase5-action.js';

export type {
  // Battle Card types
  BattleCard,
  WinScenario,
  LoseScenario,
  FeatureAdvantage,
  ObjectionHandler,
  Landmine,
  DiscoveryQuestion,
  ClosingStrategy,
} from './pipeline/battle-card-generator.js';

export type {
  // Clone Blueprint types
  FullCloneBlueprint,
  FeatureCloneBlueprint,
  UICloneBlueprint,
  WorkflowCloneBlueprint,
  ImplementationRoadmap,
  MLEnhancement,
  DifferentiationStrategy,
} from './clone-blueprint/generator.js';

export type {
  // SimilarWeb types
  TrafficAnalysis,
  CompetitorBenchmark,
  KeywordData,
} from './similarweb/similarweb-client.js';

export type {
  // Full Report types
  FullReport,
  MarketOverview,
  FeatureAnalysis,
  PricingIntelligence,
  SWOTMatrix,
  MessagingFramework,
} from './pipeline/full-report-generator.js';

/**
 * Quick start function - run full CI pipeline
 */
export async function runCIPipeline(config: {
  supabaseUrl: string;
  supabaseKey: string;
  nvidiaNimApiKey: string;
  similarwebApiKey?: string;
  competitorIds?: string[];
}): Promise<any> {
  const { FivePhasePipeline } = await import('./pipeline/five-phase-pipeline.js');
  
  const pipeline = new FivePhasePipeline({
    supabaseUrl: config.supabaseUrl,
    supabaseKey: config.supabaseKey,
    nvidiaNimApiKey: config.nvidiaNimApiKey,
    similarwebApiKey: config.similarwebApiKey,
    maxConcurrentAnalyses: 3,
    saveIntermediateResults: true,
  });
  
  return await pipeline.runFullPipeline(config.competitorIds);
}

/**
 * Generate battle card for single competitor
 */
export async function generateBattleCard(
  competitorId: string,
  config: {
    supabaseUrl: string;
    supabaseKey: string;
    nvidiaNimApiKey: string;
  }
): Promise<any> {
  const { createClient } = await import('@supabase/supabase-js');
  const { NvidiaNimClient } = await import('./nvidia-nim-client.js');
  const { BattleCardGenerator } = await import('./pipeline/battle-card-generator.js');
  
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const nvidiaNim = new NvidiaNimClient({
    apiKey: config.nvidiaNimApiKey,
    model: 'kimi-k2.5',
  });
  
  // Fetch competitor analysis
  const { data } = await supabase
    .from('ci_analysis_results')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  if (!data) throw new Error(`No analysis found for competitor ${competitorId}`);
  
  const generator = new BattleCardGenerator(nvidiaNim);
  return await generator.generate(data);
}

/**
 * Generate clone blueprint for single competitor
 */
export async function generateCloneBlueprint(
  competitorId: string,
  config: {
    supabaseUrl: string;
    supabaseKey: string;
    nvidiaNimApiKey: string;
  }
): Promise<any> {
  const { createClient } = await import('@supabase/supabase-js');
  const { NvidiaNimClient } = await import('./nvidia-nim-client.js');
  const { CloneBlueprintGenerator } = await import('./clone-blueprint/generator.js');
  
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const nvidiaNim = new NvidiaNimClient({
    apiKey: config.nvidiaNimApiKey,
    model: 'kimi-k2.5',
  });
  
  // Fetch collected data
  const { data } = await supabase
    .from('ci_collected_data')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('collected_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!data) throw new Error(`No collected data found for competitor ${competitorId}`);
  
  const generator = new CloneBlueprintGenerator(supabase, nvidiaNim);
  return await generator.generateBlueprint(data, {
    prioritizeML: true,
    includeUIPatterns: true,
    maxFeaturesPerBlueprint: 10,
    effortThreshold: 'any',
  });
}

// Default export
export default {
  runCIPipeline,
  generateBattleCard,
  generateCloneBlueprint,
};
