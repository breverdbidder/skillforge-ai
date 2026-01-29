/**
 * NVIDIA NIM Client for Kimi K2.5
 * FREE multimodal API - video, image, text analysis
 * Exploit while no rate limits exist!
 */

import axios from 'axios';

export interface NvidiaKimiConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface VideoAnalysisResult {
  competitor: string;
  videoUrl: string;
  features: ExtractedFeature[];
  uiPatterns: UIPattern[];
  pricingSignals: PricingSignal[];
  marketingClaims: string[];
  technicalStack: string[];
  rawAnalysis: string;
  timestamp: Date;
}

export interface ExtractedFeature {
  name: string;
  description: string;
  category: 'core' | 'premium' | 'unique' | 'table-stakes';
  complexity: 1 | 2 | 3 | 4 | 5;
  bidDeedHas: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface UIPattern {
  element: string;
  description: string;
  screenshot_timestamp?: string;
  replicable: boolean;
}

export interface PricingSignal {
  tier: string;
  price?: string;
  features: string[];
  targetAudience: string;
}

export class NvidiaNimKimiClient {
  private config: Required<NvidiaKimiConfig>;
  private requestCount: number = 0;
  private lastRequestTime: Date | null = null;

  constructor(config: NvidiaKimiConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://integrate.api.nvidia.com/v1',
      model: config.model || 'moonshotai/kimi-k2.5',
      maxTokens: config.maxTokens || 8192,
      temperature: config.temperature || 0.7,
    };
  }

