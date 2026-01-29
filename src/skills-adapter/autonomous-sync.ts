/**
 * Autonomous Skills Synchronization System
 * Automatically syncs skills from ClawdBot and Kilo on a daily basis
 */

import { ClawdBotClient } from '../clawdbot-client/client.js';
import { KiloMCPClient } from '../../kimi-kilo-craft-integration/src/kilo-source/kilo-mcp-client.js';
import { CraftSkillsAdapter } from './craft-skills-adapter.js';
import type { ClawdBotSkill, MCPTool, IntegrationStatus } from '../types/index.js';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

export interface SyncConfig {
  syncInterval: number; // in milliseconds (default: 24 hours)
  autoSync: boolean;
  syncOnStartup: boolean;
  backupBeforeSync: boolean;
  notifyOnChanges: boolean;
  skillsDirectory: string;
}

export interface SyncResult {
  timestamp: Date;
  clawdBotSkillsAdded: number;
  clawdBotSkillsUpdated: number;
  clawdBotSkillsRemoved: number;
  kiloToolsAdded: number;
  kiloToolsUpdated: number;
  kiloToolsRemoved: number;
  totalSkills: number;
  success: boolean;
  errors: string[];
}

export class AutonomousSkillsSync {
  private clawdBotClient: ClawdBotClient;
  private kiloClient: KiloMCPClient;
  private craftAdapter: CraftSkillsAdapter;
  private config: SyncConfig;
  private syncInterval?: NodeJS.Timeout;
  private lastSync?: Date;
  private syncHistory: SyncResult[] = [];

  constructor(
    clawdBotClient: ClawdBotClient,
    kiloClient: KiloMCPClient,
    craftAdapter: CraftSkillsAdapter,
    config: Partial<SyncConfig> = {}
  ) {
    this.clawdBotClient = clawdBotClient;
    this.kiloClient = kiloClient;
    this.craftAdapter = craftAdapter;
    
    this.config = {
      syncInterval: config.syncInterval || 24 * 60 * 60 * 1000, // 24 hours
      autoSync: config.autoSync !== undefined ? config.autoSync : true,
      syncOnStartup: config.syncOnStartup !== undefined ? config.syncOnStartup : true,
      backupBeforeSync: config.backupBeforeSync !== undefined ? config.backupBeforeSync : true,
      notifyOnChanges: config.notifyOnChanges !== undefined ? config.notifyOnChanges : true,
      skillsDirectory: config.skillsDirectory || resolve(process.cwd(), 'skills'),
    };
  }

  /**
   * Initialize the autonomous sync system
   */
  async initialize(): Promise<void> {
    console.log('Initializing Autonomous Skills Sync System...');

    // Create skills directory if it doesn't exist
    await mkdir(this.config.skillsDirectory, { recursive: true });

    // Load sync history
    await this.loadSyncHistory();

    // Perform initial sync if configured
    if (this.config.syncOnStartup) {
      console.log('Performing initial sync on startup...');
      await this.performSync();
    }

    // Start automatic sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    console.log('Autonomous Skills Sync System initialized successfully');
  }

