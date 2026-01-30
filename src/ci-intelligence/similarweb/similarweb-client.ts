/**
 * SkillForge AI - CI Intelligence
 * SimilarWeb Integration
 * 
 * Traffic analysis, audience demographics, and market intelligence
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface SimilarWebConfig {
  apiKey?: string;
  useFreeEstimates: boolean;
}

export interface TrafficAnalysis {
  domain: string;
  period: string;
  
  // Traffic metrics
  totalVisits: number;
  monthlyGrowth: number;
  avgVisitDuration: number;
  pagesPerVisit: number;
  bounceRate: number;
  
  // Traffic sources
  trafficSources: TrafficSources;
  
  // Geographic distribution
  topCountries: CountryTraffic[];
  
  // Audience
  audienceInterests: string[];
  audienceDemographics: Demographics;
  
  // Competitors
  similarSites: SimilarSite[];
  
  // Keywords
  organicKeywords: KeywordData[];
  paidKeywords: KeywordData[];
  
  // Metadata
  dataQuality: 'estimated' | 'verified';
  lastUpdated: Date;
}

export interface TrafficSources {
  direct: number;
  referral: number;
  search: number;
  social: number;
  mail: number;
  display: number;
}

export interface CountryTraffic {
  country: string;
  countryCode: string;
  percentage: number;
  visits: number;
}

export interface Demographics {
  genderSplit: { male: number; female: number };
  ageDistribution: AgeGroup[];
}

export interface AgeGroup {
  range: string;
  percentage: number;
}

export interface SimilarSite {
  domain: string;
  similarity: number;
  category: string;
}

export interface KeywordData {
  keyword: string;
  volume: number;
  position?: number;
  traffic: number;
  cpc?: number;
}

export interface CompetitorBenchmark {
  competitors: CompetitorMetrics[];
  marketLeader: string;
  averageMetrics: AverageMetrics;
  ourPosition: number;
  gaps: BenchmarkGap[];
}

export interface CompetitorMetrics {
  domain: string;
  name: string;
  monthlyVisits: number;
  marketShare: number;
  growthRate: number;
  engagementScore: number;
}

export interface AverageMetrics {
  avgVisits: number;
  avgBounceRate: number;
  avgPagesPerVisit: number;
  avgVisitDuration: number;
}

export interface BenchmarkGap {
  metric: string;
  ourValue: number;
  leaderValue: number;
  gap: number;
  recommendation: string;
}

export class SimilarWebClient {
  private config: SimilarWebConfig;
  private supabase: SupabaseClient;
  private cache: Map<string, TrafficAnalysis> = new Map();

  constructor(config: SimilarWebConfig, supabase: SupabaseClient) {
    this.config = config;
    this.supabase = supabase;
  }

  /**
   * Analyze website traffic
   */
  async analyzeTraffic(domain: string): Promise<TrafficAnalysis> {
    console.log(`📊 Analyzing traffic for: ${domain}`);

    // Check cache
    const cached = this.cache.get(domain);
    if (cached && this.isCacheValid(cached)) {
      console.log('   Using cached data');
      return cached;
    }

    // Use API if configured, otherwise use estimates
    let analysis: TrafficAnalysis;
    
    if (this.config.apiKey) {
      analysis = await this.fetchFromAPI(domain);
    } else {
      analysis = await this.generateEstimates(domain);
    }

    // Cache result
    this.cache.set(domain, analysis);

    // Store in Supabase
    await this.storeAnalysis(analysis);

    return analysis;
  }

  /**
   * Fetch data from SimilarWeb API
   */
  private async fetchFromAPI(domain: string): Promise<TrafficAnalysis> {
    // Note: SimilarWeb API requires enterprise subscription
    // This would make actual API calls in production
    console.log('   Would fetch from SimilarWeb API...');
    return this.generateEstimates(domain);
  }

  /**
   * Generate traffic estimates for known competitors
   */
  private async generateEstimates(domain: string): Promise<TrafficAnalysis> {
    const cleanDomain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');
    
    // Pre-researched estimates for foreclosure competitors
    const knownData: Record<string, Partial<TrafficAnalysis>> = {
      'propertyonion.com': {
        totalVisits: 85000,
        monthlyGrowth: 5.2,
        avgVisitDuration: 4.5,
        pagesPerVisit: 6.2,
        bounceRate: 42,
        trafficSources: {
          direct: 35,
          referral: 8,
          search: 48,
          social: 5,
          mail: 3,
          display: 1,
        },
        topCountries: [
          { country: 'United States', countryCode: 'US', percentage: 92, visits: 78200 },
          { country: 'Canada', countryCode: 'CA', percentage: 3, visits: 2550 },
          { country: 'United Kingdom', countryCode: 'GB', percentage: 2, visits: 1700 },
        ],
        organicKeywords: [
          { keyword: 'foreclosure properties', volume: 14800, position: 8, traffic: 1200 },
          { keyword: 'foreclosure auctions', volume: 9900, position: 12, traffic: 600 },
          { keyword: 'propertyonion', volume: 2400, position: 1, traffic: 2200 },
          { keyword: 'florida foreclosures', volume: 6600, position: 15, traffic: 300 },
        ],
      },
      'auction.com': {
        totalVisits: 2500000,
        monthlyGrowth: 2.1,
        avgVisitDuration: 5.8,
        pagesPerVisit: 8.4,
        bounceRate: 35,
        trafficSources: {
          direct: 45,
          referral: 12,
          search: 32,
          social: 4,
          mail: 5,
          display: 2,
        },
        topCountries: [
          { country: 'United States', countryCode: 'US', percentage: 95, visits: 2375000 },
          { country: 'Canada', countryCode: 'CA', percentage: 2, visits: 50000 },
          { country: 'Mexico', countryCode: 'MX', percentage: 1, visits: 25000 },
        ],
        organicKeywords: [
          { keyword: 'auction.com', volume: 74000, position: 1, traffic: 68000 },
          { keyword: 'foreclosure homes', volume: 33100, position: 3, traffic: 15000 },
          { keyword: 'reo properties', volume: 8100, position: 5, traffic: 3000 },
          { keyword: 'bank owned homes', volume: 22200, position: 4, traffic: 8000 },
        ],
      },
      'realtytrac.com': {
        totalVisits: 450000,
        monthlyGrowth: -1.5,
        avgVisitDuration: 3.8,
        pagesPerVisit: 4.5,
        bounceRate: 52,
        trafficSources: {
          direct: 28,
          referral: 10,
          search: 55,
          social: 3,
          mail: 3,
          display: 1,
        },
        topCountries: [
          { country: 'United States', countryCode: 'US', percentage: 88, visits: 396000 },
          { country: 'Canada', countryCode: 'CA', percentage: 4, visits: 18000 },
          { country: 'India', countryCode: 'IN', percentage: 2, visits: 9000 },
        ],
        organicKeywords: [
          { keyword: 'realtytrac', volume: 18100, position: 1, traffic: 16000 },
          { keyword: 'foreclosure listings', volume: 12100, position: 6, traffic: 4000 },
          { keyword: 'foreclosure database', volume: 3600, position: 8, traffic: 800 },
        ],
      },
      'foreclosure.com': {
        totalVisits: 180000,
        monthlyGrowth: 1.8,
        avgVisitDuration: 3.2,
        pagesPerVisit: 4.1,
        bounceRate: 58,
        trafficSources: {
          direct: 22,
          referral: 6,
          search: 65,
          social: 4,
          mail: 2,
          display: 1,
        },
        topCountries: [
          { country: 'United States', countryCode: 'US', percentage: 90, visits: 162000 },
          { country: 'Canada', countryCode: 'CA', percentage: 3, visits: 5400 },
        ],
        organicKeywords: [
          { keyword: 'foreclosure.com', volume: 8100, position: 1, traffic: 7500 },
          { keyword: 'free foreclosure listings', volume: 4400, position: 4, traffic: 1500 },
        ],
      },
    };

    const data = knownData[cleanDomain] || this.getDefaultEstimates(cleanDomain);

    return {
      domain: cleanDomain,
      period: 'Last 30 days',
      totalVisits: data.totalVisits || 10000,
      monthlyGrowth: data.monthlyGrowth || 0,
      avgVisitDuration: data.avgVisitDuration || 2.5,
      pagesPerVisit: data.pagesPerVisit || 3,
      bounceRate: data.bounceRate || 55,
      trafficSources: data.trafficSources || {
        direct: 30,
        referral: 10,
        search: 50,
        social: 5,
        mail: 3,
        display: 2,
      },
      topCountries: data.topCountries || [
        { country: 'United States', countryCode: 'US', percentage: 85, visits: 8500 },
      ],
      audienceInterests: ['Real Estate', 'Investing', 'Finance'],
      audienceDemographics: {
        genderSplit: { male: 65, female: 35 },
        ageDistribution: [
          { range: '18-24', percentage: 8 },
          { range: '25-34', percentage: 22 },
          { range: '35-44', percentage: 28 },
          { range: '45-54', percentage: 24 },
          { range: '55-64', percentage: 12 },
          { range: '65+', percentage: 6 },
        ],
      },
      similarSites: this.getSimilarSites(cleanDomain),
      organicKeywords: data.organicKeywords || [],
      paidKeywords: [],
      dataQuality: 'estimated',
      lastUpdated: new Date(),
    };
  }

  /**
   * Get default estimates for unknown domains
   */
  private getDefaultEstimates(domain: string): Partial<TrafficAnalysis> {
    return {
      totalVisits: 5000,
      monthlyGrowth: 0,
      avgVisitDuration: 2.0,
      pagesPerVisit: 2.5,
      bounceRate: 60,
    };
  }

  /**
   * Get similar sites
   */
  private getSimilarSites(domain: string): SimilarSite[] {
    const foreclosureSites = [
      { domain: 'propertyonion.com', similarity: 0.85, category: 'Foreclosure Data' },
      { domain: 'auction.com', similarity: 0.72, category: 'Real Estate Auctions' },
      { domain: 'realtytrac.com', similarity: 0.78, category: 'Foreclosure Listings' },
      { domain: 'foreclosure.com', similarity: 0.82, category: 'Foreclosure Listings' },
      { domain: 'hubzu.com', similarity: 0.65, category: 'Real Estate Auctions' },
    ];

    return foreclosureSites.filter(s => s.domain !== domain);
  }

  /**
   * Check if cache is valid (less than 24 hours old)
   */
  private isCacheValid(analysis: TrafficAnalysis): boolean {
    const hoursSinceUpdate = (Date.now() - analysis.lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24;
  }

  /**
   * Generate competitor benchmark
   */
  async generateBenchmark(domains: string[]): Promise<CompetitorBenchmark> {
    console.log('📈 Generating competitor benchmark...');

    const analyses: TrafficAnalysis[] = [];
    for (const domain of domains) {
      const analysis = await this.analyzeTraffic(domain);
      analyses.push(analysis);
    }

    const competitors: CompetitorMetrics[] = analyses.map(a => ({
      domain: a.domain,
      name: this.domainToName(a.domain),
      monthlyVisits: a.totalVisits,
      marketShare: 0, // Calculated below
      growthRate: a.monthlyGrowth,
      engagementScore: this.calculateEngagement(a),
    }));

    // Calculate market share
    const totalMarket = competitors.reduce((sum, c) => sum + c.monthlyVisits, 0);
    competitors.forEach(c => {
      c.marketShare = Math.round((c.monthlyVisits / totalMarket) * 100 * 10) / 10;
    });

    // Sort by visits
    competitors.sort((a, b) => b.monthlyVisits - a.monthlyVisits);

    const averageMetrics: AverageMetrics = {
      avgVisits: Math.round(totalMarket / competitors.length),
      avgBounceRate: Math.round(analyses.reduce((sum, a) => sum + a.bounceRate, 0) / analyses.length),
      avgPagesPerVisit: Math.round(analyses.reduce((sum, a) => sum + a.pagesPerVisit, 0) / analyses.length * 10) / 10,
      avgVisitDuration: Math.round(analyses.reduce((sum, a) => sum + a.avgVisitDuration, 0) / analyses.length * 10) / 10,
    };

    // BidDeed.AI estimated position (new entrant)
    const biddeedMetrics = {
      visits: 500, // Starting out
      bounceRate: 40,
      pagesPerVisit: 7,
      visitDuration: 5.5,
    };

    const gaps: BenchmarkGap[] = [
      {
        metric: 'Monthly Traffic',
        ourValue: biddeedMetrics.visits,
        leaderValue: competitors[0].monthlyVisits,
        gap: competitors[0].monthlyVisits - biddeedMetrics.visits,
        recommendation: 'Focus on SEO and content marketing to build organic traffic',
      },
      {
        metric: 'Engagement (Pages/Visit)',
        ourValue: biddeedMetrics.pagesPerVisit,
        leaderValue: analyses[0].pagesPerVisit,
        gap: analyses[0].pagesPerVisit - biddeedMetrics.pagesPerVisit,
        recommendation: 'Strong engagement expected due to ML features - maintain with quality content',
      },
    ];

    return {
      competitors,
      marketLeader: competitors[0].domain,
      averageMetrics,
      ourPosition: competitors.length + 1, // New entrant
      gaps,
    };
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagement(analysis: TrafficAnalysis): number {
    // Weighted score: duration (40%), pages (30%), bounce inverse (30%)
    const durationScore = Math.min(analysis.avgVisitDuration / 10, 1) * 40;
    const pagesScore = Math.min(analysis.pagesPerVisit / 10, 1) * 30;
    const bounceScore = ((100 - analysis.bounceRate) / 100) * 30;
    
    return Math.round(durationScore + pagesScore + bounceScore);
  }

  /**
   * Convert domain to company name
   */
  private domainToName(domain: string): string {
    const names: Record<string, string> = {
      'propertyonion.com': 'PropertyOnion',
      'auction.com': 'Auction.com',
      'realtytrac.com': 'RealtyTrac',
      'foreclosure.com': 'Foreclosure.com',
      'hubzu.com': 'Hubzu',
    };
    return names[domain] || domain;
  }

  /**
   * Get keyword opportunities
   */
  async getKeywordOpportunities(competitors: string[]): Promise<KeywordData[]> {
    console.log('🔑 Finding keyword opportunities...');

    const allKeywords: KeywordData[] = [];
    
    for (const domain of competitors) {
      const analysis = await this.analyzeTraffic(domain);
      allKeywords.push(...analysis.organicKeywords);
    }

    // Deduplicate and sort by opportunity (volume * inverse position)
    const keywordMap = new Map<string, KeywordData>();
    
    for (const kw of allKeywords) {
      const existing = keywordMap.get(kw.keyword);
      if (!existing || kw.traffic > existing.traffic) {
        keywordMap.set(kw.keyword, kw);
      }
    }

    return Array.from(keywordMap.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }

  /**
   * Store analysis in Supabase
   */
  private async storeAnalysis(analysis: TrafficAnalysis): Promise<void> {
    await this.supabase.from('ci_traffic_analysis').upsert({
      domain: analysis.domain,
      total_visits: analysis.totalVisits,
      monthly_growth: analysis.monthlyGrowth,
      avg_visit_duration: analysis.avgVisitDuration,
      pages_per_visit: analysis.pagesPerVisit,
      bounce_rate: analysis.bounceRate,
      traffic_sources: analysis.trafficSources,
      top_countries: analysis.topCountries,
      organic_keywords: analysis.organicKeywords,
      data_quality: analysis.dataQuality,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'domain'
    });
  }
}

export default SimilarWebClient;
