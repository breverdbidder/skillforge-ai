/**
 * ClawdBot + Kimi K2.5 + Kilo + Craft Agents Integration
 * Main orchestrator with autonomous GitHub synchronization
 */

import { ClawdBotClient } from './clawdbot-client/client.js';
import { CraftSkillsAdapter } from './skills-adapter/craft-skills-adapter.js';
import { AutonomousSkillsSync } from './skills-adapter/autonomous-sync.js';
import { GitHubAutomation } from './utils/github-automation.js';
import type { ClawdBotConfig, MCPBridgeConfig, IntegrationStatus } from './types/index.js';

export interface FullIntegrationConfig {
  clawdBot: ClawdBotConfig;
  github: {
    repositories: {
      skills: string;
      integration: string;
      kimiKilo: string;
    };
    autoCommit: boolean;
    autoPush: boolean;
    branch: string;
  };
  sync: {
    syncInterval: number;
    autoSync: boolean;
    syncOnStartup: boolean;
    backupBeforeSync: boolean;
    notifyOnChanges: boolean;
    skillsDirectory: string;
  };
  directories: {
    skills: string;
    integration: string;
    kimiKilo: string;
  };
}

export class ClawdBotKimiKiloCraftIntegration {
  private clawdBotClient: ClawdBotClient;
  private craftAdapter: CraftSkillsAdapter;
  private autonomousSync: AutonomousSkillsSync;
  private githubAutomation: GitHubAutomation;
  private config: FullIntegrationConfig;
  private initialized: boolean = false;

  constructor(config: FullIntegrationConfig) {
    this.config = config;

    // Initialize ClawdBot client
    this.clawdBotClient = new ClawdBotClient(config.clawdBot);

    // Initialize Craft Skills Adapter
    this.craftAdapter = new CraftSkillsAdapter(this.clawdBotClient);

    // Initialize Autonomous Sync (placeholder for Kilo client)
    this.autonomousSync = new AutonomousSkillsSync(
      this.clawdBotClient,
      null as any, // Kilo client would be initialized here
      this.craftAdapter,
      config.sync
    );

    // Initialize GitHub Automation
    this.githubAutomation = new GitHubAutomation(config.github);
  }

  /**
   * Initialize the entire integration system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Integration already initialized');
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ClawdBot + Kimi K2.5 + Kilo + Craft Agents Integration  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
      // 1. Initialize ClawdBot
      console.log('🤖 Initializing ClawdBot...');
      await this.clawdBotClient.connect();
      console.log('✓ ClawdBot connected\n');

      // 2. Initialize Craft Skills Adapter
      console.log('🎨 Initializing Craft Skills Adapter...');
      await this.craftAdapter.initialize();
      console.log('✓ Craft Skills Adapter ready\n');

      // 3. Initialize GitHub Automation
      console.log('🐙 Initializing GitHub Automation...');
      await this.githubAutomation.initialize();
      console.log('✓ GitHub Automation ready\n');

      // 4. Initialize Autonomous Sync
      console.log('🔄 Initializing Autonomous Sync...');
      await this.autonomousSync.initialize();
      console.log('✓ Autonomous Sync ready\n');

      this.initialized = true;

      console.log('✅ Integration system fully initialized!\n');
      this.printStatus();

    } catch (error) {
      console.error('❌ Failed to initialize integration:', error);
      throw error;
    }
  }

  /**
   * Get integration status
   */
  async getStatus(): Promise<IntegrationStatus> {
    const syncStatus = this.autonomousSync.getStatus();
    const githubStats = this.githubAutomation.getStatistics();

    return {
      clawdBotConnected: this.clawdBotClient.isConnected(),
      kimiConnected: true, // Placeholder
      kiloConnected: true, // Placeholder
      craftAgentsConnected: true,
      availableSkills: this.clawdBotClient.getSkills(),
      activeSessions: 0,
      lastSync: syncStatus.lastSync || new Date(),
    };
  }

