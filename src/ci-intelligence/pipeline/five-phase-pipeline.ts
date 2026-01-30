/**
 * SkillForge AI - CI Intelligence 5-Phase Pipeline
 * Complete competitive intelligence analysis system
 * 
 * PHASES:
 * 1. DISCOVERY   - Identify and catalog competitors
 * 2. COLLECTION  - Gather data (videos, screenshots, web, SimilarWeb)
 * 3. ANALYSIS    - AI-powered feature extraction and comparison
 * 4. SYNTHESIS   - Generate reports, battle cards, clone blueprints
 * 5. ACTION      - Strategic recommendations and implementation roadmap
 */

import { EventEmitter } from 'events';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NvidiaNimClient } from '../nvidia-nim-client.js';
import { SimilarWebClient } from './similarweb-client.js';
import { BattleCardGenerator } from './battle-card-generator.js';
import { CloneBlueprintGenerator } from './clone-blueprint-generator.js';
import { FullReportGenerator } from './full-report-generator.js';

// Phase definitions
export enum CIPhase {
  DISCOVERY = 'DISCOVERY',
  COLLECTION = 'COLLECTION',
  ANALYSIS = 'ANALYSIS',
  SYNTHESIS = 'SYNTHESIS',
  ACTION = 'ACTION',
}

export interface PhaseResult {
  phase: CIPhase;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration_ms?: number;
  data?: any;
  error?: string;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  category: string;
  description?: string;
  logo_url?: string;
  social_links?: Record<string, string>;
  pricing_tiers?: PricingTier[];
  known_features?: string[];
}

export interface PricingTier {
  name: string;
  price: number;
  period: 'monthly' | 'yearly' | 'one-time';
  features: string[];
}

export interface CollectedData {
  competitor: Competitor;
  videos: VideoData[];
  screenshots: ScreenshotData[];
  webpages: WebpageData[];
  similarweb: SimilarWebData | null;
  social: SocialData[];
  pricing: PricingData | null;
}

export interface VideoData {
  url: string;
  title: string;
  platform: 'youtube' | 'vimeo' | 'other';
  duration_seconds?: number;
  transcript?: string;
  analysis?: any;
}

export interface ScreenshotData {
  url: string;
  page: string;
  captured_at: Date;
  analysis?: any;
}

export interface WebpageData {
  url: string;
  title: string;
  content: string;
  features_mentioned: string[];
  pricing_found: boolean;
}

export interface SimilarWebData {
  global_rank: number;
  country_rank: number;
  category_rank: number;
  total_visits: number;
  bounce_rate: number;
  pages_per_visit: number;
  avg_visit_duration: number;
  traffic_sources: {
    direct: number;
    referrals: number;
    search: number;
    social: number;
    paid: number;
    email: number;
  };
  top_countries: { country: string; share: number }[];
  top_keywords: { keyword: string; share: number }[];
  competitors_similarweb: string[];
}

export interface SocialData {
  platform: string;
  followers: number;
  engagement_rate?: number;
  recent_posts?: any[];
}

export interface PricingData {
  tiers: PricingTier[];
  has_free_tier: boolean;
  has_trial: boolean;
  trial_days?: number;
  enterprise_contact: boolean;
}

export interface AnalysisResult {
  competitor: Competitor;
  features: ExtractedFeature[];
  ui_patterns: UIPattern[];
  pricing_analysis: PricingAnalysis;
  market_position: MarketPosition;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ExtractedFeature {
  name: string;
  description: string;
  category: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  competitor_has: boolean;
  biddeed_has: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  clone_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  estimated_dev_days?: number;
}

export interface UIPattern {
  name: string;
  description: string;
  screenshot_url?: string;
  replicable: boolean;
  implementation_notes?: string;
}

export interface PricingAnalysis {
  pricing_model: 'freemium' | 'subscription' | 'one-time' | 'usage-based' | 'hybrid';
  avg_price_monthly: number;
  price_vs_market: 'below' | 'at' | 'above';
  value_proposition: string;
}

export interface MarketPosition {
  segment: 'enterprise' | 'mid-market' | 'smb' | 'consumer';
  positioning: string;
  target_audience: string[];
  unique_selling_points: string[];
}

export interface PipelineConfig {
  supabaseUrl: string;
  supabaseKey: string;
  nvidiaNimApiKey: string;
  similarwebApiKey?: string;
  maxConcurrentAnalyses: number;
  saveIntermediateResults: boolean;
}

export class FivePhasePipeline extends EventEmitter {
  private supabase: SupabaseClient;
  private nvidiaNim: NvidiaNimClient;
  private similarweb: SimilarWebClient | null;
  private battleCardGen: BattleCardGenerator;
  private cloneBlueprintGen: CloneBlueprintGenerator;
  private fullReportGen: FullReportGenerator;
  private config: PipelineConfig;
  
