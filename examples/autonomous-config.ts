/**
 * Example configuration for autonomous GitHub integration
 */

import type { FullIntegrationConfig } from '../src/index.js';

export const autonomousConfig: FullIntegrationConfig = {
  // ClawdBot Configuration
  clawdBot: {
    localMode: true,
    messagingPlatform: 'telegram',
    llmProvider: 'claude',
    llmModel: 'claude-3-5-sonnet-20241022',
  },

  // GitHub Configuration
  github: {
    repositories: {
      skills: 'breverdbidder/clawdbot-skills',
      integration: 'breverdbidder/clawdbot-integration',
      kimiKilo: 'breverdbidder/kimi-kilo-craft-integration',
    },
    autoCommit: true,
    autoPush: true,
    branch: 'main',
  },

  // Autonomous Sync Configuration
  sync: {
    syncInterval: 24 * 60 * 60 * 1000, // 24 hours
    autoSync: true,
    syncOnStartup: true,
    backupBeforeSync: true,
    notifyOnChanges: true,
    skillsDirectory: '/home/ubuntu/clawdbot-skills',
  },

  // Directory Paths
  directories: {
    skills: '/home/ubuntu/clawdbot-skills',
    integration: '/home/ubuntu/clawdbot-integration',
    kimiKilo: '/home/ubuntu/kimi-kilo-craft-integration',
  },
};

// Example: Remote ClawdBot instance
export const remoteConfig: FullIntegrationConfig = {
  clawdBot: {
    apiEndpoint: 'https://your-clawdbot-instance.com/api',
    authToken: process.env.CLAWDBOT_API_TOKEN,
    localMode: false,
    messagingPlatform: 'telegram',
    llmProvider: 'claude',
  },

  github: {
    repositories: {
      skills: 'breverdbidder/clawdbot-skills',
      integration: 'breverdbidder/clawdbot-integration',
      kimiKilo: 'breverdbidder/kimi-kilo-craft-integration',
    },
    autoCommit: true,
    autoPush: true,
    branch: 'main',
  },

  sync: {
    syncInterval: 12 * 60 * 60 * 1000, // 12 hours (more frequent for remote)
    autoSync: true,
    syncOnStartup: true,
    backupBeforeSync: true,
    notifyOnChanges: true,
    skillsDirectory: '/home/ubuntu/clawdbot-skills',
  },

  directories: {
    skills: '/home/ubuntu/clawdbot-skills',
    integration: '/home/ubuntu/clawdbot-integration',
    kimiKilo: '/home/ubuntu/kimi-kilo-craft-integration',
  },
};

// Example: Development configuration (no auto-push)
export const devConfig: FullIntegrationConfig = {
  clawdBot: {
    localMode: true,
    messagingPlatform: 'telegram',
    llmProvider: 'claude',
  },

  github: {
    repositories: {
      skills: 'breverdbidder/clawdbot-skills-dev',
      integration: 'breverdbidder/clawdbot-integration-dev',
      kimiKilo: 'breverdbidder/kimi-kilo-craft-integration-dev',
    },
    autoCommit: true,
    autoPush: false, // Manual push in dev
    branch: 'develop',
  },

  sync: {
    syncInterval: 60 * 60 * 1000, // 1 hour for testing
    autoSync: true,
    syncOnStartup: true,
    backupBeforeSync: true,
    notifyOnChanges: true,
    skillsDirectory: '/home/ubuntu/clawdbot-skills-dev',
  },

  directories: {
    skills: '/home/ubuntu/clawdbot-skills-dev',
    integration: '/home/ubuntu/clawdbot-integration',
    kimiKilo: '/home/ubuntu/kimi-kilo-craft-integration',
  },
};
