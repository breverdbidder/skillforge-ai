/**
 * Type definitions for ClawdBot + Kimi K2.5 + Kilo + Craft Agents Integration
 */

export interface ClawdBotConfig {
  apiEndpoint?: string;
  authToken?: string;
  localMode: boolean;
  messagingPlatform: 'telegram' | 'whatsapp' | 'discord' | 'slack' | 'google-chat' | 'imessage';
  llmProvider: 'claude' | 'gpt' | 'local';
  llmModel?: string;
}

export interface ClawdBotSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  enabled: boolean;
  configuration?: Record<string, unknown>;
  dependencies?: string[];
}

export interface SkillExecutionContext {
  skillId: string;
  parameters: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface SkillExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  logs?: string[];
  duration?: number;
}

export interface MCPBridgeConfig {
  clawdbot: ClawdBotConfig;
  kilo: {
    mcpServerUrl?: string;
    transport: 'stdio' | 'http';
    command?: string;
    args?: string[];
  };
  craftAgents: {
    sourceId: string;
    sourceName: string;
    enabled: boolean;
  };
}

export interface IntegratedSkill {
  clawdBotSkill: ClawdBotSkill;
  mcpTool?: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  };
  bridgeAdapter: 'direct' | 'proxy' | 'transform';
}

export interface ClawdBotMessage {
  id: string;
  platform: string;
  userId: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ClawdBotResponse {
  messageId: string;
  content: string;
  skillsUsed: string[];
  timestamp: Date;
  tokens?: {
    input: number;
    output: number;
    cost: number;
  };
}

export interface IntegrationStatus {
  clawdBotConnected: boolean;
  kimiConnected: boolean;
  kiloConnected: boolean;
  craftAgentsConnected: boolean;
  availableSkills: ClawdBotSkill[];
  activeSessions: number;
  lastSync: Date;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: ClawdBotSkill[];
}

// Skill categories based on the 100+ ClawdBot tools
export const SKILL_CATEGORIES = [
  'productivity',
  'development',
  'finance',
  'content-creation',
  'security',
  'integration',
  'research',
  'communication',
  'automation',
  'monitoring'
] as const;

export type SkillCategoryType = typeof SKILL_CATEGORIES[number];
