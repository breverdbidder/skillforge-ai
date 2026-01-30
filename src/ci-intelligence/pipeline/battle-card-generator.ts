/**
 * SkillForge AI - Battle Card Generator
 * Creates comprehensive sales battle cards for each competitor
 */

import { NvidiaNimClient } from '../nvidia-nim-client.js';
import { AnalysisResult, ExtractedFeature } from './five-phase-pipeline.js';

export interface BattleCard {
  id: string;
  competitor: {
    name: string;
    website: string;
    logo_url?: string;
  };
  generatedAt: Date;
  
  // Overview
  overview: {
    description: string;
    founded?: string;
    headquarters?: string;
    employees?: string;
    funding?: string;
    target_market: string[];
  };
  
  // Positioning
  positioning: {
    their_positioning: string;
    our_positioning: string;
    key_differences: string[];
  };
  
  // When We Win
  whenWeWin: {
    scenarios: WinScenario[];
    ideal_customer_profile: string[];
    buying_triggers: string[];
  };
  
  // When We Lose
  whenWeLose: {
    scenarios: LoseScenario[];
    warning_signs: string[];
    mitigation_strategies: string[];
  };
  
  // Feature Comparison
  featureComparison: {
    our_advantages: FeatureAdvantage[];
    their_advantages: FeatureAdvantage[];
    feature_matrix: FeatureComparison[];
  };
  
  // Pricing
  pricing: {
    their_pricing: PricingInfo;
    our_pricing: PricingInfo;
    price_talk_track: string;
  };
  
  // Objection Handling
  objections: ObjectionHandler[];
  
  // Landmines
  landmines: Landmine[];
  
  // Discovery Questions
  discoveryQuestions: DiscoveryQuestion[];
  
  // Proof Points
  proofPoints: ProofPoint[];
  
  // Trap Questions (questions to avoid)
  trapQuestions: TrapQuestion[];
  
  // Closing Strategies
  closingStrategies: ClosingStrategy[];
  
  // Quick Reference
  quickReference: {
    elevator_pitch: string;
    key_differentiators: string[];
    top_3_talking_points: string[];
    do_say: string[];
    dont_say: string[];
  };
}

export interface WinScenario {
  scenario: string;
  why: string;
  talk_track: string;
}

export interface LoseScenario {
  scenario: string;
  why: string;
  counter_strategy: string;
}

export interface FeatureAdvantage {
  feature: string;
  description: string;
  customer_value: string;
  talk_track: string;
}

export interface FeatureComparison {
  feature: string;
  category: string;
  biddeed_ai: 'yes' | 'no' | 'partial' | 'better' | 'roadmap';
  competitor: 'yes' | 'no' | 'partial' | 'better';
  notes: string;
}

export interface PricingInfo {
  model: string;
  starting_price: string;
  typical_deal_size: string;
  discounting: string;
}

export interface ObjectionHandler {
  objection: string;
  category: 'price' | 'feature' | 'trust' | 'timing' | 'competition';
  response: string;
  proof_point?: string;
  follow_up_question?: string;
}

export interface Landmine {
  topic: string;
  question: string;
  why_it_works: string;
  expected_response: string;
  follow_up: string;
}

export interface DiscoveryQuestion {
  question: string;
  purpose: string;
  good_answer: string;
  red_flag: string;
}

export interface ProofPoint {
  claim: string;
  evidence: string;
  source?: string;
}

export interface TrapQuestion {
  question: string;
  why_its_a_trap: string;
  how_to_handle: string;
}

export interface ClosingStrategy {
  name: string;
  when_to_use: string;
  script: string;
}

export class BattleCardGenerator {
  private nvidiaNim: NvidiaNimClient;

  constructor(nvidiaNimClient: NvidiaNimClient) {
    this.nvidiaNim = nvidiaNimClient;
  }

