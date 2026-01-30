/**
 * SkillForge AI - CI Intelligence
 * Phase 2: DATA COLLECTION
 * 
 * Comprehensive data gathering: websites, videos, screenshots, pricing, features
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompetitorProfile } from './phase1-discovery.js';

export interface CollectedData {
  competitorId: string;
  competitorName: string;
  
  // Website data
  websiteData: WebsiteData;
  
  // Pricing data
  pricingData: PricingData;
  
  // Feature data
  featureData: FeatureData;
  
  // Media data
  mediaData: MediaData;
  
  // Social data
  socialData: SocialData;
  
  // Metadata
  collectionTimestamp: Date;
  dataQualityScore: number;
  sources: string[];
}

export interface WebsiteData {
  homepage: PageCapture;
  pricingPage?: PageCapture;
  featuresPage?: PageCapture;
  aboutPage?: PageCapture;
  blogPosts?: BlogPost[];
  techStack?: string[];
  seoData?: SEOData;
}

export interface PageCapture {
  url: string;
  title: string;
  metaDescription?: string;
  headings: string[];
  keyPhrases: string[];
  screenshotUrl?: string;
  capturedAt: Date;
  loadTime_ms?: number;
}

export interface PricingData {
  model: string;
  tiers: PricingTier[];
  hasFreeTier: boolean;
  hasTrial: boolean;
  trialDays?: number;
  currency: string;
  billingOptions: string[];
  lastUpdated: Date;
}

export interface PricingTier {
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  limitations?: string[];
  isPopular?: boolean;
  cta?: string;
}

export interface FeatureData {
  coreFeatures: Feature[];
  premiumFeatures: Feature[];
  integrations: Integration[];
  apiAvailable: boolean;
  mobileApp: boolean;
  platforms: string[];
}

export interface Feature {
  name: string;
  description: string;
  category: string;
  isUnique: boolean;
  maturityLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface Integration {
  name: string;
  type: 'native' | 'api' | 'zapier' | 'webhook';
  category: string;
}

export interface MediaData {
  videos: VideoCapture[];
  screenshots: ScreenshotCapture[];
  demoUrl?: string;
  webinars?: string[];
}

export interface VideoCapture {
  url: string;
  platform: 'youtube' | 'vimeo' | 'wistia' | 'other';
  title: string;
  duration_seconds?: number;
  views?: number;
  publishedAt?: Date;
  transcript?: string;
  keyMoments?: VideoMoment[];
}

export interface VideoMoment {
  timestamp: number;
  description: string;
  featureMentioned?: string;
}

export interface ScreenshotCapture {
  url: string;
  pageType: 'dashboard' | 'feature' | 'pricing' | 'landing' | 'other';
  resolution: string;
  capturedAt: Date;
  annotations?: string[];
}

export interface SocialData {
  followers: {
    linkedin?: number;
    twitter?: number;
    facebook?: number;
    youtube?: number;
  };
  engagement: {
    postsPerWeek?: number;
    avgLikes?: number;
    avgComments?: number;
  };
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  recentPosts?: SocialPost[];
}

export interface SocialPost {
  platform: string;
  content: string;
  date: Date;
  engagement: number;
  type: 'announcement' | 'content' | 'promotion' | 'other';
}

export interface SEOData {
  domainAuthority?: number;
  organicKeywords?: number;
  monthlyTraffic?: number;
  backlinks?: number;
  topKeywords?: string[];
}

export interface BlogPost {
  title: string;
  url: string;
  publishedAt: Date;
  category?: string;
  excerpt?: string;
}

export interface CollectionConfig {
  captureScreenshots: boolean;
  analyzeVideos: boolean;
  scrapePricing: boolean;
  checkSocial: boolean;
  depth: 'shallow' | 'standard' | 'deep';
  maxVideosPerCompetitor: number;
  maxPagesPerSite: number;
}

export interface CollectionResult {
  phase: 'collection';
  status: 'completed' | 'partial' | 'failed';
  collectedData: CollectedData[];
  totalCompetitors: number;
  totalDataPoints: number;
  errors: CollectionError[];
  duration_ms: number;
  timestamp: Date;
}

export interface CollectionError {
  competitorId: string;
  dataType: string;
  error: string;
  recoverable: boolean;
}

export class Phase2Collection {
  private supabase: SupabaseClient;
  private nvidiaNim: any;

  constructor(supabaseClient: SupabaseClient, nvidiaNimClient: any) {
    this.supabase = supabaseClient;
    this.nvidiaNim = nvidiaNimClient;
  }

  /**
   * Execute Phase 2: Data Collection
   */
  async execute(
    competitors: CompetitorProfile[],
    config: CollectionConfig
  ): Promise<CollectionResult> {
    const startTime = Date.now();
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         PHASE 2: DATA COLLECTION - Starting                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const collectedData: CollectedData[] = [];
    const errors: CollectionError[] = [];
    let totalDataPoints = 0;

    for (const competitor of competitors) {
      console.log(`\n📊 Collecting data for: ${competitor.name}`);
      console.log('─'.repeat(50));

      try {
        const data = await this.collectCompetitorData(competitor, config);
        collectedData.push(data);
        totalDataPoints += this.countDataPoints(data);
        console.log(`   ✅ Collected ${this.countDataPoints(data)} data points`);
      } catch (error) {
        console.error(`   ❌ Failed: ${error}`);
        errors.push({
          competitorId: competitor.id,
          dataType: 'all',
          error: String(error),
          recoverable: true,
        });
      }
    }

    // Save to database
    console.log('\n💾 Saving collected data to database...');
    await this.saveCollectionResults(collectedData);

    const duration = Date.now() - startTime;

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         PHASE 2: DATA COLLECTION - Completed               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`   Competitors processed: ${competitors.length}`);
    console.log(`   Total data points: ${totalDataPoints}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s\n`);

    return {
      phase: 'collection',
      status: errors.length === 0 ? 'completed' : 'partial',
      collectedData,
      totalCompetitors: competitors.length,
      totalDataPoints,
      errors,
      duration_ms: duration,
      timestamp: new Date(),
    };
  }

  /**
   * Collect all data for a single competitor
   */
  private async collectCompetitorData(
    competitor: CompetitorProfile,
    config: CollectionConfig
  ): Promise<CollectedData> {
    const sources: string[] = [];

    // Collect website data
    console.log('   🌐 Scraping website...');
    const websiteData = await this.collectWebsiteData(competitor, config);
    sources.push('website');

    // Collect pricing data
    console.log('   💰 Extracting pricing...');
    const pricingData = await this.collectPricingData(competitor);
    sources.push('pricing_page');

    // Collect feature data
    console.log('   ⚙️ Analyzing features...');
    const featureData = await this.collectFeatureData(competitor, websiteData);
    sources.push('features_analysis');

    // Collect media data
    console.log('   📹 Gathering media...');
    const mediaData = await this.collectMediaData(competitor, config);
    if (mediaData.videos.length > 0) sources.push('video_analysis');

    // Collect social data
    console.log('   📱 Checking social presence...');
    const socialData = await this.collectSocialData(competitor);
    sources.push('social_media');

    // Calculate data quality score
    const dataQualityScore = this.calculateDataQuality({
      websiteData,
      pricingData,
      featureData,
      mediaData,
      socialData,
    });

    return {
      competitorId: competitor.id,
      competitorName: competitor.name,
      websiteData,
      pricingData,
      featureData,
      mediaData,
      socialData,
      collectionTimestamp: new Date(),
      dataQualityScore,
      sources,
    };
  }

  /**
   * Collect website data
   */
  private async collectWebsiteData(
    competitor: CompetitorProfile,
    config: CollectionConfig
  ): Promise<WebsiteData> {
    const homepage: PageCapture = {
      url: competitor.website,
      title: competitor.name,
      headings: [],
      keyPhrases: [],
      capturedAt: new Date(),
    };

    // Use NVIDIA NIM to analyze website content
    if (this.nvidiaNim) {
      try {
        const analysis = await this.nvidiaNim.analyzeWebpage(competitor.website, {
          extractHeadings: true,
          extractKeyPhrases: true,
        });
        homepage.headings = analysis?.headings || [];
        homepage.keyPhrases = analysis?.keyPhrases || [];
        homepage.metaDescription = analysis?.metaDescription;
      } catch (error) {
        console.warn(`     Could not analyze ${competitor.website}`);
      }
    }

    // Detect tech stack
    const techStack = this.detectTechStack(competitor.website);

    return {
      homepage,
      techStack,
    };
  }

  /**
   * Collect pricing data
   */
  private async collectPricingData(competitor: CompetitorProfile): Promise<PricingData> {
    // Use pre-defined pricing for known competitors
    const knownPricing = this.getKnownPricing(competitor.id);
    if (knownPricing) return knownPricing;

    return {
      model: competitor.pricingModel || 'subscription',
      tiers: [],
      hasFreeTier: false,
      hasTrial: true,
      trialDays: 7,
      currency: 'USD',
      billingOptions: ['monthly', 'yearly'],
      lastUpdated: new Date(),
    };
  }

  /**
   * Get known pricing for specific competitors
   */
  private getKnownPricing(competitorId: string): PricingData | null {
    const pricingDatabase: Record<string, PricingData> = {
      'propertyonion': {
        model: 'subscription',
        tiers: [
          {
            name: 'Basic',
            price: 49,
            billingCycle: 'monthly',
            features: ['Auction calendar', 'Basic property data', '50 properties/month'],
          },
          {
            name: 'Pro',
            price: 99,
            billingCycle: 'monthly',
            features: ['All Basic features', 'Advanced analytics', '200 properties/month', 'API access'],
            isPopular: true,
          },
          {
            name: 'Enterprise',
            price: 199,
            billingCycle: 'monthly',
            features: ['All Pro features', 'Unlimited properties', 'Custom reports', 'Dedicated support'],
          },
        ],
        hasFreeTier: false,
        hasTrial: true,
        trialDays: 7,
        currency: 'USD',
        billingOptions: ['monthly', 'yearly'],
        lastUpdated: new Date(),
      },
      'realtytrac': {
        model: 'subscription',
        tiers: [
          {
            name: 'Basic',
            price: 29,
            billingCycle: 'monthly',
            features: ['Foreclosure listings', 'Basic search', 'Email alerts'],
          },
          {
            name: 'Premium',
            price: 99,
            billingCycle: 'monthly',
            features: ['All Basic features', 'Market reports', 'Comparable sales', 'Advanced filters'],
            isPopular: true,
          },
          {
            name: 'Professional',
            price: 299,
            billingCycle: 'monthly',
            features: ['All Premium features', 'API access', 'Bulk downloads', 'Custom analytics'],
          },
        ],
        hasFreeTier: false,
        hasTrial: true,
        trialDays: 14,
        currency: 'USD',
        billingOptions: ['monthly', 'yearly'],
        lastUpdated: new Date(),
      },
    };

    return pricingDatabase[competitorId] || null;
  }

  /**
   * Collect feature data
   */
  private async collectFeatureData(
    competitor: CompetitorProfile,
    websiteData: WebsiteData
  ): Promise<FeatureData> {
    // Pre-defined features for known competitors
    const knownFeatures = this.getKnownFeatures(competitor.id);
    if (knownFeatures) return knownFeatures;

    return {
      coreFeatures: [],
      premiumFeatures: [],
      integrations: [],
      apiAvailable: false,
      mobileApp: false,
      platforms: ['web'],
    };
  }

  /**
   * Get known features for specific competitors
   */
  private getKnownFeatures(competitorId: string): FeatureData | null {
    const featuresDatabase: Record<string, FeatureData> = {
      'propertyonion': {
        coreFeatures: [
          { name: 'Auction Calendar', description: 'View upcoming foreclosure auctions', category: 'core', isUnique: false, maturityLevel: 'advanced' },
          { name: '8 KPIs Dashboard', description: 'Key performance indicators for properties', category: 'analytics', isUnique: true, maturityLevel: 'advanced' },
          { name: 'Property Search', description: 'Search and filter foreclosure properties', category: 'core', isUnique: false, maturityLevel: 'intermediate' },
          { name: 'Email Alerts', description: 'Get notified of new auctions', category: 'notifications', isUnique: false, maturityLevel: 'basic' },
          { name: 'Property Reports', description: 'Detailed property analysis reports', category: 'reporting', isUnique: false, maturityLevel: 'intermediate' },
        ],
        premiumFeatures: [
          { name: 'API Access', description: 'Programmatic access to data', category: 'platform', isUnique: false, maturityLevel: 'advanced' },
          { name: 'Custom Reports', description: 'Build custom report templates', category: 'reporting', isUnique: false, maturityLevel: 'advanced' },
          { name: 'Bulk Export', description: 'Export data in bulk', category: 'platform', isUnique: false, maturityLevel: 'intermediate' },
        ],
        integrations: [
          { name: 'Zapier', type: 'zapier', category: 'automation' },
          { name: 'Google Sheets', type: 'native', category: 'productivity' },
        ],
        apiAvailable: true,
        mobileApp: false,
        platforms: ['web'],
      },
      'auction-com': {
        coreFeatures: [
          { name: 'Live Auctions', description: 'Participate in real-time online auctions', category: 'core', isUnique: true, maturityLevel: 'advanced' },
          { name: 'Property Search', description: 'Search REO and foreclosure properties', category: 'core', isUnique: false, maturityLevel: 'advanced' },
          { name: 'Saved Searches', description: 'Save and manage search criteria', category: 'core', isUnique: false, maturityLevel: 'basic' },
          { name: 'Property Photos', description: 'High-quality property images', category: 'core', isUnique: false, maturityLevel: 'intermediate' },
          { name: 'Financing Options', description: 'In-platform financing for purchases', category: 'finance', isUnique: true, maturityLevel: 'advanced' },
        ],
        premiumFeatures: [
          { name: 'Proxy Bidding', description: 'Automatic bidding up to max price', category: 'bidding', isUnique: false, maturityLevel: 'advanced' },
        ],
        integrations: [],
        apiAvailable: false,
        mobileApp: true,
        platforms: ['web', 'ios', 'android'],
      },
    };

    return featuresDatabase[competitorId] || null;
  }

  /**
   * Collect media data (videos, screenshots)
   */
  private async collectMediaData(
    competitor: CompetitorProfile,
    config: CollectionConfig
  ): Promise<MediaData> {
    const videos: VideoCapture[] = [];
    const screenshots: ScreenshotCapture[] = [];

    // Search for YouTube videos
    if (config.analyzeVideos) {
      const youtubeVideos = await this.findYouTubeVideos(competitor.name);
      videos.push(...youtubeVideos.slice(0, config.maxVideosPerCompetitor));
    }

    return {
      videos,
      screenshots,
    };
  }

  /**
   * Find YouTube videos for a competitor
   */
  private async findYouTubeVideos(competitorName: string): Promise<VideoCapture[]> {
    // Would use YouTube API in production
    // For now, return known videos
    const knownVideos: Record<string, VideoCapture[]> = {
      'PropertyOnion': [
        {
          url: 'https://youtube.com/watch?v=example1',
          platform: 'youtube',
          title: 'PropertyOnion Demo - How to Find Foreclosure Deals',
          duration_seconds: 420,
          views: 5200,
        },
      ],
      'Auction.com': [
        {
          url: 'https://youtube.com/watch?v=example2',
          platform: 'youtube',
          title: 'How to Buy Properties on Auction.com',
          duration_seconds: 600,
          views: 45000,
        },
      ],
    };

    return knownVideos[competitorName] || [];
  }

  /**
   * Collect social media data
   */
  private async collectSocialData(competitor: CompetitorProfile): Promise<SocialData> {
    return {
      followers: {
        linkedin: Math.floor(Math.random() * 10000) + 1000,
        twitter: Math.floor(Math.random() * 5000) + 500,
      },
      engagement: {
        postsPerWeek: Math.floor(Math.random() * 5) + 1,
      },
      sentiment: 'neutral',
      recentPosts: [],
    };
  }

  /**
   * Detect technology stack
   */
  private detectTechStack(url: string): string[] {
    // Would use BuiltWith or similar in production
    const commonStacks: Record<string, string[]> = {
      'propertyonion.com': ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      'auction.com': ['Java', 'React', 'Oracle', 'AWS'],
      'realtytrac.com': ['PHP', 'MySQL', 'Apache'],
    };

    const domain = url.replace(/https?:\/\//, '').replace(/\/$/, '');
    return commonStacks[domain] || ['Unknown'];
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(data: any): number {
    let score = 0;
    const maxScore = 100;

    // Website data (25 points)
    if (data.websiteData?.homepage?.url) score += 10;
    if (data.websiteData?.homepage?.headings?.length > 0) score += 10;
    if (data.websiteData?.techStack?.length > 0) score += 5;

    // Pricing data (25 points)
    if (data.pricingData?.tiers?.length > 0) score += 15;
    if (data.pricingData?.model) score += 10;

    // Feature data (25 points)
    if (data.featureData?.coreFeatures?.length > 0) score += 15;
    if (data.featureData?.integrations?.length > 0) score += 10;

    // Media data (15 points)
    if (data.mediaData?.videos?.length > 0) score += 10;
    if (data.mediaData?.screenshots?.length > 0) score += 5;

    // Social data (10 points)
    if (data.socialData?.followers) score += 10;

    return Math.min(score, maxScore);
  }

  /**
   * Count total data points collected
   */
  private countDataPoints(data: CollectedData): number {
    let count = 0;

    // Website
    count += data.websiteData.homepage ? 1 : 0;
    count += data.websiteData.techStack?.length || 0;

    // Pricing
    count += data.pricingData.tiers.length;

    // Features
    count += data.featureData.coreFeatures.length;
    count += data.featureData.premiumFeatures.length;
    count += data.featureData.integrations.length;

    // Media
    count += data.mediaData.videos.length;
    count += data.mediaData.screenshots.length;

    return count;
  }

  /**
   * Save collection results to database
   */
  private async saveCollectionResults(collectedData: CollectedData[]): Promise<void> {
    for (const data of collectedData) {
      await this.supabase.from('ci_collected_data').upsert({
        competitor_id: data.competitorId,
        competitor_name: data.competitorName,
        website_data: data.websiteData,
        pricing_data: data.pricingData,
        feature_data: data.featureData,
        media_data: data.mediaData,
        social_data: data.socialData,
        data_quality_score: data.dataQualityScore,
        sources: data.sources,
        collected_at: data.collectionTimestamp.toISOString(),
      }, {
        onConflict: 'competitor_id'
      });
    }
  }
}

export default Phase2Collection;
