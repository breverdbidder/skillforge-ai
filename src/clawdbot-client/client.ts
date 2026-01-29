/**
 * ClawdBot Client
 * Connects to ClawdBot/MoltBot instance and manages skills
 */

import axios, { AxiosInstance } from 'axios';
import type {
  ClawdBotConfig,
  ClawdBotSkill,
  SkillExecutionContext,
  SkillExecutionResult,
  ClawdBotMessage,
  ClawdBotResponse,
} from '../types/index.js';

export class ClawdBotClient {
  private config: ClawdBotConfig;
  private httpClient?: AxiosInstance;
  private connected: boolean = false;
  private availableSkills: Map<string, ClawdBotSkill> = new Map();

  constructor(config: ClawdBotConfig) {
    this.config = config;

    if (!config.localMode && config.apiEndpoint) {
      this.httpClient = axios.create({
        baseURL: config.apiEndpoint,
        headers: {
          'Authorization': `Bearer ${config.authToken || ''}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    }
  }

  /**
   * Connect to ClawdBot instance
   */
  async connect(): Promise<void> {
    if (this.connected) {
      console.log('Already connected to ClawdBot');
      return;
    }

    try {
      if (this.config.localMode) {
        console.log('Running in local mode - ClawdBot assumed to be running locally');
        this.connected = true;
      } else {
        // Verify remote connection
        if (!this.httpClient) {
          throw new Error('HTTP client not initialized for remote mode');
        }
        
        const response = await this.httpClient.get('/health');
        if (response.status === 200) {
          console.log('Successfully connected to remote ClawdBot instance');
          this.connected = true;
        }
      }

      // Load available skills
      await this.loadSkills();
    } catch (error) {
      throw new Error(
        `Failed to connect to ClawdBot: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load available skills from ClawdBot
   */
  async loadSkills(): Promise<void> {
    try {
      if (this.config.localMode) {
        // In local mode, load skills from local configuration
        console.log('Loading skills from local configuration...');
        // This would typically read from a local skills directory
        this.availableSkills = new Map();
      } else {
        // Load skills from remote API
        if (!this.httpClient) {
          throw new Error('HTTP client not initialized');
        }

        const response = await this.httpClient.get('/skills');
        const skills: ClawdBotSkill[] = response.data.skills || [];
        
        this.availableSkills.clear();
        skills.forEach(skill => {
          this.availableSkills.set(skill.id, skill);
        });

        console.log(`Loaded ${this.availableSkills.size} skills from ClawdBot`);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
      throw error;
    }
  }

  /**
   * Get all available skills
   */
  getSkills(): ClawdBotSkill[] {
    return Array.from(this.availableSkills.values());
  }

  /**
   * Get a specific skill by ID
   */
  getSkill(skillId: string): ClawdBotSkill | undefined {
    return this.availableSkills.get(skillId);
  }

  /**
   * Execute a skill
   */
  async executeSkill(context: SkillExecutionContext): Promise<SkillExecutionResult> {
    if (!this.connected) {
      throw new Error('Not connected to ClawdBot. Call connect() first.');
    }

    const startTime = Date.now();
    const logs: string[] = [];

    try {
      const skill = this.availableSkills.get(context.skillId);
      if (!skill) {
        throw new Error(`Skill not found: ${context.skillId}`);
      }

      if (!skill.enabled) {
        throw new Error(`Skill is disabled: ${context.skillId}`);
      }

      logs.push(`Executing skill: ${skill.name}`);

      if (this.config.localMode) {
        // Local execution (would typically invoke local skill runner)
        logs.push('Executing in local mode');
        return {
          success: true,
          data: { message: 'Skill executed locally (stub)' },
          logs,
          duration: Date.now() - startTime,
        };
      } else {
        // Remote execution
        if (!this.httpClient) {
          throw new Error('HTTP client not initialized');
        }

        const response = await this.httpClient.post('/skills/execute', {
          skillId: context.skillId,
          parameters: context.parameters,
          userId: context.userId,
          sessionId: context.sessionId,
        });

        logs.push('Skill executed successfully');

        return {
          success: true,
          data: response.data,
          logs,
          duration: Date.now() - startTime,
        };
      }
    } catch (error) {
      logs.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Send a message to ClawdBot
   */
  async sendMessage(message: string, userId?: string): Promise<ClawdBotResponse> {
    if (!this.connected) {
      throw new Error('Not connected to ClawdBot');
    }

    try {
      if (this.config.localMode) {
        // Local message handling
        return {
          messageId: `local-${Date.now()}`,
          content: 'Local mode response (stub)',
          skillsUsed: [],
          timestamp: new Date(),
        };
      } else {
        // Remote message handling
        if (!this.httpClient) {
          throw new Error('HTTP client not initialized');
        }

        const response = await this.httpClient.post('/messages', {
          content: message,
          userId: userId || 'anonymous',
          platform: this.config.messagingPlatform,
        });

        return response.data;
      }
    } catch (error) {
      throw new Error(
        `Failed to send message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Enable a skill
   */
  async enableSkill(skillId: string): Promise<void> {
    const skill = this.availableSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    skill.enabled = true;
    this.availableSkills.set(skillId, skill);
    console.log(`Enabled skill: ${skill.name}`);
  }

  /**
   * Disable a skill
   */
  async disableSkill(skillId: string): Promise<void> {
    const skill = this.availableSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    skill.enabled = false;
    this.availableSkills.set(skillId, skill);
    console.log(`Disabled skill: ${skill.name}`);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get configuration
   */
  getConfig(): ClawdBotConfig {
    return { ...this.config };
  }

  /**
   * Disconnect from ClawdBot
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.availableSkills.clear();
    console.log('Disconnected from ClawdBot');
  }
}