  /**
   * Generate a comprehensive battle card
   */
  async generate(analysis: AnalysisResult): Promise<BattleCard> {
    console.log(`      Generating battle card for ${analysis.competitor.name}...`);
    
    const battleCard: BattleCard = {
      id: `battlecard-${analysis.competitor.id}-${Date.now()}`,
      competitor: {
        name: analysis.competitor.name,
        website: analysis.competitor.website,
        logo_url: analysis.competitor.logo_url,
      },
      generatedAt: new Date(),
      
      overview: await this.generateOverview(analysis),
      positioning: await this.generatePositioning(analysis),
      whenWeWin: await this.generateWhenWeWin(analysis),
      whenWeLose: await this.generateWhenWeLose(analysis),
      featureComparison: await this.generateFeatureComparison(analysis),
      pricing: await this.generatePricing(analysis),
      objections: await this.generateObjectionHandlers(analysis),
      landmines: await this.generateLandmines(analysis),
      discoveryQuestions: await this.generateDiscoveryQuestions(analysis),
      proofPoints: await this.generateProofPoints(analysis),
      trapQuestions: await this.generateTrapQuestions(analysis),
      closingStrategies: await this.generateClosingStrategies(analysis),
      quickReference: await this.generateQuickReference(analysis),
    };
    
    return battleCard;
  }

  private async generateOverview(analysis: AnalysisResult): Promise<BattleCard['overview']> {
    return {
      description: analysis.competitor.description || `${analysis.competitor.name} is a competitor in the foreclosure data space.`,
      target_market: analysis.market_position.target_audience || ['Real estate investors', 'House flippers'],
    };
  }

  private async generatePositioning(analysis: AnalysisResult): Promise<BattleCard['positioning']> {
    return {
      their_positioning: analysis.market_position.positioning || 'Foreclosure data and listings platform',
      our_positioning: 'AI-powered foreclosure intelligence platform with ML predictions and automated lien discovery',
      key_differences: [
        'We use ML to predict auction outcomes - they don\'t',
        'We automate lien discovery - they require manual lookup',
        'We provide one-page reports with recommendations - they provide raw data',
        'We calculate max bids automatically - they don\'t',
        `We focus on quality over quantity - they have broader but shallower coverage`,
      ],
    };
  }

  private async generateWhenWeWin(analysis: AnalysisResult): Promise<BattleCard['whenWeWin']> {
    const weaknesses = analysis.weaknesses || [];
    
    return {
      scenarios: [
        {
          scenario: 'Prospect values data accuracy over brand recognition',
          why: `${analysis.competitor.name} has broader coverage but less depth per property`,
          talk_track: 'We focus on giving you actionable intelligence, not just data dumps. Our ML predictions tell you which auctions are worth attending.',
        },
        {
          scenario: 'Prospect has been burned by missing liens before',
          why: 'Our automated lien discovery catches HOA foreclosures and senior mortgages',
          talk_track: 'Our Lien Discovery Agent searches AcclaimWeb and RealTDM automatically. You\'ll never miss a senior mortgage on an HOA foreclosure again.',
        },
        {
          scenario: 'Prospect is time-constrained',
          why: 'We reduce analysis time from hours to minutes',
          talk_track: 'What takes you 2 hours of manual research, we do in 2 minutes. One-page reports with everything you need to make a decision.',
        },
        {
          scenario: 'Prospect wants predictive insights',
          why: `${analysis.competitor.name} provides historical data, we predict future outcomes`,
          talk_track: 'Our ML model predicts third-party probability with 64.4% accuracy. Know which auctions are likely to be contested before you drive there.',
        },
      ],
      ideal_customer_profile: [
        'Active foreclosure investors (5+ auctions/month)',
        'Experienced investors who value accuracy',
        'Data-driven decision makers',
        'Florida-focused investors',
        'Investors who have lost money on missed liens',
      ],
      buying_triggers: [
        'Just lost money on a deal due to missed lien',
        'Spending too much time on due diligence',
        'Missing good deals because of slow analysis',
        'Frustrated with inaccurate data from current provider',
        'Looking to scale their operation',
      ],
    };
  }