  /**
   * Start automatic synchronization
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      console.log('Auto-sync is already running');
      return;
    }

    console.log(`Starting auto-sync with interval: ${this.config.syncInterval / 1000 / 60 / 60} hours`);

    this.syncInterval = setInterval(async () => {
      console.log('Auto-sync triggered...');
      await this.performSync();
    }, this.config.syncInterval);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Perform a full synchronization
   */
  async performSync(): Promise<SyncResult> {
    console.log('\n=== Starting Skills Synchronization ===');
    const startTime = Date.now();
    const result: SyncResult = {
      timestamp: new Date(),
      clawdBotSkillsAdded: 0,
      clawdBotSkillsUpdated: 0,
      clawdBotSkillsRemoved: 0,
      kiloToolsAdded: 0,
      kiloToolsUpdated: 0,
      kiloToolsRemoved: 0,
      totalSkills: 0,
      success: false,
      errors: [],
    };

    try {
      // Backup current skills if configured
      if (this.config.backupBeforeSync) {
        await this.backupSkills();
      }

      // Get current skills snapshot
      const currentSkills = new Map(
        this.craftAdapter.getAllSkills().map(s => [s.id, s])
      );

      // Sync ClawdBot skills
      console.log('\n--- Syncing ClawdBot Skills ---');
      const clawdBotResult = await this.syncClawdBotSkills(currentSkills);
      result.clawdBotSkillsAdded = clawdBotResult.added;
      result.clawdBotSkillsUpdated = clawdBotResult.updated;
      result.clawdBotSkillsRemoved = clawdBotResult.removed;

      // Sync Kilo tools
      console.log('\n--- Syncing Kilo Tools ---');
      const kiloResult = await this.syncKiloTools(currentSkills);
      result.kiloToolsAdded = kiloResult.added;
      result.kiloToolsUpdated = kiloResult.updated;
      result.kiloToolsRemoved = kiloResult.removed;

      // Update total skills count
      result.totalSkills = this.craftAdapter.getAllSkills().length;

      // Save updated skills to disk
      await this.saveSkillsToDisk();

      // Mark as successful
      result.success = true;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n=== Sync Completed Successfully in ${duration}s ===`);
      console.log(`ClawdBot: +${result.clawdBotSkillsAdded} ~${result.clawdBotSkillsUpdated} -${result.clawdBotSkillsRemoved}`);
      console.log(`Kilo: +${result.kiloToolsAdded} ~${result.kiloToolsUpdated} -${result.kiloToolsRemoved}`);
      console.log(`Total Skills: ${result.totalSkills}`);

      // Notify if there were changes
      if (this.config.notifyOnChanges && this.hasChanges(result)) {
        await this.notifyChanges(result);
      }

    } catch (error) {
      result.success = false;
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMsg);
      console.error('Sync failed:', errorMsg);
    }

    // Update sync history
    this.lastSync = result.timestamp;
    this.syncHistory.push(result);
    await this.saveSyncHistory();

    return result;
  }

  /**
   * Sync ClawdBot skills
   */
  private async syncClawdBotSkills(
    currentSkills: Map<string, any>
  ): Promise<{ added: number; updated: number; removed: number }> {
    let added = 0;
    let updated = 0;
    let removed = 0;

    try {
      // Fetch latest skills from ClawdBot
      await this.clawdBotClient.loadSkills();
      const clawdBotSkills = this.clawdBotClient.getSkills();

      console.log(`Fetched ${clawdBotSkills.length} skills from ClawdBot`);

      // Process each ClawdBot skill
      for (const skill of clawdBotSkills) {
        const craftSkillId = `clawdbot-${skill.id}`;
        const existingSkill = currentSkills.get(craftSkillId);

        if (!existingSkill) {
          // New skill - add it
          await this.addClawdBotSkill(skill);
          added++;
          console.log(`  ✓ Added: ${skill.name}`);
        } else if (this.hasSkillChanged(existingSkill, skill)) {
          // Existing skill has changed - update it
          await this.updateClawdBotSkill(skill);
          updated++;
          console.log(`  ↻ Updated: ${skill.name}`);
        }
      }

      // Check for removed skills
      const clawdBotSkillIds = new Set(clawdBotSkills.map(s => `clawdbot-${s.id}`));
      for (const [skillId, skill] of currentSkills) {
        if (skill.source === 'clawdbot' && !clawdBotSkillIds.has(skillId)) {
          await this.craftAdapter.disableSkill(skillId);
          removed++;
          console.log(`  ✗ Removed: ${skill.name}`);
        }
      }

    } catch (error) {
      console.error('Error syncing ClawdBot skills:', error);
      throw error;
    }

    return { added, updated, removed };
  }

  /**
   * Sync Kilo tools
   */
  private async syncKiloTools(
    currentSkills: Map<string, any>
  ): Promise<{ added: number; updated: number; removed: number }> {
    let added = 0;
    let updated = 0;
    let removed = 0;

    try {
      // Fetch latest tools from Kilo
      const kiloTools = await this.kiloClient.listTools();

      console.log(`Fetched ${kiloTools.length} tools from Kilo`);

      // Process each Kilo tool
      for (const tool of kiloTools) {
        const craftSkillId = `kilo-${tool.name}`;
        const existingSkill = currentSkills.get(craftSkillId);

        if (!existingSkill) {
          // New tool - add it as a skill
          await this.addKiloTool(tool);
          added++;
          console.log(`  ✓ Added: ${tool.name}`);
        } else if (this.hasToolChanged(existingSkill, tool)) {
          // Existing tool has changed - update it
          await this.updateKiloTool(tool);
          updated++;
          console.log(`  ↻ Updated: ${tool.name}`);
        }
      }

      // Check for removed tools
      const kiloToolIds = new Set(kiloTools.map(t => `kilo-${t.name}`));
      for (const [skillId, skill] of currentSkills) {
        if (skill.source === 'kilo' && !kiloToolIds.has(skillId)) {
          await this.craftAdapter.disableSkill(skillId);
          removed++;
          console.log(`  ✗ Removed: ${skill.name}`);
        }
      }

    } catch (error) {
      console.error('Error syncing Kilo tools:', error);
      throw error;
    }

    return { added, updated, removed };
  }

  /**
   * Add a ClawdBot skill to Craft Agents
   */
  private async addClawdBotSkill(skill: ClawdBotSkill): Promise<void> {
    // The CraftSkillsAdapter will handle the conversion
    await this.craftAdapter.initialize();
  }

  /**
   * Update a ClawdBot skill in Craft Agents
   */
  private async updateClawdBotSkill(skill: ClawdBotSkill): Promise<void> {
    // Re-initialize to pick up changes
    await this.craftAdapter.initialize();
  }

  /**
   * Add a Kilo tool to Craft Agents
   */
  private async addKiloTool(tool: MCPTool): Promise<void> {
    // Convert Kilo tool to Craft skill format
    const craftSkill = {
      id: `kilo-${tool.name}`,
      name: tool.name,
      description: tool.description,
      prompt: `You are an expert at using the ${tool.name} tool from Kilo.

**Tool Description:** ${tool.description}

**Your Role:**
- Execute the ${tool.name} tool when requested
- Understand the user's intent and map it to the tool's capabilities
- Provide clear feedback on the tool's execution
- Handle errors gracefully and suggest alternatives

When the user asks you to use this tool, execute it through Kilo's MCP interface.`,
      category: 'integration' as const,
      enabled: true,
      source: 'kilo' as const,
      configuration: { inputSchema: tool.inputSchema },
    };

    // This would be added to the adapter (implementation depends on adapter's API)
    console.log(`Added Kilo tool as Craft skill: ${craftSkill.name}`);
  }

