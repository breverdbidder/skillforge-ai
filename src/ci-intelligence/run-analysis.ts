#!/usr/bin/env node
/**
 * CI Analysis Runner
 * Execute competitive intelligence video analysis
 * 
 * Usage:
 *   node run-analysis.js                    # Analyze all competitors
 *   node run-analysis.js --competitor=propertyonion
 *   node run-analysis.js --type=features
 */

import { CIIntelligenceOrchestrator } from './orchestrator.js';
import { getAllCompetitors, getCompetitor } from './competitor-registry.js';

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};
  
  for (const arg of args) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      options[match[1]] = match[2];
    }
  }

  // Validate environment
  const requiredEnvVars = [
    'NVIDIA_NIM_API_KEY',
    'SUPABASE_URL', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════╗
║     SkillForge AI - Competitive Intelligence Analyzer      ║
║                                                            ║
║     🎬 Powered by NVIDIA NIM Kimi K2.5 (FREE!)            ║
╚════════════════════════════════════════════════════════════╝
`);

  // Initialize orchestrator
  const orchestrator = new CIIntelligenceOrchestrator({
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  });

  await orchestrator.initialize();

  try {
    if (options.competitor) {
      // Analyze specific competitor
      const competitor = getCompetitor(options.competitor);
      
      if (!competitor) {
        console.error(`❌ Competitor not found: ${options.competitor}`);
        console.log('\nAvailable competitors:');
        getAllCompetitors().forEach(c => {
          console.log(`  - ${c.id}: ${c.name}`);
        });
        process.exit(1);
      }

      console.log(`\n🎯 Analyzing single competitor: ${competitor.name}\n`);
      const results = await orchestrator.analyzeCompetitor(options.competitor);
      
      console.log(`\n✅ Analysis complete!`);
      console.log(`   Videos analyzed: ${results.length}`);
      console.log(`   Features extracted: ${results.reduce((sum, r) => sum + r.features.length, 0)}`);

    } else {
      // Run full analysis
      console.log('\n🎯 Running full competitive analysis...\n');
      const matrix = await orchestrator.runFullAnalysis();
      
      console.log(`\n✅ Full analysis complete!`);
      console.log(`   Competitors: ${matrix.competitors.length}`);
      console.log(`   Total features: ${matrix.features.length}`);
      console.log(`   BidDeed gaps: ${matrix.bidDeedGaps.length}`);
    }

    // Print NVIDIA NIM stats
    const stats = orchestrator.getKimiStats();
    console.log(`\n📊 Kimi K2.5 Stats:`);
    console.log(`   Requests made: ${stats.requestCount}`);
    console.log(`   Cost: $0.00 (FREE TIER! 🎉)`);

  } catch (error) {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