  private async generateWhenWeLose(analysis: AnalysisResult): Promise<BattleCard['whenWeLose']> {
    const strengths = analysis.strengths || [];
    
    return {
      scenarios: [
        {
          scenario: `Prospect is deeply invested in ${analysis.competitor.name} ecosystem`,
          why: 'Switching costs and training investment',
          counter_strategy: 'Offer free parallel trial - use both simultaneously for 30 days and compare results',
        },
        {
          scenario: 'Prospect needs nationwide coverage immediately',
          why: 'We currently focus on Florida markets',
          counter_strategy: 'For Florida properties, we\'re superior. Multi-state expansion is on our 2026 roadmap. For non-FL, they\'d need another solution anyway.',
        },
        {
          scenario: 'Prospect prioritizes mobile app',
          why: 'We don\'t have a native mobile app yet',
          counter_strategy: 'Our web app is fully mobile-responsive. Native app is on our 2026 roadmap. Most analysis happens at a desk anyway.',
        },
        {
          scenario: 'Brand trust matters more than features',
          why: `${analysis.competitor.name} has years of market presence`,
          counter_strategy: 'Focus on our technology advantage. Offer case studies and references. Propose a paid pilot.',
        },
      ],
      warning_signs: [
        `Keeps mentioning their long relationship with ${analysis.competitor.name}`,
        'Asks about nationwide coverage early in conversation',
        'More concerned with "industry standard" than outcomes',
        'Price is the only consideration',
        'No current pain points with existing solution',
      ],
      mitigation_strategies: [
        'Lead with ROI story - one avoided bad deal pays for years of service',
        'Offer head-to-head comparison on their actual properties',
        'Provide references from similar investors',
        'Propose low-risk pilot program',
        'Focus on unique ML capabilities no competitor has',
      ],
    };
  }

  private async generateFeatureComparison(analysis: AnalysisResult): Promise<BattleCard['featureComparison']> {
    // BidDeed.AI advantages
    const ourAdvantages: FeatureAdvantage[] = [
      {
        feature: 'ML Third-Party Probability',
        description: 'Predicts likelihood of third-party purchase at auction',
        customer_value: 'Know which auctions to attend and which to skip',
        talk_track: 'Our ML model predicts with 64.4% accuracy whether an auction will have third-party bidders. No competitor has this.',
      },
      {
        feature: 'Automated Lien Discovery',
        description: 'Searches AcclaimWeb, RealTDM, and BCPAO automatically',
        customer_value: 'Never miss a senior mortgage or HOA lien',
        talk_track: 'Our Lien Discovery Agent finds liens you\'d spend hours searching for manually. It catches HOA foreclosures where the senior mortgage survives.',
      },
      {
        feature: 'Max Bid Calculator',
        description: 'Calculates optimal max bid with repair estimates',
        customer_value: 'Never overbid or miss a deal',
        talk_track: 'We calculate your max bid: (ARV×70%)-Repairs-$10K-MIN($25K,15%ARV). Built-in profit margin protection.',
      },
      {
        feature: 'One-Page Reports',
        description: 'Complete property analysis on one page with photos',
        customer_value: 'Quick decision-making at auctions',
        talk_track: 'Take our one-page report to the auction. BID, REVIEW, or SKIP recommendation right on top. No tablet or laptop needed.',
      },
      {
        feature: 'Decision Logging',
        description: 'Tracks all recommendations and outcomes',
        customer_value: 'Learn from past decisions and improve',
        talk_track: 'We track every BID/SKIP recommendation and actual outcomes. Use this to improve your strategy over time.',
      },
    ];
    
    // Their advantages based on analysis
    const theirAdvantages: FeatureAdvantage[] = analysis.features
      .filter(f => f.competitor_has && !f.biddeed_has)
      .slice(0, 5)
      .map(f => ({
        feature: f.name,
        description: f.description,
        customer_value: 'Standard industry capability',
        talk_track: `This is on our roadmap. Our current focus is on ML and automation - features that actually move the needle on your ROI.`,
      }));
    
    // Feature matrix
    const featureMatrix: FeatureComparison[] = [
      { feature: 'Auction Calendar', category: 'Core', biddeed_ai: 'yes', competitor: 'yes', notes: 'Parity' },
      { feature: 'Property Details', category: 'Core', biddeed_ai: 'yes', competitor: 'yes', notes: 'Parity' },
      { feature: 'Photo Gallery', category: 'Core', biddeed_ai: 'yes', competitor: 'yes', notes: 'We use BCPAO photos' },
      { feature: 'ML Predictions', category: 'Analytics', biddeed_ai: 'better', competitor: 'no', notes: '64.4% accuracy - UNIQUE' },
      { feature: 'Lien Discovery', category: 'Analytics', biddeed_ai: 'better', competitor: 'partial', notes: 'Automated vs manual' },
      { feature: 'Max Bid Calculator', category: 'Analytics', biddeed_ai: 'yes', competitor: 'no', notes: 'UNIQUE' },
      { feature: 'One-Page Reports', category: 'Reporting', biddeed_ai: 'yes', competitor: 'partial', notes: 'With recommendations' },
      { feature: 'Multi-County', category: 'Platform', biddeed_ai: 'partial', competitor: 'yes', notes: 'We have 3 counties, expanding' },
      { feature: 'Email Alerts', category: 'Notifications', biddeed_ai: 'roadmap', competitor: 'yes', notes: 'Q1 2026' },
      { feature: 'Mobile App', category: 'Platform', biddeed_ai: 'roadmap', competitor: 'partial', notes: 'Mobile web works great' },
      { feature: 'API Access', category: 'Platform', biddeed_ai: 'roadmap', competitor: 'yes', notes: 'Q2 2026' },
    ];
    
    return {
      our_advantages: ourAdvantages,
      their_advantages: theirAdvantages,
      feature_matrix: featureMatrix,
    };
  }