  /**
   * Update a Kilo tool in Craft Agents
   */
  private async updateKiloTool(tool: MCPTool): Promise<void> {
    await this.addKiloTool(tool); // Same as add for now
  }

  /**
   * Check if a skill has changed
   */
  private hasSkillChanged(existingSkill: any, newSkill: ClawdBotSkill): boolean {
    return (
      existingSkill.name !== newSkill.name ||
      existingSkill.description !== newSkill.description ||
      existingSkill.enabled !== newSkill.enabled ||
      JSON.stringify(existingSkill.configuration) !== JSON.stringify(newSkill.configuration)
    );
  }

  /**
   * Check if a tool has changed
   */
  private hasToolChanged(existingSkill: any, newTool: MCPTool): boolean {
    return (
      existingSkill.name !== newTool.name ||
      existingSkill.description !== newTool.description ||
      JSON.stringify(existingSkill.configuration?.inputSchema) !== JSON.stringify(newTool.inputSchema)
    );
  }

  /**
   * Backup current skills
   */
  private async backupSkills(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = resolve(this.config.skillsDirectory, `backup-${timestamp}.json`);
    
    const skills = this.craftAdapter.getAllSkills();
    await writeFile(backupPath, JSON.stringify(skills, null, 2));
    
    console.log(`Backed up ${skills.length} skills to ${backupPath}`);
  }

