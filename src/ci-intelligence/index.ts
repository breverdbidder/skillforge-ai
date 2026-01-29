/**
 * CI Intelligence Module
 * Competitive video analysis powered by NVIDIA NIM Kimi K2.5 (FREE!)
 * 
 * Features:
 * - Video analysis for feature extraction
 * - UI pattern recognition
 * - Pricing signal detection
 * - Feature parity matrix generation
 * - Clone blueprint creation
 * - Supabase persistence
 * - Nightly GitHub Actions automation
 */

export { 
  NvidiaNimKimiClient,
  type NvidiaKimiConfig,
  type VideoAnalysisResult,
  type ExtractedFeature,
  type UIPattern,
  type PricingSignal,
  type FeatureParityMatrix,
  type FeatureRow
} from './nvidia-nim-client.js';

export {
  CIIntelligenceOrchestrator,
  type CIConfig,
  type CIAnalysisJob,
  type StoredAnalysis,
  type CloneBlueprint,
  type EffortEstimate
} from './orchestrator.js';

export {
  getAllCompetitors,
  getCompetitorsByCategory,
  getAllVideoSources,
  addVideoSource,
  getCompetitor,
  DIRECT_COMPETITORS,
  ADJACENT_COMPETITORS,
  ASPIRATIONAL_COMPETITORS,
  type Competitor,
  type VideoSource,
  type PricingInfo
} from './competitor-registry.js';