  private phaseResults: Map<CIPhase, PhaseResult> = new Map();
  private competitors: Competitor[] = [];
  private collectedData: Map<string, CollectedData> = new Map();
  private analysisResults: Map<string, AnalysisResult> = new Map();

  constructor(config: PipelineConfig) {
    super();
    this.config = config;
    
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    this.nvidiaNim = new NvidiaNimClient({
      apiKey: config.nvidiaNimApiKey,
      model: 'kimi-k2.5',
      maxTokens: 8192,
    });
    
    this.similarweb = config.similarwebApiKey 
      ? new SimilarWebClient(config.similarwebApiKey)
      : null;
    
    this.battleCardGen = new BattleCardGenerator(this.nvidiaNim);
    this.cloneBlueprintGen = new CloneBlueprintGenerator(this.nvidiaNim);
    this.fullReportGen = new FullReportGenerator(this.nvidiaNim, this.supabase);
    
    // Initialize phase results
    Object.values(CIPhase).forEach(phase => {
      this.phaseResults.set(phase, { phase, status: 'pending' });
    });
  }

  /**
   * Run the complete 5-phase CI pipeline
   */
  async runFullPipeline(competitorIds?: string[]): Promise<{
    success: boolean;
    phases: PhaseResult[];
    reports: any;
    battleCards: any[];
    cloneBlueprints: any[];
  }> {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     SkillForge AI - 5-Phase CI Intelligence Pipeline         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const pipelineStartTime = Date.now();
    
    try {
      // PHASE 1: DISCOVERY
      await this.runPhase1Discovery(competitorIds);
      
      // PHASE 2: COLLECTION
      await this.runPhase2Collection();
      
      // PHASE 3: ANALYSIS
      await this.runPhase3Analysis();
      
      // PHASE 4: SYNTHESIS
      const synthesisResults = await this.runPhase4Synthesis();
      
      // PHASE 5: ACTION
      const actionPlan = await this.runPhase5Action();
      
      const totalDuration = Date.now() - pipelineStartTime;
      
      console.log('\n════════════════════════════════════════════════════════════════');
      console.log(`✅ Pipeline completed in ${(totalDuration / 1000).toFixed(1)}s`);
      console.log('════════════════════════════════════════════════════════════════\n');
      
      // Store final results
      await this.storePipelineResults(totalDuration);
      
      return {
        success: true,
        phases: Array.from(this.phaseResults.values()),
        reports: synthesisResults.fullReport,
        battleCards: synthesisResults.battleCards,
        cloneBlueprints: synthesisResults.cloneBlueprints,
      };
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      return {
        success: false,
        phases: Array.from(this.phaseResults.values()),
        reports: null,
        battleCards: [],
        cloneBlueprints: [],
      };
    }
  }

