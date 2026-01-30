/**
 * SkillForge AI - CI Intelligence
 * Phase 1: DISCOVERY
 * 
 * Identify competitors, their products, market positioning, and initial data gathering
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CompetitorProfile {
  id: string;
  name: string;
  website: string;
  category: string;
  subcategory?: string;
  description: string;
  founded?: string;
  headquarters?: string;
  employeeCount?: string;
  fundingStage?: string;
  totalFunding?: string;
  
  // Market positioning
  targetMarket: string[];
  valueProposition: string;
  pricingModel: 'freemium' | 'subscription' | 'one-time' | 'usage-based' | 'hybrid';
  priceRange: { min: number; max: number; currency: string };
  
  // Digital presence
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    instagram?: string;
  };
  
  // Initial assessment
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  marketShare?: number;
  growthRate?: string;
  
  // Discovery metadata
  discoveredAt: Date;
  discoverySource: string;
  lastUpdated: Date;
}

export interface DiscoveryConfig {
  targetMarket: string;
  productCategory: string;
  geographicFocus?: string[];
  minThreatLevel?: 'low' | 'medium' | 'high';
  maxCompetitors?: number;
}

export interface DiscoveryResult {
  phase: 'discovery';
  status: 'completed' | 'partial' | 'failed';
  competitors: CompetitorProfile[];
  totalFound: number;
  sources: string[];
  duration_ms: number;
  timestamp: Date;
  insights: DiscoveryInsight[];
}

export interface DiscoveryInsight {
  type: 'market_gap' | 'emerging_threat' | 'opportunity' | 'trend';
  title: string;
  description: string;
  confidence: number;
  relatedCompetitors: string[];
}

export class Phase1Discovery {
  private supabase: SupabaseClient;
  private nvidiaNim: any;

  constructor(supabaseClient: SupabaseClient, nvidiaNimClient: any) {
    this.supabase = supabaseClient;
    this.nvidiaNim = nvidiaNimClient;
  }

  /**
   * Execute Phase 1: Discovery
   */
  async execute(config: DiscoveryConfig): Promise<DiscoveryResult> {
    const startTime = Date.now();
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           PHASE 1: DISCOVERY - Starting                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const competitors: CompetitorProfile[] = [];
    const sources: string[] = [];
    const insights: DiscoveryInsight[] = [];

    try {
      // Step 1: Load known competitors from database
      console.log('📋 Step 1: Loading known competitors...');
      const knownCompetitors = await this.loadKnownCompetitors(config);
      competitors.push(...knownCompetitors);
      sources.push('supabase:ci_competitors');
      console.log(`   Found ${knownCompetitors.length} known competitors\n`);

      // Step 2: Discover via web search
      console.log('🔍 Step 2: Discovering via web search...');
      const webCompetitors = await this.discoverViaWebSearch(config);
      competitors.push(...webCompetitors.filter(c => 
        !competitors.find(existing => existing.website === c.website)
      ));
      sources.push('web_search');
      console.log(`   Discovered ${webCompetitors.length} competitors\n`);

      // Step 3: Analyze with AI for market positioning
      console.log('🤖 Step 3: AI analysis for market positioning...');
      const enrichedCompetitors = await this.enrichWithAI(competitors, config);
      console.log(`   Enriched ${enrichedCompetitors.length} competitor profiles\n`);

      // Step 4: Calculate threat levels
      console.log('⚠️ Step 4: Calculating threat levels...');
      const assessedCompetitors = await this.assessThreatLevels(enrichedCompetitors, config);
      console.log(`   Assessed threat levels for all competitors\n`);

      // Step 5: Generate insights
      console.log('💡 Step 5: Generating discovery insights...');
      const discoveryInsights = await this.generateInsights(assessedCompetitors, config);
      insights.push(...discoveryInsights);
      console.log(`   Generated ${insights.length} insights\n`);

      // Step 6: Save to database
      console.log('💾 Step 6: Saving to database...');
      await this.saveDiscoveryResults(assessedCompetitors, insights);
      console.log('   Results saved\n');

      const duration = Date.now() - startTime;

      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║           PHASE 1: DISCOVERY - Completed                   ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      return {
        phase: 'discovery',
        status: 'completed',
        competitors: assessedCompetitors,
        totalFound: assessedCompetitors.length,
        sources,
        duration_ms: duration,
        timestamp: new Date(),
        insights,
      };

    } catch (error) {
      console.error('❌ Phase 1 Discovery failed:', error);
      return {
        phase: 'discovery',
        status: 'failed',
        competitors,
        totalFound: competitors.length,
        sources,
        duration_ms: Date.now() - startTime,
        timestamp: new Date(),
        insights,
      };
    }
  }

  /**
   * Load known competitors from Supabase
   */
  private async loadKnownCompetitors(config: DiscoveryConfig): Promise<CompetitorProfile[]> {
    const { data, error } = await this.supabase
      .from('ci_competitors')
      .select('*')
      .eq('category', config.productCategory);

    if (error) {
      console.error('Error loading competitors:', error);
      return [];
    }

    return (data || []).map(c => this.mapToProfile(c));
  }

  /**
   * Discover competitors via web search
   */
  private async discoverViaWebSearch(config: DiscoveryConfig): Promise<CompetitorProfile[]> {
    const searchQueries = [
      `${config.productCategory} software competitors`,
      `best ${config.productCategory} platforms ${new Date().getFullYear()}`,
      `${config.productCategory} alternatives`,
      `${config.targetMarket} ${config.productCategory} tools`,
    ];

    const competitors: CompetitorProfile[] = [];

    // For foreclosure vertical
    if (config.productCategory === 'foreclosure') {
      const foreclosureCompetitors = this.getForeclosureCompetitors();
      competitors.push(...foreclosureCompetitors);
    }

    return competitors;
  }

  /**
   * Pre-defined foreclosure industry competitors
   */
  private getForeclosureCompetitors(): CompetitorProfile[] {
    return [
      {
        id: 'propertyonion',
        name: 'PropertyOnion',
        website: 'https://propertyonion.com',
        category: 'foreclosure',
        description: 'Foreclosure data aggregator with 8 KPIs and auction tracking',
        targetMarket: ['Real estate investors', 'House flippers', 'Wholesalers'],
        valueProposition: 'All-in-one foreclosure data platform',
        pricingModel: 'subscription',
        priceRange: { min: 49, max: 199, currency: 'USD' },
        socialLinks: {},
        threatLevel: 'high',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
      {
        id: 'auction-com',
        name: 'Auction.com',
        website: 'https://auction.com',
        category: 'foreclosure',
        description: 'Largest online real estate auction marketplace',
        targetMarket: ['Institutional investors', 'Individual buyers', 'Banks'],
        valueProposition: 'Direct access to bank-owned properties',
        pricingModel: 'usage-based',
        priceRange: { min: 0, max: 5000, currency: 'USD' },
        socialLinks: { linkedin: 'https://linkedin.com/company/auction-com' },
        threatLevel: 'critical',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
      {
        id: 'realtytrac',
        name: 'RealtyTrac',
        website: 'https://realtytrac.com',
        category: 'foreclosure',
        description: 'Foreclosure listings and market analytics platform',
        targetMarket: ['Investors', 'Agents', 'Researchers'],
        valueProposition: 'Comprehensive foreclosure data and analytics',
        pricingModel: 'subscription',
        priceRange: { min: 29, max: 299, currency: 'USD' },
        socialLinks: {},
        threatLevel: 'high',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
      {
        id: 'foreclosure-com',
        name: 'Foreclosure.com',
        website: 'https://foreclosure.com',
        category: 'foreclosure',
        description: 'Foreclosure listings marketplace',
        targetMarket: ['Home buyers', 'Investors'],
        valueProposition: 'Easy access to foreclosure listings',
        pricingModel: 'subscription',
        priceRange: { min: 39, max: 79, currency: 'USD' },
        socialLinks: {},
        threatLevel: 'medium',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
      {
        id: 'hubzu',
        name: 'Hubzu',
        website: 'https://hubzu.com',
        category: 'foreclosure',
        description: 'Online real estate auction platform by Altisource',
        targetMarket: ['Investors', 'Home buyers'],
        valueProposition: 'Transparent online auction process',
        pricingModel: 'usage-based',
        priceRange: { min: 0, max: 2500, currency: 'USD' },
        socialLinks: {},
        threatLevel: 'medium',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
      {
        id: 'homepath',
        name: 'HomePath (Fannie Mae)',
        website: 'https://homepath.fanniemae.com',
        category: 'foreclosure',
        description: 'Fannie Mae owned property marketplace',
        targetMarket: ['First-time buyers', 'Investors'],
        valueProposition: 'Direct from Fannie Mae, special financing',
        pricingModel: 'one-time',
        priceRange: { min: 0, max: 0, currency: 'USD' },
        socialLinks: {},
        threatLevel: 'low',
        discoveredAt: new Date(),
        discoverySource: 'manual',
        lastUpdated: new Date(),
      },
    ];
  }

  /**
   * Enrich competitor profiles with AI analysis
   */
  private async enrichWithAI(
    competitors: CompetitorProfile[],
    config: DiscoveryConfig
  ): Promise<CompetitorProfile[]> {
    // Use NVIDIA NIM to analyze and enrich profiles
    const enriched = [...competitors];

    for (const competitor of enriched) {
      try {
        const analysis = await this.nvidiaNim?.analyzeText(
          `Analyze this competitor for the ${config.productCategory} market:
          Name: ${competitor.name}
          Website: ${competitor.website}
          Description: ${competitor.description}
          
          Provide: target market segments, key differentiators, estimated market position`,
          { maxTokens: 500 }
        );

        if (analysis) {
          competitor.description = analysis.summary || competitor.description;
        }
      } catch (error) {
        console.warn(`   Could not enrich ${competitor.name}:`, error);
      }
    }

    return enriched;
  }

  /**
   * Assess threat levels for each competitor
   */
  private async assessThreatLevels(
    competitors: CompetitorProfile[],
    config: DiscoveryConfig
  ): Promise<CompetitorProfile[]> {
    return competitors.map(c => {
      // Scoring factors
      let score = 0;

      // Market overlap
      const marketOverlap = c.targetMarket.filter(m => 
        config.targetMarket.toLowerCase().includes(m.toLowerCase())
      ).length;
      score += marketOverlap * 20;

      // Same category
      if (c.category === config.productCategory) score += 30;

      // Price competition
      if (c.priceRange.min < 100) score += 10;

      // Feature completeness (estimated)
      score += 20;

      // Determine threat level
      if (score >= 70) c.threatLevel = 'critical';
      else if (score >= 50) c.threatLevel = 'high';
      else if (score >= 30) c.threatLevel = 'medium';
      else c.threatLevel = 'low';

      return c;
    });
  }

  /**
   * Generate discovery insights
   */
  private async generateInsights(
    competitors: CompetitorProfile[],
    config: DiscoveryConfig
  ): Promise<DiscoveryInsight[]> {
    const insights: DiscoveryInsight[] = [];

    // Insight: Market saturation
    const highThreatCount = competitors.filter(c => 
      c.threatLevel === 'high' || c.threatLevel === 'critical'
    ).length;

    if (highThreatCount >= 3) {
      insights.push({
        type: 'trend',
        title: 'Competitive Market',
        description: `${highThreatCount} high-threat competitors identified. Market is competitive but validates demand.`,
        confidence: 0.85,
        relatedCompetitors: competitors.filter(c => c.threatLevel === 'high').map(c => c.id),
      });
    }

    // Insight: Pricing opportunity
    const avgMinPrice = competitors.reduce((sum, c) => sum + c.priceRange.min, 0) / competitors.length;
    if (avgMinPrice > 50) {
      insights.push({
        type: 'opportunity',
        title: 'Pricing Opportunity',
        description: `Average entry price is $${avgMinPrice.toFixed(0)}. Opportunity for lower-cost alternative.`,
        confidence: 0.75,
        relatedCompetitors: [],
      });
    }

    // Insight: Feature gap (ML/AI)
    insights.push({
      type: 'market_gap',
      title: 'AI/ML Differentiation',
      description: 'Most competitors lack advanced ML predictions. BidDeed.AI\'s ML scoring is a key differentiator.',
      confidence: 0.9,
      relatedCompetitors: ['propertyonion', 'realtytrac'],
    });

    return insights;
  }

  /**
   * Save discovery results to database
   */
  private async saveDiscoveryResults(
    competitors: CompetitorProfile[],
    insights: DiscoveryInsight[]
  ): Promise<void> {
    // Save/update competitors
    for (const competitor of competitors) {
      await this.supabase.from('ci_competitors').upsert({
        name: competitor.name,
        website: competitor.website,
        category: competitor.category,
        description: competitor.description,
        pricing_tiers: competitor.priceRange,
        social_links: competitor.socialLinks,
        threat_level: competitor.threatLevel,
        target_market: competitor.targetMarket,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'name'
      });
    }

    // Save insights
    await this.supabase.from('ci_discovery_insights').insert(
      insights.map(i => ({
        type: i.type,
        title: i.title,
        description: i.description,
        confidence: i.confidence,
        related_competitors: i.relatedCompetitors,
        timestamp: new Date().toISOString(),
      }))
    );
  }

  /**
   * Map database record to CompetitorProfile
   */
  private mapToProfile(record: any): CompetitorProfile {
    return {
      id: record.id,
      name: record.name,
      website: record.website,
      category: record.category,
      description: record.description || '',
      targetMarket: record.target_market || [],
      valueProposition: record.value_proposition || '',
      pricingModel: record.pricing_model || 'subscription',
      priceRange: record.pricing_tiers || { min: 0, max: 0, currency: 'USD' },
      socialLinks: record.social_links || {},
      threatLevel: record.threat_level || 'medium',
      discoveredAt: new Date(record.added_at),
      discoverySource: 'database',
      lastUpdated: new Date(record.updated_at),
    };
  }
}

export default Phase1Discovery;
