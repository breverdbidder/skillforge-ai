/**
 * Competitor Registry for BidDeed.AI CI Analysis
 * Foreclosure auction and real estate tech competitors
 */

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  category: 'direct' | 'adjacent' | 'aspirational';
  description: string;
  videoSources: VideoSource[];
  knownFeatures: string[];
  pricing?: PricingInfo;
  lastAnalyzed?: Date;
}

export interface VideoSource {
  url: string;
  type: 'demo' | 'tutorial' | 'marketing' | 'webinar' | 'youtube';
  title: string;
  priority: 1 | 2 | 3; // 1 = highest
  addedAt: Date;
}

export interface PricingInfo {
  model: 'subscription' | 'per-auction' | 'freemium' | 'enterprise';
  startingPrice?: string;
  tiers?: string[];
}

/**
 * Direct Competitors - Foreclosure/Auction Platforms
 */
export const DIRECT_COMPETITORS: Competitor[] = [
  {
    id: 'propertyonion',
    name: 'PropertyOnion',
    domain: 'propertyonion.com',
    category: 'direct',
    description: 'Foreclosure research platform with 8 KPIs we track',
    videoSources: [
      {
        url: 'https://www.youtube.com/watch?v=PropertyOnionDemo',
        type: 'demo',
        title: 'PropertyOnion Platform Demo',
        priority: 1,
        addedAt: new Date('2025-01-01')
      }
    ],
    knownFeatures: [
      'Lien search',
      'Title analysis',
      'Auction calendar',
      'Property photos',
      'Ownership history',
      'Tax certificate tracking',
      'Judgment tracking',
      'Default amount tracking'
    ],
    pricing: {
      model: 'subscription',
      startingPrice: '$49/month',
      tiers: ['Basic', 'Pro', 'Enterprise']
    }
  },
  {
    id: 'auction-com',
    name: 'Auction.com',
    domain: 'auction.com',
    category: 'direct',
    description: 'Largest online real estate auction marketplace',
    videoSources: [
      {
        url: 'https://www.youtube.com/watch?v=AuctionComBidding',
        type: 'tutorial',
        title: 'How to Bid on Auction.com',
        priority: 1,
        addedAt: new Date('2025-01-01')
      }
    ],
    knownFeatures: [
      'Online bidding',
      'Property search',
      'Due diligence docs',
      'Financing options',
      'Mobile app',
      'Saved searches',
      'Bid history'
    ],
    pricing: {
      model: 'per-auction',
      startingPrice: 'Buyer premium 5%'
    }
  },
  {
    id: 'foreclosure-com',
    name: 'Foreclosure.com',
    domain: 'foreclosure.com',
    category: 'direct',
    description: 'Foreclosure listing aggregator',
    videoSources: [],
    knownFeatures: [
      'Listing aggregation',
      'Email alerts',
      'Property details',
      'Comparable sales',
      'Market trends'
    ],
    pricing: {
      model: 'subscription',
      startingPrice: '$39.80/month'
    }
  },
  {
    id: 'realtytrac',
    name: 'RealtyTrac (ATTOM)',
    domain: 'realtytrac.com',
    category: 'direct',
    description: 'Foreclosure data and analytics',
    videoSources: [],
    knownFeatures: [
      'Foreclosure data',
      'Market reports',
      'Property search',
      'Investment analysis',
      'API access'
    ],
    pricing: {
      model: 'subscription',
      tiers: ['Basic', 'Premium', 'API']
    }
  }
];

/**
 * Adjacent Competitors - Real Estate Tech
 */