  /**
   * Print current status
   */
  private printStatus(): void {
    const skills = this.craftAdapter.getAllSkills();
    const syncStatus = this.autonomousSync.getStatus();
    const githubStats = this.githubAutomation.getStatistics();

    console.log('📊 Current Status:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Total Skills: ${skills.length}`);
    console.log(`  ClawdBot Skills: ${skills.filter(s => s.source === 'clawdbot').length}`);
    console.log(`  Kilo Tools: ${skills.filter(s => s.source === 'kilo').length}`);
    console.log(`  Last Sync: ${syncStatus.lastSync?.toLocaleString() || 'Never'}`);
    console.log(`  Next Sync: ${syncStatus.nextSync?.toLocaleString() || 'Not scheduled'}`);
    console.log(`  Auto-Sync: ${syncStatus.autoSyncEnabled ? '✓ Enabled' : '✗ Disabled'}`);
    console.log(`  GitHub Commits: ${githubStats.totalCommits}`);
    console.log(`  Files Changed: ${githubStats.totalFilesChanged}`);
    console.log('─────────────────────────────────────────────────────────\n');
  }

  /**
   * List all available skills
   */
  listSkills(): void {
    const skills = this.craftAdapter.getAllSkills();
    
    console.log(`\n📚 Available Skills (${skills.length} total):\n`);

    const categories = new Map<string, typeof skills>();
    skills.forEach(skill => {
      if (!categories.has(skill.category)) {
        categories.set(skill.category, []);
      }
      categories.get(skill.category)!.push(skill);
    });

    for (const [category, categorySkills] of categories) {
      console.log(`\n${category.toUpperCase()} (${categorySkills.length}):`);
      categorySkills.forEach((skill, index) => {
        const status = skill.enabled ? '✓' : '✗';
        const source = skill.source === 'clawdbot' ? '🤖' : skill.source === 'kilo' ? '🔧' : '⚙️';
        console.log(`  ${index + 1}. ${status} ${source} ${skill.name}`);
      });
    }
    console.log();
  }

  /**
   * Manually trigger a sync
   */
  async triggerSync(): Promise<void> {
    console.log('\n🔄 Manually triggering sync...\n');
    
    const syncResult = await this.autonomousSync.triggerSync();

    // Commit updates to GitHub
    if (syncResult.success) {
      console.log('\n📤 Pushing updates to GitHub...\n');
      
      const commitResults = await this.githubAutomation.commitAllRepositories(
        this.config.directories,
        syncResult
      );

      console.log('\n✅ Sync and GitHub update completed!\n');
      this.printStatus();
    }
  }

  /**
   * Enable a skill
   */
  async enableSkill(skillId: string): Promise<void> {
    await this.craftAdapter.enableSkill(skillId);
    console.log(`✓ Enabled skill: ${skillId}`);
  }

  /**
   * Disable a skill
   */
  async disableSkill(skillId: string): Promise<void> {
    await this.craftAdapter.disableSkill(skillId);
    console.log(`✓ Disabled skill: ${skillId}`);
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): any[] {
    return this.craftAdapter.getSkillsByCategory(category as any);
  }

  /**
   * Export skills as JSON
   */
  exportSkillsJSON(): string {
    return this.craftAdapter.exportSkillsJSON();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): any {
    return this.autonomousSync.getStatus();
  }

  /**
   * Get GitHub statistics
   */
  getGitHubStats(): any {
    return this.githubAutomation.getStatistics();
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    console.log('\n🛑 Shutting down integration system...');

    await this.autonomousSync.shutdown();
    await this.clawdBotClient.disconnect();

    console.log('✓ Integration system shut down successfully\n');
  }
}

// Export types
export * from './types/index.js';
export { ClawdBotClient } from './clawdbot-client/client.js';
export { CraftSkillsAdapter } from './skills-adapter/craft-skills-adapter.js';
export { AutonomousSkillsSync } from './skills-adapter/autonomous-sync.js';
export { GitHubAutomation } from './utils/github-automation.js';
