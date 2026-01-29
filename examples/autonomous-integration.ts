/**
 * Autonomous Integration Example
 * Demonstrates the full autonomous GitHub integration workflow
 */

import { ClawdBotKimiKiloCraftIntegration } from '../src/index.js';
import { autonomousConfig } from './autonomous-config.js';

async function main() {
  console.log('🚀 Starting Autonomous ClawdBot Integration\n');

  // Create integration instance
  const integration = new ClawdBotKimiKiloCraftIntegration(autonomousConfig);

  try {
    // Initialize the integration
    await integration.initialize();

    // List all available skills
    console.log('\n📋 Listing all skills...\n');
    integration.listSkills();

    // Get current status
    console.log('\n📊 Current Status:\n');
    const status = await integration.getStatus();
    console.log(`  ClawdBot: ${status.clawdBotConnected ? '✓' : '✗'} Connected`);
    console.log(`  Kimi K2.5: ${status.kimiConnected ? '✓' : '✗'} Connected`);
    console.log(`  Kilo: ${status.kiloConnected ? '✓' : '✗'} Connected`);
    console.log(`  Craft Agents: ${status.craftAgentsConnected ? '✓' : '✗'} Connected`);
    console.log(`  Total Skills: ${status.availableSkills.length}`);

    // Get sync status
    console.log('\n🔄 Sync Status:\n');
    const syncStatus = integration.getSyncStatus();
    console.log(`  Last Sync: ${syncStatus.lastSync?.toLocaleString() || 'Never'}`);
    console.log(`  Next Sync: ${syncStatus.nextSync?.toLocaleString() || 'Not scheduled'}`);
    console.log(`  Auto-Sync: ${syncStatus.autoSyncEnabled ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`  Total Syncs: ${syncStatus.totalSyncs}`);

    // Get GitHub statistics
    console.log('\n🐙 GitHub Statistics:\n');
    const githubStats = integration.getGitHubStats();
    console.log(`  Total Commits: ${githubStats.totalCommits}`);
    console.log(`  Successful: ${githubStats.successfulCommits}`);
    console.log(`  Failed: ${githubStats.failedCommits}`);
    console.log(`  Files Changed: ${githubStats.totalFilesChanged}`);

    // Demonstrate manual sync trigger
    console.log('\n🔄 Triggering manual sync...\n');
    await integration.triggerSync();

    // Export skills as JSON
    console.log('\n💾 Exporting skills as JSON...\n');
    const skillsJSON = integration.exportSkillsJSON();
    console.log(`Exported ${JSON.parse(skillsJSON).length} skills`);

    // Keep the process running for autonomous sync
    console.log('\n✅ Integration is now running autonomously!');
    console.log('   - Skills will sync every 24 hours');
    console.log('   - Changes will be automatically committed to GitHub');
    console.log('   - Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n⏸️  Shutting down gracefully...');
      await integration.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n⏸️  Shutting down gracefully...');
      await integration.cleanup();
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    await integration.cleanup();
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