  private async generatePricing(analysis: AnalysisResult): Promise<BattleCard['pricing']> {
    return {
      their_pricing: {
        model: analysis.pricing_analysis.pricing_model,
        starting_price: `$${analysis.pricing_analysis.avg_price_monthly}/month`,
        typical_deal_size: '$99-199/month',
        discounting: 'Annual discount ~20%, occasional promotions',
      },
      our_pricing: {
        model: 'subscription',
        starting_price: '$79/month',
        typical_deal_size: '$79-149/month',
        discounting: 'Annual: 2 months free. Founding member pricing available.',
      },
      price_talk_track: `We're priced at $79/month - 20% less than ${analysis.competitor.name}. But price isn't the point. One avoided bad deal saves $50K or more. Our ML predictions pay for themselves on your first auction.`,
    };
  }

  private async generateObjectionHandlers(analysis: AnalysisResult): Promise<ObjectionHandler[]> {
    return [
      {
        objection: `I've been using ${analysis.competitor.name} for years`,
        category: 'competition',
        response: `That makes sense - they've been around a while. But their technology hasn't evolved. We built BidDeed.AI from scratch with modern ML capabilities. Would you be open to running both in parallel for 30 days to compare results?`,
        proof_point: '64.4% ML prediction accuracy on Florida auctions',
        follow_up_question: 'What would it take to convince you our predictions are worth trying?',
      },
      {
        objection: 'I need more counties',
        category: 'feature',
        response: `We currently cover Brevard, Orange, and Duval - with 67 counties coming in 2026. For the counties we cover, our analysis is far deeper than anyone else. Do you invest primarily in Florida?`,
        follow_up_question: 'Which specific counties are most important to you?',
      },
      {
        objection: '$79/month is expensive',
        category: 'price',
        response: `I understand. Let me put it this way: one bad deal avoided saves you $50,000+. Our ML predictions have already flagged over $100K in potential losses for beta users. That's 100x ROI.`,
        proof_point: '$50K average saved per avoided bad deal',
        follow_up_question: 'How much did your last bad deal cost you?',
      },
      {
        objection: 'I've never heard of BidDeed.AI',
        category: 'trust',
        response: `We're new but our technology isn't. Our founder has 10+ years of foreclosure investing experience and our ML model is trained on thousands of actual Florida auctions. Want me to run an analysis on one of your recent deals to show you what we would have predicted?`,
        follow_up_question: 'Can I show you a live demo on a property you know?',
      },
      {
        objection: 'I need email alerts',
        category: 'feature',
        response: `Email alerts are launching next month. In the meantime, our ML-ranked reports give you something no alert can: prioritized opportunities, not just matches. Would email alerts be a dealbreaker, or is there flexibility there?`,
        follow_up_question: 'How do you currently stay on top of new auctions?',
      },
      {
        objection: 'I prefer to do my own analysis',
        category: 'trust',
        response: `That's the mindset of a serious investor. BidDeed.AI doesn't replace your judgment - it augments it. We surface data faster so you can apply your expertise to more deals. Think of us as your research assistant, not your decision maker.`,
        follow_up_question: 'How many hours per week do you spend on due diligence currently?',
      },
    ];
  }