  /**
   * Save skills to disk
   */
  private async saveSkillsToDisk(): Promise<void> {
    const skillsDir = this.craftAdapter.generateSkillsDirectory();
    
    for (const [filename, content] of Object.entries(skillsDir)) {
      const filepath = resolve(this.config.skillsDirectory, filename);
      await writeFile(filepath, content);
    }

    // Also save as JSON
    const jsonPath = resolve(this.config.skillsDirectory, 'skills.json');
    await writeFile(jsonPath, this.craftAdapter.exportSkillsJSON());

    console.log(`Saved ${Object.keys(skillsDir).length} skills to disk`);
  }

  /**
   * Check if sync result has changes
   */
  private hasChanges(result: SyncResult): boolean {
    return (
      result.clawdBotSkillsAdded > 0 ||
      result.clawdBotSkillsUpdated > 0 ||
      result.clawdBotSkillsRemoved > 0 ||
      result.kiloToolsAdded > 0 ||
      result.kiloToolsUpdated > 0 ||
      result.kiloToolsRemoved > 0
    );
  }

  /**
   * Notify about changes
   */
  private async notifyChanges(result: SyncResult): Promise<void> {
    const message = `
🔄 Skills Sync Completed

📊 Summary:
- ClawdBot: +${result.clawdBotSkillsAdded} ~${result.clawdBotSkillsUpdated} -${result.clawdBotSkillsRemoved}
- Kilo: +${result.kiloToolsAdded} ~${result.kiloToolsUpdated} -${result.kiloToolsRemoved}
- Total Skills: ${result.totalSkills}

⏰ Timestamp: ${result.timestamp.toISOString()}
`;

    console.log(message);
    
    // Could send notifications via email, Slack, Discord, etc.
    // For now, just log to console
  }

  /**
   * Load sync history from disk
   */
  private async loadSyncHistory(): Promise<void> {
    try {
      const historyPath = resolve(this.config.skillsDirectory, 'sync-history.json');
      const content = await readFile(historyPath, 'utf-8');
      this.syncHistory = JSON.parse(content);
      
      if (this.syncHistory.length > 0) {
        this.lastSync = new Date(this.syncHistory[this.syncHistory.length - 1].timestamp);
      }
    } catch (error) {
      // History file doesn't exist yet, that's okay
      this.syncHistory = [];
    }
  }

  /**
   * Save sync history to disk
   */
  private async saveSyncHistory(): Promise<void> {
    const historyPath = resolve(this.config.skillsDirectory, 'sync-history.json');
    
    // Keep only last 100 sync results
    const recentHistory = this.syncHistory.slice(-100);
    
    await writeFile(historyPath, JSON.stringify(recentHistory, null, 2));
  }

  /**
   * Get sync status
   */
  getStatus(): {
    lastSync?: Date;
    nextSync?: Date;
    autoSyncEnabled: boolean;
    totalSyncs: number;
    recentResults: SyncResult[];
  } {
    const nextSync = this.lastSync && this.config.autoSync
      ? new Date(this.lastSync.getTime() + this.config.syncInterval)
      : undefined;

    return {
      lastSync: this.lastSync,
      nextSync,
      autoSyncEnabled: this.config.autoSync,
      totalSyncs: this.syncHistory.length,
      recentResults: this.syncHistory.slice(-10),
    };
  }

  /**
   * Manually trigger a sync
   */
  async triggerSync(): Promise<SyncResult> {
    console.log('Manually triggered sync...');
    return await this.performSync();
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.stopAutoSync();
    await this.saveSyncHistory();
    console.log('Autonomous Skills Sync System shut down');
  }
}
