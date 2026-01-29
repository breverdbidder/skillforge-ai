/**
 * SkillForge AI Server
 * Main server entry point for Render.com deployment
 */

import { ClawdBotKimiKiloCraftIntegration } from './index.js';
import { createHealthCheckServer } from './api/health.js';
import { resolve } from 'path';

// Configuration from environment variables
const config = {
  clawdBot: {
    apiEndpoint: process.env.CLAWDBOT_API_ENDPOINT,
    authToken: process.env.CLAWDBOT_API_TOKEN,
    localMode: process.env.CLAWDBOT_LOCAL_MODE === 'true',
    messagingPlatform: (process.env.CLAWDBOT_MESSAGING_PLATFORM || 'telegram') as any,
    llmProvider: (process.env.CLAWDBOT_LLM_PROVIDER || 'claude') as any,
    llmModel: process.env.CLAWDBOT_LLM_MODEL,
  },

  github: {
    repositories: {
      skills: process.env.GITHUB_REPO_SKILLS || 'breverdbidder/skillforge-skills',
      integration: process.env.GITHUB_REPO_INTEGRATION || 'breverdbidder/skillforge-integration',
      kimiKilo: process.env.GITHUB_REPO_KIMI_KILO || 'breverdbidder/kimi-kilo-craft-integration',
    },
    autoCommit: process.env.AUTO_COMMIT !== 'false',
    autoPush: process.env.AUTO_PUSH !== 'false',
    branch: process.env.GITHUB_BRANCH || 'main',
  },

  sync: {
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '86400000'), // 24 hours default
    autoSync: process.env.AUTO_SYNC !== 'false',
    syncOnStartup: process.env.SYNC_ON_STARTUP !== 'false',
    backupBeforeSync: process.env.BACKUP_BEFORE_SYNC !== 'false',
    notifyOnChanges: process.env.NOTIFY_ON_CHANGES !== 'false',
    skillsDirectory: process.env.SKILLS_DIRECTORY || resolve(process.cwd(), 'skills'),
  },

  directories: {
    skills: process.env.SKILLS_DIRECTORY || resolve(process.cwd(), 'skills'),
    integration: process.env.INTEGRATION_DIRECTORY || process.cwd(),
    kimiKilo: process.env.KIMI_KILO_DIRECTORY || resolve(process.cwd(), '../kimi-kilo-craft-integration'),
  },
};

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              SkillForge AI - Starting Server              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Start health check server
  const port = parseInt(process.env.PORT || '3000');
  createHealthCheckServer(port);

  // Initialize integration
  const integration = new ClawdBotKimiKiloCraftIntegration(config);

  try {
    await integration.initialize();

    console.log('\n✅ SkillForge AI is running!');
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log('   Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n\n⏸️  Received ${signal}, shutting down gracefully...`);
      await integration.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Keep process alive
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('\n❌ Failed to start SkillForge AI:', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