  private async generateLandmines(analysis: AnalysisResult): Promise<Landmine[]> {
    return [
      {
        topic: 'Lien Discovery',
        question: 'How do you currently check for senior mortgages on HOA foreclosures?',
        why_it_works: 'Most investors either don\'t know to check or spend hours on manual lookup',
        expected_response: 'Manual AcclaimWeb search / I didn\'t know I needed to / Lost money on one',
        follow_up: 'Our Lien Discovery Agent automates that search. It found 3 senior mortgages in last week\'s Brevard auction that manual review missed.',
      },
      {
        topic: 'Prediction Accuracy',
        question: 'What\'s your hit rate on auctions - how often do you go and actually win something?',
        why_it_works: `Reveals pain of attending auctions that go back to bank. ${analysis.competitor.name} can't predict this.`,
        expected_response: 'Maybe 20-30% / I waste a lot of trips',
        follow_up: 'Our ML model predicts third-party purchase probability. Stop wasting trips on auctions that will go back to the bank.',
      },
      {
        topic: 'Analysis Time',
        question: 'How long does it take you to fully analyze a property before the auction?',
        why_it_works: 'Reveals manual process pain point',
        expected_response: '1-2 hours per property',
        follow_up: 'What if you could do that in 5 minutes? Our one-page reports give you everything: liens, max bid, ML score, recommendation.',
      },
      {
        topic: 'Bad Deals',
        question: 'What\'s the most expensive mistake you\'ve made at a foreclosure auction?',
        why_it_works: 'Creates emotional connection to our protection features',
        expected_response: 'Missed lien / Overbid / Repairs were worse than expected',
        follow_up: 'Every one of those scenarios is something our platform is designed to prevent. Want me to show you how?',
      },
      {
        topic: 'Current Tool Limitations',
        question: `What's the one thing you wish ${analysis.competitor.name} did better?`,
        why_it_works: 'Gets them to articulate their own pain',
        expected_response: 'Better data / Predictions / Faster analysis',
        follow_up: 'That\'s exactly what we built BidDeed.AI to solve. Let me show you...',
      },
    ];
  }

  private async generateDiscoveryQuestions(analysis: AnalysisResult): Promise<DiscoveryQuestion[]> {
    return [
      {
        question: 'How many foreclosure auctions do you typically attend per month?',
        purpose: 'Qualify activity level - higher volume = better fit',
        good_answer: '4+ auctions per month - active investor',
        red_flag: 'Just getting started / Rarely - may not see enough value',
      },
      {
        question: 'What\'s your primary investment strategy - fix & flip, rental, wholesale?',
        purpose: 'Understand use case and tailor value prop',
        good_answer: 'Clear strategy with volume',
        red_flag: 'Undefined / Hobbyist mentality',
      },
      {
        question: 'What tools or data sources do you use today for foreclosure research?',
        purpose: 'Understand competitive landscape and switching cost',
        good_answer: `${analysis.competitor.name}, manual research - shows pain`,
        red_flag: 'None / Don\'t need tools - not data-driven',
      },
      {
        question: 'How do you currently determine your maximum bid on a property?',
        purpose: 'Reveal calculation pain and opportunity for max bid feature',
        good_answer: 'Manual calculation / Excel - opportunity to automate',
        red_flag: 'Just wing it - may not value precision',
      },
      {
        question: 'Have you ever lost money on a foreclosure due to unexpected liens or issues?',
        purpose: 'Create pain awareness for lien discovery feature',
        good_answer: 'Yes, specific story - high intent',
        red_flag: 'No / Not sure - less urgency',
      },
    ];
  }

  private async generateProofPoints(analysis: AnalysisResult): Promise<ProofPoint[]> {
    return [
      {
        claim: 'Our ML model predicts auction outcomes',
        evidence: '64.4% accuracy on third-party purchase prediction, validated on 1,000+ Brevard County auctions',
        source: 'Internal backtesting data',
      },
      {
        claim: 'We save hours on due diligence',
        evidence: 'Beta users report 80% reduction in per-property analysis time (2 hours → 15 minutes)',
        source: 'Beta user feedback',
      },
      {
        claim: 'Our lien discovery catches missed risks',
        evidence: 'In December 2025 Brevard auctions, found 3 senior mortgages that manual review would have missed',
        source: 'Internal audit',
      },
      {
        claim: 'One avoided bad deal pays for years of service',
        evidence: 'Average Florida foreclosure deal size is $150K+. A 10% mistake = $15K loss. $79/month = $948/year. ROI: 15x minimum.',
        source: 'Florida foreclosure data',
      },
      {
        claim: 'We have deep Florida expertise',
        evidence: 'Founder has 10+ years Florida foreclosure investing experience. Built relationships with courthouse staff.',
        source: 'Company background',
      },
    ];
  }