  /**
   * PHASE 1: DISCOVERY
   * Identify and catalog competitors
   */
  private async runPhase1Discovery(competitorIds?: string[]): Promise<void> {
    const phase = CIPhase.DISCOVERY;
    this.startPhase(phase);
    
    console.log('📍 PHASE 1: DISCOVERY');
    console.log('   Identifying and cataloging competitors...\n');
    
    try {
      if (competitorIds && competitorIds.length > 0) {
        // Load specific competitors
        const { data, error } = await this.supabase
          .from('ci_competitors')
          .select('*')
          .in('id', competitorIds);
        
        if (error) throw error;
        this.competitors = data || [];
      } else {
        // Load all competitors
        const { data, error } = await this.supabase
          .from('ci_competitors')
          .select('*');
        
        if (error) throw error;
        this.competitors = data || [];
      }
      
      console.log(`   Found ${this.competitors.length} competitors:`);
      this.competitors.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name} (${c.website})`);
      });
      
      // Discover additional competitors via SimilarWeb
      if (this.similarweb && this.competitors.length > 0) {
        console.log('\n   🔍 Discovering related competitors via SimilarWeb...');
        const relatedCompetitors = await this.discoverRelatedCompetitors();
        console.log(`   Found ${relatedCompetitors.length} related competitors`);
      }
      
      this.completePhase(phase, { competitors: this.competitors });
      
    } catch (error) {
      this.failPhase(phase, error);
      throw error;
    }
  }

  /**
   * PHASE 2: COLLECTION
   * Gather all available data about competitors
   */
  private async runPhase2Collection(): Promise<void> {
    const phase = CIPhase.COLLECTION;
    this.startPhase(phase);
    
    console.log('\n📥 PHASE 2: COLLECTION');
    console.log('   Gathering competitor data...\n');
    
    try {
      for (const competitor of this.competitors) {
        console.log(`   📊 Collecting data for: ${competitor.name}`);
        
        const data: CollectedData = {
          competitor,
          videos: [],
          screenshots: [],
          webpages: [],
          similarweb: null,
          social: [],
          pricing: null,
        };
        
        // Collect SimilarWeb data
        if (this.similarweb) {
          console.log('      → SimilarWeb metrics...');
          data.similarweb = await this.collectSimilarWebData(competitor);
        }
        
        // Collect webpage data
        console.log('      → Webpage content...');
        data.webpages = await this.collectWebpageData(competitor);
        
        // Collect video data (YouTube, etc.)
        console.log('      → Video content...');
        data.videos = await this.collectVideoData(competitor);
        
        // Collect pricing data
        console.log('      → Pricing information...');
        data.pricing = await this.collectPricingData(competitor);
        
        this.collectedData.set(competitor.id, data);
        console.log(`      ✓ Collection complete\n`);
      }
      
      this.completePhase(phase, { 
        totalCompetitors: this.competitors.length,
        dataCollected: this.collectedData.size,
      });
      
    } catch (error) {
      this.failPhase(phase, error);
      throw error;
    }
  }

  /**
   * PHASE 3: ANALYSIS
   * AI-powered analysis of collected data
   */
  private async runPhase3Analysis(): Promise<void> {
    const phase = CIPhase.ANALYSIS;
    this.startPhase(phase);
    
    console.log('\n🔬 PHASE 3: ANALYSIS');
    console.log('   Running AI-powered analysis...\n');
    
    try {
      for (const [competitorId, data] of this.collectedData) {
        console.log(`   🤖 Analyzing: ${data.competitor.name}`);
        
        // Extract features using Kimi K2.5
        console.log('      → Extracting features...');
        const features = await this.extractFeatures(data);
        
        // Analyze UI patterns
        console.log('      → Analyzing UI patterns...');
        const uiPatterns = await this.analyzeUIPatterns(data);
        
        // Analyze pricing
        console.log('      → Analyzing pricing...');
        const pricingAnalysis = await this.analyzePricing(data);
        
        // Determine market position
        console.log('      → Determining market position...');
        const marketPosition = await this.analyzeMarketPosition(data);
        
        // SWOT analysis
        console.log('      → Running SWOT analysis...');
        const swot = await this.runSWOTAnalysis(data, features);
        
        const result: AnalysisResult = {
          competitor: data.competitor,
          features,
          ui_patterns: uiPatterns,
          pricing_analysis: pricingAnalysis,
          market_position: marketPosition,
          strengths: swot.strengths,
          weaknesses: swot.weaknesses,
          opportunities: swot.opportunities,
          threats: swot.threats,
        };
        
        this.analysisResults.set(competitorId, result);
        console.log(`      ✓ Analysis complete\n`);
      }
      
      this.completePhase(phase, {
        competitorsAnalyzed: this.analysisResults.size,
      });
      
    } catch (error) {
      this.failPhase(phase, error);
      throw error;
    }
  }

  /**
   * PHASE 4: SYNTHESIS
   * Generate reports, battle cards, and clone blueprints
   */
  private async runPhase4Synthesis(): Promise<{
    fullReport: any;
    battleCards: any[];
    cloneBlueprints: any[];
  }> {
    const phase = CIPhase.SYNTHESIS;
    this.startPhase(phase);
    
    console.log('\n📝 PHASE 4: SYNTHESIS');
    console.log('   Generating deliverables...\n');
    
    try {
      const analysisArray = Array.from(this.analysisResults.values());
      
      // Generate Full Report
      console.log('   📄 Generating Full CI Report...');
      const fullReport = await this.fullReportGen.generate({
        competitors: this.competitors,
        analyses: analysisArray,
        collectedData: Array.from(this.collectedData.values()),
      });
      console.log('      ✓ Full report generated\n');
      
      // Generate Battle Cards
      console.log('   ⚔️ Generating Battle Cards...');
      const battleCards = [];
      for (const analysis of analysisArray) {
        const card = await this.battleCardGen.generate(analysis);
        battleCards.push(card);
        console.log(`      ✓ Battle card: ${analysis.competitor.name}`);
      }
      console.log('');
      
      // Generate Clone Blueprints
      console.log('   🔧 Generating Clone Blueprints...');
      const cloneBlueprints = [];
      for (const analysis of analysisArray) {
        const blueprint = await this.cloneBlueprintGen.generate(analysis);
        cloneBlueprints.push(blueprint);
        console.log(`      ✓ Clone blueprint: ${analysis.competitor.name}`);
      }
      console.log('');
      
      this.completePhase(phase, {
        fullReport: true,
        battleCards: battleCards.length,
        cloneBlueprints: cloneBlueprints.length,
      });
      
      return { fullReport, battleCards, cloneBlueprints };
      
    } catch (error) {
      this.failPhase(phase, error);
      throw error;
    }
  }

  /**
   * PHASE 5: ACTION
   * Strategic recommendations and implementation roadmap
   */
  private async runPhase5Action(): Promise<any> {
    const phase = CIPhase.ACTION;
    this.startPhase(phase);
    
    console.log('\n🎯 PHASE 5: ACTION');
    console.log('   Creating strategic recommendations...\n');
    
    try {
      const analysisArray = Array.from(this.analysisResults.values());
      
      // Generate prioritized feature roadmap
      console.log('   📋 Generating feature roadmap...');
      const featureRoadmap = await this.generateFeatureRoadmap(analysisArray);
      
      // Generate competitive positioning strategy
      console.log('   📍 Generating positioning strategy...');
      const positioningStrategy = await this.generatePositioningStrategy(analysisArray);
      
      // Generate implementation timeline
      console.log('   📅 Generating implementation timeline...');
      const timeline = await this.generateImplementationTimeline(featureRoadmap);
      
      // Generate quick wins
      console.log('   ⚡ Identifying quick wins...');
      const quickWins = await this.identifyQuickWins(analysisArray);
      
      const actionPlan = {
        featureRoadmap,
        positioningStrategy,
        timeline,
        quickWins,
        generatedAt: new Date().toISOString(),
      };
      
      this.completePhase(phase, actionPlan);
      
      console.log('\n   📊 Action Plan Summary:');
      console.log(`      • Features to clone: ${featureRoadmap.length}`);
      console.log(`      • Quick wins: ${quickWins.length}`);
      console.log(`      • Estimated timeline: ${timeline.totalWeeks} weeks`);
      
      return actionPlan;
      
    } catch (error) {
      this.failPhase(phase, error);
      throw error;
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private startPhase(phase: CIPhase): void {
    this.phaseResults.set(phase, {
      phase,
      status: 'running',
      startTime: new Date(),
    });
    this.emit('phaseStart', phase);
  }

  private completePhase(phase: CIPhase, data: any): void {
    const result = this.phaseResults.get(phase)!;
    result.status = 'completed';
    result.endTime = new Date();
    result.duration_ms = result.endTime.getTime() - result.startTime!.getTime();
    result.data = data;
    this.phaseResults.set(phase, result);
    this.emit('phaseComplete', phase, result);
  }

  private failPhase(phase: CIPhase, error: any): void {
    const result = this.phaseResults.get(phase)!;
    result.status = 'failed';
    result.endTime = new Date();
    result.duration_ms = result.endTime.getTime() - (result.startTime?.getTime() || Date.now());
    result.error = String(error);
    this.phaseResults.set(phase, result);
    this.emit('phaseFailed', phase, error);
  }

  private async discoverRelatedCompetitors(): Promise<Competitor[]> {
    if (!this.similarweb || this.competitors.length === 0) return [];
    
    const relatedSet = new Set<string>();
    
    for (const competitor of this.competitors) {
      const related = await this.similarweb.getSimilarSites(competitor.website);
      related.forEach(site => relatedSet.add(site));
    }
    
    return Array.from(relatedSet).map(website => ({
      id: `discovered-${website.replace(/\./g, '-')}`,
      name: website.split('.')[0],
      website: `https://${website}`,
      category: 'discovered',
    }));
  }

  private async collectSimilarWebData(competitor: Competitor): Promise<SimilarWebData | null> {
    if (!this.similarweb) return null;
    
    try {
      return await this.similarweb.getWebsiteAnalysis(competitor.website);
    } catch (error) {
      console.log(`      ⚠️ SimilarWeb data unavailable`);
      return null;
    }
  }

  private async collectWebpageData(competitor: Competitor): Promise<WebpageData[]> {
    const pages: WebpageData[] = [];
    const pagesToCollect = ['', '/features', '/pricing', '/about', '/product'];
    
    for (const path of pagesToCollect) {
      try {
        const url = `${competitor.website}${path}`;
        const response = await fetch(url);
        if (response.ok) {
          const content = await response.text();
          pages.push({
            url,
            title: this.extractTitle(content),
            content: content.substring(0, 50000), // Limit content size
            features_mentioned: this.extractFeatureMentions(content),
            pricing_found: content.toLowerCase().includes('pricing') || content.includes('$'),
          });
        }
      } catch (error) {
        // Skip failed pages
      }
    }
    
    return pages;
  }

  private async collectVideoData(competitor: Competitor): Promise<VideoData[]> {
    // Search YouTube for competitor videos
    const videos: VideoData[] = [];
    
    // Placeholder - would integrate with YouTube API
    // For now, return empty array
    
    return videos;
  }

  private async collectPricingData(competitor: Competitor): Promise<PricingData | null> {
    try {
      const pricingUrl = `${competitor.website}/pricing`;
      const response = await fetch(pricingUrl);
      
      if (!response.ok) return null;
      
      const content = await response.text();
      
      // Use AI to extract pricing
      const analysis = await this.nvidiaNim.analyzeText(content, {
        task: 'extract_pricing',
        outputFormat: 'json',
      });
      
      return analysis as PricingData;
    } catch (error) {
      return null;
    }
  }

  private async extractFeatures(data: CollectedData): Promise<ExtractedFeature[]> {
    const allContent = data.webpages.map(p => p.content).join('\n\n');
    
    const prompt = `Analyze this competitor website content and extract ALL features mentioned.
For each feature, determine:
- name: Feature name
- description: What it does
- category: core/analytics/reporting/integration/platform
- complexity: 1-5 (development complexity)
- priority: critical/high/medium/low (for a foreclosure auction platform)
- clone_difficulty: easy/medium/hard/very_hard
- estimated_dev_days: Rough estimate

Competitor: ${data.competitor.name}
Website: ${data.competitor.website}

Content:
${allContent.substring(0, 30000)}

Return as JSON array of features.`;

    const result = await this.nvidiaNim.analyzeText(prompt, {
      task: 'feature_extraction',
      outputFormat: 'json',
    });
    
    return result.features || [];
  }

  private async analyzeUIPatterns(data: CollectedData): Promise<UIPattern[]> {
    // Analyze screenshots and webpage structure
    return [];
  }

  private async analyzePricing(data: CollectedData): Promise<PricingAnalysis> {
    if (!data.pricing) {
      return {
        pricing_model: 'subscription',
        avg_price_monthly: 0,
        price_vs_market: 'at',
        value_proposition: 'Unknown',
      };
    }
    
    const avgPrice = data.pricing.tiers.reduce((sum, t) => sum + t.price, 0) / data.pricing.tiers.length;
    
    return {
      pricing_model: data.pricing.has_free_tier ? 'freemium' : 'subscription',
      avg_price_monthly: avgPrice,
      price_vs_market: avgPrice > 100 ? 'above' : avgPrice < 30 ? 'below' : 'at',
      value_proposition: data.pricing.tiers[0]?.features.join(', ') || 'Unknown',
    };
  }

  private async analyzeMarketPosition(data: CollectedData): Promise<MarketPosition> {
    const prompt = `Based on this competitor data, determine their market position:
    
Competitor: ${data.competitor.name}
Website: ${data.competitor.website}
SimilarWeb Traffic: ${data.similarweb?.total_visits || 'Unknown'}
Pricing: ${JSON.stringify(data.pricing)}

Determine:
1. segment: enterprise/mid-market/smb/consumer
2. positioning: Their market positioning statement
3. target_audience: List of target audiences
4. unique_selling_points: Their USPs

Return as JSON.`;

    const result = await this.nvidiaNim.analyzeText(prompt, {
      task: 'market_position',
      outputFormat: 'json',
    });
    
    return result as MarketPosition;
  }

  private async runSWOTAnalysis(data: CollectedData, features: ExtractedFeature[]): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }> {
    const prompt = `Perform SWOT analysis for this competitor relative to BidDeed.AI (a foreclosure auction intelligence platform):

Competitor: ${data.competitor.name}
Features: ${features.map(f => f.name).join(', ')}
Traffic: ${data.similarweb?.total_visits || 'Unknown'} monthly visits
Pricing: ${JSON.stringify(data.pricing)}

BidDeed.AI has: ML predictions, lien discovery, max bid calculator, one-page reports, multi-county support.

Return as JSON with arrays: strengths, weaknesses, opportunities, threats`;

    const result = await this.nvidiaNim.analyzeText(prompt, {
      task: 'swot_analysis',
      outputFormat: 'json',
    });
    
    return result;
  }

  private async generateFeatureRoadmap(analyses: AnalysisResult[]): Promise<any[]> {
    // Aggregate all features and prioritize
    const allFeatures: ExtractedFeature[] = [];
    analyses.forEach(a => allFeatures.push(...a.features));
    
    // Deduplicate and prioritize
    const uniqueFeatures = new Map<string, ExtractedFeature>();
    allFeatures.forEach(f => {
      if (!uniqueFeatures.has(f.name) || f.priority === 'critical') {
        uniqueFeatures.set(f.name, f);
      }
    });
    
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return Array.from(uniqueFeatures.values())
      .filter(f => !f.biddeed_has)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private async generatePositioningStrategy(analyses: AnalysisResult[]): Promise<any> {
    const prompt = `Based on these competitor analyses, recommend a positioning strategy for BidDeed.AI:

${analyses.map(a => `${a.competitor.name}: ${a.market_position.positioning}`).join('\n')}

BidDeed.AI differentiators: ML predictions, lien discovery automation, max bid calculator, agentic AI platform.

Recommend positioning that differentiates from competitors.`;

    return await this.nvidiaNim.analyzeText(prompt, {
      task: 'positioning_strategy',
      outputFormat: 'json',
    });
  }

  private async generateImplementationTimeline(roadmap: any[]): Promise<any> {
    const totalDays = roadmap.reduce((sum, f) => sum + (f.estimated_dev_days || 5), 0);
    
    return {
      totalWeeks: Math.ceil(totalDays / 5),
      phases: [
        { name: 'Quick Wins', weeks: 2, features: roadmap.filter(f => f.clone_difficulty === 'easy') },
        { name: 'Core Features', weeks: 4, features: roadmap.filter(f => f.clone_difficulty === 'medium') },
        { name: 'Advanced Features', weeks: 6, features: roadmap.filter(f => f.clone_difficulty === 'hard') },
      ],
    };
  }

  private async identifyQuickWins(analyses: AnalysisResult[]): Promise<any[]> {
    const quickWins: any[] = [];
    
    analyses.forEach(a => {
      a.features
        .filter(f => !f.biddeed_has && f.clone_difficulty === 'easy' && (f.priority === 'critical' || f.priority === 'high'))
        .forEach(f => quickWins.push({
          feature: f.name,
          competitor: a.competitor.name,
          estimated_days: f.estimated_dev_days || 2,
          impact: f.priority,
        }));
    });
    
    return quickWins.slice(0, 10); // Top 10 quick wins
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1] : 'Unknown';
  }

  private extractFeatureMentions(content: string): string[] {
    const featureKeywords = [
      'auction', 'foreclosure', 'property', 'analysis', 'report', 'alert',
      'notification', 'search', 'filter', 'map', 'data', 'analytics',
      'dashboard', 'export', 'api', 'integration', 'mobile', 'app'
    ];
    
    return featureKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  private async storePipelineResults(totalDuration: number): Promise<void> {
    await this.supabase.from('ci_pipeline_runs').insert({
      phases: Object.fromEntries(this.phaseResults),
      competitors_analyzed: this.competitors.length,
      total_duration_ms: totalDuration,
      timestamp: new Date().toISOString(),
    });
  }
}

export default FivePhasePipeline;
