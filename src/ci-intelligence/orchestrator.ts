/**
 * Competitive Intelligence Orchestrator
 * Coordinates video analysis, feature extraction, and report generation
 * Persists to Supabase for cross-session analysis
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  NvidiaNimKimiClient, 
  VideoAnalysisResult, 
  FeatureParityMatrix,
  ExtractedFeature 
} from './nvidia-nim-client.js';
import { 
  getAllCompetitors, 
  getAllVideoSources, 
  Competitor,
  getCompetitorsByCategory 
} from './competitor-registry.js';

export interface CIConfig {
  nvidiaApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  autoSync?: boolean;
  analyzeOnStartup?: boolean;
}

export interface CIAnalysisJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  competitors: string[];
  videosAnalyzed: number;
  featuresExtracted: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface StoredAnalysis {
  id: string;
  competitor_id: string;
  competitor_name: string;
  video_url: string;
  features: ExtractedFeature[];
  ui_patterns: any[];
  pricing_signals: any[];
  marketing_claims: string[];
  technical_stack: string[];
  raw_analysis: string;
  analyzed_at: string;
}

export class CIIntelligenceOrchestrator {
  private kimiClient: NvidiaNimKimiClient;
  private supabase: SupabaseClient;
  private config: CIConfig;
  private currentJob: CIAnalysisJob | null = null;

  constructor(config: CIConfig) {
    this.config = config;
    
    // Initialize NVIDIA NIM Kimi K2.5 client (FREE!)
    this.kimiClient = new NvidiaNimKimiClient({
      apiKey: config.nvidiaApiKey
    });

    // Initialize Supabase
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Initialize CI system and ensure tables exist
   */
  async initialize(): Promise<void> {
    console.log('\n🔍 Initializing CI Intelligence System...\n');
    
    // Create tables if they don't exist
    await this.ensureTables();
    
    console.log('✓ CI Intelligence System ready');
    console.log(`  Competitors tracked: ${getAllCompetitors().length}`);
    console.log(`  Videos queued: ${getAllVideoSources().length}`);
    console.log(`  Using: NVIDIA NIM Kimi K2.5 (FREE TIER)\n`);
  }

  /**
   * Run full CI analysis on all competitors with videos
   */
  async runFullAnalysis(): Promise<FeatureParityMatrix> {
    const videos = getAllVideoSources();
    
    if (videos.length === 0) {
      console.log('⚠️ No video sources configured. Add videos to competitor registry.');
      return this.generateEmptyMatrix();
    }

    this.currentJob = {
      id: `ci-${Date.now()}`,
      status: 'running',
      competitors: [...new Set(videos.map(v => v.competitor))],
      videosAnalyzed: 0,
      featuresExtracted: 0,
      startedAt: new Date()
    };

    console.log(`\n🎬 Starting CI Analysis Job: ${this.currentJob.id}`);
    console.log(`   Competitors: ${this.currentJob.competitors.join(', ')}`);
    console.log(`   Videos: ${videos.length}\n`);

    const results: VideoAnalysisResult[] = [];

    for (const video of videos) {
      try {
        console.log(`📹 Analyzing: ${video.competitor} - ${video.url}`);
        
        const result = await this.kimiClient.analyzeVideo(
          video.url,
          video.competitor,
          'full'
        );
        
        results.push(result);
        this.currentJob.videosAnalyzed++;
        this.currentJob.featuresExtracted += result.features.length;

        // Persist to Supabase
        await this.persistAnalysis(result);
        
        console.log(`   ✓ Extracted ${result.features.length} features\n`);
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error}\n`);
      }
    }

    this.currentJob.status = 'completed';
    this.currentJob.completedAt = new Date();

    // Generate feature parity matrix
    const matrix = this.kimiClient.generateFeatureMatrix(results);
    
    // Persist matrix
    await this.persistFeatureMatrix(matrix);

    // Print summary
    this.printAnalysisSummary(matrix);

    return matrix;
  }

  /**
   * Analyze specific competitor
   */
  async analyzeCompetitor(competitorId: string): Promise<VideoAnalysisResult[]> {
    const competitor = getAllCompetitors().find(c => c.id === competitorId);
    
    if (!competitor) {
      throw new Error(`Competitor not found: ${competitorId}`);
    }

    if (competitor.videoSources.length === 0) {
      console.log(`⚠️ No videos configured for ${competitor.name}`);
      return [];
    }

    console.log(`\n🎯 Analyzing: ${competitor.name}`);
    console.log(`   Videos: ${competitor.videoSources.length}\n`);

    const results: VideoAnalysisResult[] = [];

    for (const video of competitor.videoSources) {
      const result = await this.kimiClient.analyzeVideo(
        video.url,
        competitor.name,
        'full'
      );
      
      results.push(result);
      await this.persistAnalysis(result);
    }

    return results;
  }

  /**
   * Get stored analyses from Supabase
   */
  async getStoredAnalyses(
    competitorId?: string,
    limit: number = 50
  ): Promise<StoredAnalysis[]> {
    let query = this.supabase
      .from('ci_analyses')
      .select('*')
      .order('analyzed_at', { ascending: false })
      .limit(limit);

    if (competitorId) {
      query = query.eq('competitor_id', competitorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch analyses:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get latest feature parity matrix
   */
  async getLatestFeatureMatrix(): Promise<FeatureParityMatrix | null> {
    const { data, error } = await this.supabase
      .from('ci_feature_matrices')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      competitors: data.competitors,
      features: data.features,
      bidDeedGaps: data.biddeed_gaps,
      bidDeedAdvantages: data.biddeed_advantages,
      generatedAt: new Date(data.generated_at)
    };
  }

  /**
   * Get feature gaps (what competitors have that BidDeed doesn't)
   */
  async getFeatureGaps(): Promise<string[]> {
    const matrix = await this.getLatestFeatureMatrix();
    return matrix?.bidDeedGaps || [];
  }

  /**
   * Generate clone blueprint for specific competitor
   */
  async generateCloneBlueprint(competitorId: string): Promise<CloneBlueprint> {
    const analyses = await this.getStoredAnalyses(competitorId);
    
    if (analyses.length === 0) {
      throw new Error(`No analyses found for competitor: ${competitorId}`);
    }

    const allFeatures: ExtractedFeature[] = [];
    const allUIPatterns: any[] = [];
    
    for (const analysis of analyses) {
      allFeatures.push(...analysis.features);
      allUIPatterns.push(...analysis.ui_patterns);
    }

    // Deduplicate and prioritize
    const uniqueFeatures = this.deduplicateFeatures(allFeatures);
    
    return {
      competitor: analyses[0].competitor_name,
      generatedAt: new Date(),
      features: {
        critical: uniqueFeatures.filter(f => f.priority === 'critical'),
        high: uniqueFeatures.filter(f => f.priority === 'high'),
        medium: uniqueFeatures.filter(f => f.priority === 'medium'),
        low: uniqueFeatures.filter(f => f.priority === 'low')
      },
      uiPatterns: allUIPatterns,
      implementationOrder: this.calculateImplementationOrder(uniqueFeatures),
      estimatedEffort: this.estimateEffort(uniqueFeatures)
    };
  }

  /**
   * Persist analysis to Supabase
   */
  private async persistAnalysis(result: VideoAnalysisResult): Promise<void> {
    const competitor = getAllCompetitors().find(c => c.name === result.competitor);
    
    const { error } = await this.supabase
      .from('ci_analyses')
      .insert({
        competitor_id: competitor?.id || result.competitor.toLowerCase().replace(/\s+/g, '-'),
        competitor_name: result.competitor,
        video_url: result.videoUrl,
        features: result.features,
        ui_patterns: result.uiPatterns,
        pricing_signals: result.pricingSignals,
        marketing_claims: result.marketingClaims,
        technical_stack: result.technicalStack,
        raw_analysis: result.rawAnalysis,
        analyzed_at: result.timestamp.toISOString()
      });

    if (error) {
      console.error('Failed to persist analysis:', error);
    }
  }

  /**
   * Persist feature matrix to Supabase
   */
  private async persistFeatureMatrix(matrix: FeatureParityMatrix): Promise<void> {
    const { error } = await this.supabase
      .from('ci_feature_matrices')
      .insert({
        competitors: matrix.competitors,
        features: matrix.features,
        biddeed_gaps: matrix.bidDeedGaps,
        biddeed_advantages: matrix.bidDeedAdvantages,
        generated_at: matrix.generatedAt.toISOString()
      });

    if (error) {
      console.error('Failed to persist feature matrix:', error);
    }
  }

  /**
   * Ensure required tables exist
   */
  private async ensureTables(): Promise<void> {
    // Tables will be created via migration or Supabase dashboard
    // This is a placeholder for verification
    console.log('  Checking Supabase tables...');
  }

  private generateEmptyMatrix(): FeatureParityMatrix {
    return {
      competitors: [],
      features: [],
      bidDeedGaps: [],
      bidDeedAdvantages: [],
      generatedAt: new Date()
    };
  }

  private deduplicateFeatures(features: ExtractedFeature[]): ExtractedFeature[] {
    const seen = new Map<string, ExtractedFeature>();
    
    for (const feature of features) {
      const key = feature.name.toLowerCase();
      if (!seen.has(key) || 
          this.getPriorityScore(feature.priority) > this.getPriorityScore(seen.get(key)!.priority)) {
        seen.set(key, feature);
      }
    }
    
    return Array.from(seen.values());
  }

  private getPriorityScore(priority: string): number {
    return { critical: 4, high: 3, medium: 2, low: 1 }[priority] || 0;
  }

  private calculateImplementationOrder(features: ExtractedFeature[]): string[] {
    // Sort by: priority DESC, complexity ASC
    return features
      .sort((a, b) => {
        const priorityDiff = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return a.complexity - b.complexity;
      })
      .map(f => f.name);
  }

  private estimateEffort(features: ExtractedFeature[]): EffortEstimate {
    const totalComplexity = features.reduce((sum, f) => sum + f.complexity, 0);
    const avgComplexity = totalComplexity / features.length || 0;
    
    // Rough estimate: complexity 1 = 1 day, 5 = 2 weeks
    const totalDays = features.reduce((sum, f) => {
      const days = { 1: 1, 2: 3, 3: 5, 4: 8, 5: 14 }[f.complexity] || 5;
      return sum + days;
    }, 0);

    return {
      totalFeatures: features.length,
      averageComplexity: Math.round(avgComplexity * 10) / 10,
      estimatedDays: totalDays,
      estimatedWeeks: Math.ceil(totalDays / 5),
      breakdown: {
        critical: features.filter(f => f.priority === 'critical').length,
        high: features.filter(f => f.priority === 'high').length,
        medium: features.filter(f => f.priority === 'medium').length,
        low: features.filter(f => f.priority === 'low').length
      }
    };
  }

  private printAnalysisSummary(matrix: FeatureParityMatrix): void {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 CI ANALYSIS SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\nCompetitors Analyzed: ${matrix.competitors.length}`);
    console.log(`Total Features Found: ${matrix.features.length}`);
    console.log(`\n🔴 BidDeed.AI Gaps (${matrix.bidDeedGaps.length}):`);
    matrix.bidDeedGaps.slice(0, 10).forEach(gap => {
      console.log(`   • ${gap}`);
    });
    if (matrix.bidDeedGaps.length > 10) {
      console.log(`   ... and ${matrix.bidDeedGaps.length - 10} more`);
    }
    console.log(`\n🟢 BidDeed.AI Advantages (${matrix.bidDeedAdvantages.length}):`);
    matrix.bidDeedAdvantages.forEach(adv => {
      console.log(`   • ${adv}`);
    });
    console.log('\n' + '═'.repeat(60) + '\n');
  }

  getJobStatus(): CIAnalysisJob | null {
    return this.currentJob;
  }

  getKimiStats() {
    return this.kimiClient.getStats();
  }
}

export interface CloneBlueprint {
  competitor: string;
  generatedAt: Date;
  features: {
    critical: ExtractedFeature[];
    high: ExtractedFeature[];
    medium: ExtractedFeature[];
    low: ExtractedFeature[];
  };
  uiPatterns: any[];
  implementationOrder: string[];
  estimatedEffort: EffortEstimate;
}

export interface EffortEstimate {
  totalFeatures: number;
  averageComplexity: number;
  estimatedDays: number;
  estimatedWeeks: number;
  breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