  private async generateTrapQuestions(analysis: AnalysisResult): Promise<TrapQuestion[]> {
    return [
      {
        question: 'Do you cover my state?',
        why_its_a_trap: 'We currently focus on Florida. Saying "not yet" sounds weak.',
        how_to_handle: 'We specialize in Florida markets where our ML model is trained. For Florida properties, we\'re unmatched. What\'s your Florida investment volume?',
      },
      {
        question: `Why should I leave ${analysis.competitor.name}?`,
        why_its_a_trap: 'Framed as zero-sum when we can coexist',
        how_to_handle: 'You don\'t have to leave them. Many of our users run both. They use us for Florida analysis because our ML predictions are unique. Try us on your next 5 Florida deals.',
      },
      {
        question: 'Can you guarantee your predictions are accurate?',
        why_its_a_trap: 'No prediction is 100% - sets up for disappointment',
        how_to_handle: '64.4% accuracy means we\'re right more than half the time. That edge, applied across many auctions, is statistically significant. Would you like to see our backtesting methodology?',
      },
      {
        question: 'What happens if your ML is wrong and I lose money?',
        why_its_a_trap: 'Shifts liability to us / Creates fear',
        how_to_handle: 'Our predictions are decision support, not guarantees. You make the final call. But consider: without predictions, you\'re at 50% baseline. With us, you\'re at 64%. Over time, that edge compounds.',
      },
    ];
  }

  private async generateClosingStrategies(analysis: AnalysisResult): Promise<ClosingStrategy[]> {
    return [
      {
        name: 'The Live Demo Close',
        when_to_use: 'Prospect is skeptical but engaged',
        script: 'Let me pull up a property from an upcoming auction. I\'ll run our full analysis live while you watch. If you\'re not impressed in 5 minutes, no hard feelings.',
      },
      {
        name: 'The Parallel Test Close',
        when_to_use: `Prospect is loyal to ${analysis.competitor.name}`,
        script: 'I\'m not asking you to switch. Run both for the next 30 days on your Florida deals. Compare our predictions to what actually happens at auction. Let the results speak.',
      },
      {
        name: 'The ROI Close',
        when_to_use: 'Prospect is price-sensitive',
        script: 'At $79/month, your annual investment is $948. One bad deal avoided saves $15K minimum. That\'s 15x ROI on your first save alone. How many auctions until you hit one we would have flagged?',
      },
      {
        name: 'The Pain Recap Close',
        when_to_use: 'After discovering specific pain points',
        script: 'You mentioned you lost $X on that HOA deal with the senior mortgage. Our Lien Discovery Agent would have caught that. You said analysis takes 2 hours per property - we cut that to 15 minutes. Ready to stop the bleeding?',
      },
      {
        name: 'The Urgency Close',
        when_to_use: 'Prospect is interested but non-committal',
        script: 'The next Brevard auction is in 2 weeks. Sign up today, and I\'ll personally walk you through the analysis for every property on that calendar. You\'ll go into that auction more prepared than ever.',
      },
    ];
  }

  private async generateQuickReference(analysis: AnalysisResult): Promise<BattleCard['quickReference']> {
    return {
      elevator_pitch: `BidDeed.AI is the AI-powered foreclosure intelligence platform. We use ML to predict auction outcomes and automate lien discovery - things ${analysis.competitor.name} can't do. Our customers spend less time on due diligence and avoid more bad deals.`,
      key_differentiators: [
        'ML predictions (64.4% accuracy) - NO competitor has this',
        'Automated lien discovery - catches missed risks',
        'Max bid calculator - built-in profit protection',
        'One-page reports with BID/REVIEW/SKIP recommendations',
      ],
      top_3_talking_points: [
        'Predict auction outcomes before you drive there',
        'Never miss a senior mortgage on HOA foreclosures',
        'One bad deal avoided pays for 15 years of service',
      ],
      do_say: [
        'We use ML to predict auction outcomes',
        'Our lien discovery is automated',
        'We focus on accuracy, not just coverage',
        'Try us risk-free on your next 5 deals',
      ],
      dont_say: [
        `${analysis.competitor.name} is bad`,
        'We\'re better at everything',
        'Our predictions are guaranteed',
        'We have nationwide coverage',
      ],
    };
  }
}

export default BattleCardGenerator;