export const ADJACENT_COMPETITORS: Competitor[] = [
  {
    id: 'propstream',
    name: 'PropStream',
    domain: 'propstream.com',
    category: 'adjacent',
    description: 'Real estate data and marketing platform',
    videoSources: [
      {
        url: 'https://www.youtube.com/watch?v=PropStreamDemo',
        type: 'demo',
        title: 'PropStream Platform Tour',
        priority: 1,
        addedAt: new Date('2025-01-01')
      }
    ],
    knownFeatures: [
      'Property data',
      'Skip tracing',
      'Marketing lists',
      'Comps analysis',
      'Deal analyzer',
      'Lead generation'
    ],
    pricing: {
      model: 'subscription',
      startingPrice: '$99/month'
    }
  },
  {
    id: 'batchleads',
    name: 'BatchLeads',
    domain: 'batchleads.io',
    category: 'adjacent',
    description: 'Real estate lead generation platform',
    videoSources: [],
    knownFeatures: [
      'Skip tracing',
      'List stacking',
      'Driving for dollars',
      'Marketing automation',
      'CRM integration'
    ],
    pricing: {
      model: 'subscription',
      startingPrice: '$79/month'
    }
  },
  {
    id: 'dealmachine',
    name: 'DealMachine',
    domain: 'dealmachine.com',
    category: 'adjacent',
    description: 'Driving for dollars app',
    videoSources: [],
    knownFeatures: [
      'Mobile app',
      'Property lookup',
      'Direct mail',
      'Skip tracing',
      'Route planning'
    ],
    pricing: {
      model: 'subscription',
      startingPrice: '$49/month'
    }
  }
];

/**
 * Aspirational Competitors - AI/Agentic Platforms
 */
export const ASPIRATIONAL_COMPETITORS: Competitor[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    domain: 'zapier.com',
    category: 'aspirational',
    description: 'Workflow automation platform - positioning reference',
    videoSources: [],
    knownFeatures: [
      'No-code automation',
      'App integrations',
      'Multi-step workflows',
      'Filters and formatters',
      'Scheduled triggers'
    ],
    pricing: {
      model: 'freemium',
      startingPrice: 'Free tier, $19.99/month Pro'
    }
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    domain: 'make.com',
    category: 'aspirational',
    description: 'Visual automation platform',
    videoSources: [],
    knownFeatures: [
      'Visual workflow builder',
      'Complex logic',
      'Data transformation',
      'Error handling',
      'Scheduling'
    ],
    pricing: {
      model: 'freemium',
      startingPrice: 'Free tier, $9/month Core'
    }
  },
  {
    id: 'manus-ai',
    name: 'Manus AI',
    domain: 'manus.ai',
    category: 'aspirational',
    description: 'Agentic AI platform - architecture reference',
    videoSources: [],
    knownFeatures: [
      'Multi-agent orchestration',
      'Autonomous execution',
      'Tool integration',
      'Context management',
      'Parallel processing'
    ]
  }
];

/**
 * Get all competitors
 */
export function getAllCompetitors(): Competitor[] {
  return [...DIRECT_COMPETITORS, ...ADJACENT_COMPETITORS, ...ASPIRATIONAL_COMPETITORS];
}

/**
 * Get competitors by category
 */
export function getCompetitorsByCategory(category: 'direct' | 'adjacent' | 'aspirational'): Competitor[] {
  return getAllCompetitors().filter(c => c.category === category);
}

/**
 * Get all video sources for analysis
 */
export function getAllVideoSources(): Array<{ url: string; competitor: string; priority: number }> {
  const sources: Array<{ url: string; competitor: string; priority: number }> = [];
  
  for (const competitor of getAllCompetitors()) {
    for (const video of competitor.videoSources) {
      sources.push({
        url: video.url,
        competitor: competitor.name,
        priority: video.priority
      });
    }
  }
  
  // Sort by priority
  return sources.sort((a, b) => a.priority - b.priority);
}

/**
 * Add video source to competitor
 */
export function addVideoSource(competitorId: string, source: Omit<VideoSource, 'addedAt'>): void {
  const competitor = getAllCompetitors().find(c => c.id === competitorId);
  if (competitor) {
    competitor.videoSources.push({
      ...source,
      addedAt: new Date()
    });
  }
}

/**
 * Get competitor by ID
 */
export function getCompetitor(id: string): Competitor | undefined {
  return getAllCompetitors().find(c => c.id === id);
}