  /**
   * Analyze video URL for competitive intelligence
   */
  async analyzeVideo(
    videoUrl: string,
    competitor: string,
    analysisType: 'full' | 'features' | 'ui' | 'pricing' = 'full'
  ): Promise<VideoAnalysisResult> {
    const prompt = this.buildVideoAnalysisPrompt(competitor, analysisType);
    
    console.log(`🎬 Analyzing ${competitor} video: ${videoUrl}`);
    
    const response = await this.makeRequest([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'video_url', video_url: { url: videoUrl } }
        ]
      }
    ]);

    return this.parseVideoAnalysis(response, competitor, videoUrl);
  }

  /**
   * Analyze image/screenshot for UI patterns
   */
  async analyzeScreenshot(
    imageBase64: string,
    competitor: string,
    context: string = ''
  ): Promise<UIPattern[]> {
    const prompt = `Analyze this screenshot from ${competitor}'s product.
    
Context: ${context}

Extract:
1. UI components and patterns
2. Information architecture
3. Color scheme and typography
4. Call-to-action placement
5. Data visualization approaches
6. Navigation patterns

Return as JSON array of UIPattern objects with: element, description, replicable (boolean)`;

    const response = await this.makeRequest([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
        ]
      }
    ]);

    return this.parseUIPatterns(response);
  }

  /**
   * Batch analyze multiple videos
   */
  async batchAnalyzeVideos(
    videos: Array<{ url: string; competitor: string }>
  ): Promise<VideoAnalysisResult[]> {
    const results: VideoAnalysisResult[] = [];
    
    console.log(`\n🎯 Batch analyzing ${videos.length} competitor videos...\n`);
    
    for (const video of videos) {
      try {
        const result = await this.analyzeVideo(video.url, video.competitor);
        results.push(result);
        
        // Small delay to be respectful even if no rate limits
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Failed to analyze ${video.competitor}: ${error}`);
      }
    }
    
    return results;
  }

  /**
   * Generate feature parity matrix from analysis results
   */
  generateFeatureMatrix(results: VideoAnalysisResult[]): FeatureParityMatrix {
    const allFeatures = new Map<string, Map<string, ExtractedFeature>>();
    
    for (const result of results) {
      for (const feature of result.features) {
        if (!allFeatures.has(feature.name)) {
          allFeatures.set(feature.name, new Map());
        }
        allFeatures.get(feature.name)!.set(result.competitor, feature);
      }
    }

    const matrix: FeatureParityMatrix = {
      competitors: [...new Set(results.map(r => r.competitor))],
      features: [],
      bidDeedGaps: [],
      bidDeedAdvantages: [],
      generatedAt: new Date()
    };

    for (const [featureName, competitorMap] of allFeatures) {
      const featureRow: FeatureRow = {
        name: featureName,
        competitors: {},
        bidDeedHas: false,
        priority: 'low'
      };

      let maxPriority = 0;
      for (const [competitor, feature] of competitorMap) {
        featureRow.competitors[competitor] = true;
        if (!featureRow.bidDeedHas && feature.bidDeedHas) {
          featureRow.bidDeedHas = true;
        }
        const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 }[feature.priority];
        if (priorityScore > maxPriority) {
          maxPriority = priorityScore;
          featureRow.priority = feature.priority;
        }
      }

      matrix.features.push(featureRow);

      if (!featureRow.bidDeedHas) {
        matrix.bidDeedGaps.push(featureName);
      }
    }

    // Sort by priority
    matrix.features.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });

    return matrix;
  }

  private buildVideoAnalysisPrompt(competitor: string, analysisType: string): string {
    const basePrompt = `You are a competitive intelligence analyst for BidDeed.AI, a foreclosure auction platform.

Analyze this video from ${competitor} and extract:`;

    const sections: Record<string, string> = {
      features: `
1. FEATURES - List every feature shown with:
   - name: Feature name
   - description: What it does
   - category: core|premium|unique|table-stakes
   - complexity: 1-5 (implementation difficulty)
   - priority: critical|high|medium|low (for BidDeed.AI to implement)`,
      
      ui: `
2. UI PATTERNS - Document interface elements:
   - Navigation structure
   - Dashboard layouts
   - Data tables and visualization
   - Forms and input patterns
   - Mobile responsiveness indicators`,
      
      pricing: `
3. PRICING SIGNALS - Any pricing information:
   - Tier names
   - Price points mentioned
   - Feature gating
   - Target audience indicators`,
      
      marketing: `
4. MARKETING CLAIMS - Key value propositions:
   - Pain points addressed
   - Differentiators claimed
   - Social proof shown
   - Call-to-action language`
    };

    let prompt = basePrompt;
    
    if (analysisType === 'full') {
      prompt += Object.values(sections).join('\n');
    } else {
      prompt += sections[analysisType] || sections.features;
    }

    prompt += `

Return your analysis as a structured JSON object with these exact keys:
{
  "features": [...],
  "uiPatterns": [...],
  "pricingSignals": [...],
  "marketingClaims": [...],
  "technicalStack": [...],
  "summary": "..."
}`;

    return prompt;
  }

  private async makeRequest(messages: any[]): Promise<string> {
    this.requestCount++;
    this.lastRequestTime = new Date();

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('NVIDIA NIM API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  private parseVideoAnalysis(
    response: string,
    competitor: string,
    videoUrl: string
  ): VideoAnalysisResult {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      const parsed = jsonMatch 
        ? JSON.parse(jsonMatch[1] || jsonMatch[0])
        : { features: [], uiPatterns: [], pricingSignals: [], marketingClaims: [], technicalStack: [] };

      return {
        competitor,
        videoUrl,
        features: parsed.features || [],
        uiPatterns: parsed.uiPatterns || [],
        pricingSignals: parsed.pricingSignals || [],
        marketingClaims: parsed.marketingClaims || [],
        technicalStack: parsed.technicalStack || [],
        rawAnalysis: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to parse video analysis:', error);
      return {
        competitor,
        videoUrl,
        features: [],
        uiPatterns: [],
        pricingSignals: [],
        marketingClaims: [],
        technicalStack: [],
        rawAnalysis: response,
        timestamp: new Date()
      };
    }
  }

  private parseUIPatterns(response: string): UIPattern[] {
    try {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                        response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats(): { requestCount: number; lastRequest: Date | null } {
    return {
      requestCount: this.requestCount,
      lastRequest: this.lastRequestTime
    };
  }
}

export interface FeatureParityMatrix {
  competitors: string[];
  features: FeatureRow[];
  bidDeedGaps: string[];
  bidDeedAdvantages: string[];
  generatedAt: Date;
}

export interface FeatureRow {
  name: string;
  competitors: Record<string, boolean>;
  bidDeedHas: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}
