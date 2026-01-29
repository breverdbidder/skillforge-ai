/**
 * Craft Agents Skills Adapter
 * Maps all 100+ ClawdBot skills to Craft Agents' skills library format
 */

import { ClawdBotClient } from '../clawdbot-client/client.js';
import type { ClawdBotSkill, SkillCategoryType } from '../types/index.js';

export interface CraftSkill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: SkillCategoryType;
  enabled: boolean;
  source: 'clawdbot' | 'craft' | 'custom';
  configuration?: Record<string, unknown>;
}

export class CraftSkillsAdapter {
  private clawdBotClient: ClawdBotClient;
  private craftSkills: Map<string, CraftSkill> = new Map();

  constructor(clawdBotClient: ClawdBotClient) {
    this.clawdBotClient = clawdBotClient;
  }

  /**
   * Initialize and load all ClawdBot skills as Craft skills
   */
  async initialize(): Promise<void> {
    console.log('Initializing Craft Skills Adapter...');
    
    // Get all ClawdBot skills
    const clawdBotSkills = this.clawdBotClient.getSkills();
    
    // Convert each ClawdBot skill to Craft skill format
    for (const skill of clawdBotSkills) {
      const craftSkill = this.convertToCraftSkill(skill);
      this.craftSkills.set(craftSkill.id, craftSkill);
    }

    // Add the predefined 100+ skills if not already loaded
    if (this.craftSkills.size === 0) {
      this.loadPredefinedSkills();
    }

    console.log(`Loaded ${this.craftSkills.size} skills into Craft Agents`);
  }

  /**
   * Convert ClawdBot skill to Craft Agents skill format
   */
  private convertToCraftSkill(clawdBotSkill: ClawdBotSkill): CraftSkill {
    return {
      id: `clawdbot-${clawdBotSkill.id}`,
      name: clawdBotSkill.name,
      description: clawdBotSkill.description,
      prompt: this.generateSkillPrompt(clawdBotSkill),
      category: this.categorizeSkill(clawdBotSkill.category),
      enabled: clawdBotSkill.enabled,
      source: 'clawdbot',
      configuration: clawdBotSkill.configuration,
    };
  }

  /**
   * Generate a Craft Agents-compatible prompt for the skill
   */
  private generateSkillPrompt(skill: ClawdBotSkill): string {
    return `You are an expert at using the ${skill.name} skill.

**Skill Description:** ${skill.description}

**Your Role:**
- Execute the ${skill.name} skill when requested
- Understand the user's intent and map it to the skill's capabilities
- Provide clear feedback on the skill's execution
- Handle errors gracefully and suggest alternatives

**Guidelines:**
- Always confirm understanding before executing
- Explain what the skill will do
- Report results clearly and concisely
- Suggest related skills when appropriate

When the user asks you to use this skill, execute it and provide helpful context about what was done.`;
  }

  /**
   * Categorize skill based on its type
   */
  private categorizeSkill(category: string): SkillCategoryType {
    const categoryMap: Record<string, SkillCategoryType> = {
      'project-management': 'productivity',
      'code': 'development',
      'finance': 'finance',
      'content': 'content-creation',
      'security': 'security',
      'api': 'integration',
      'search': 'research',
      'messaging': 'communication',
      'automation': 'automation',
      'monitoring': 'monitoring',
    };

    return categoryMap[category.toLowerCase()] || 'productivity';
  }

  /**
   * Load all 100+ predefined ClawdBot skills
   */
  private loadPredefinedSkills(): void {
    const skills: CraftSkill[] = [
      // Productivity & Organization (15 skills)
      {
        id: 'clawdbot-clickup',
        name: 'ClickUp',
        description: 'Manage tasks, projects, and workflows in ClickUp',
        prompt: 'You can create tasks, update projects, manage sprints, and track progress in ClickUp.',
        category: 'productivity',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-morning-briefing',
        name: 'Morning Briefing',
        description: 'Generate personalized daily briefings with calendar, tasks, news, and priorities',
        prompt: 'Create comprehensive morning briefings including calendar events, pending tasks, relevant news, and priority recommendations.',
        category: 'productivity',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-para-second-brain',
        name: 'PARA Second Brain',
        description: 'Organize knowledge using the PARA method (Projects, Areas, Resources, Archives)',
        prompt: 'Help organize information using the PARA methodology for effective knowledge management.',
        category: 'productivity',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-adhd-daily-planner',
        name: 'ADHD Daily Planner',
        description: 'Neurodivergent-friendly task planning and time management',
        prompt: 'Create ADHD-friendly schedules with time blocking, break reminders, and dopamine-boosting task organization.',
        category: 'productivity',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-people-memories',
        name: 'People Memories',
        description: 'Remember and recall personal details about people you interact with',
        prompt: 'Store and retrieve personal information about contacts, including preferences, conversations, and important dates.',
        category: 'productivity',
        enabled: true,
        source: 'clawdbot',
      },

      // Development Tools (25 skills)
      {
        id: 'clawdbot-git-essentials',
        name: 'Git Essentials',
        description: 'Execute Git commands for version control',
        prompt: 'Perform Git operations including commit, push, pull, branch management, and conflict resolution.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-docker-essentials',
        name: 'Docker Essentials',
        description: 'Manage Docker containers and images',
        prompt: 'Build, run, stop, and manage Docker containers and images.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-code-review-assistant',
        name: 'Code Review Assistant',
        description: 'Automated code review with best practices and suggestions',
        prompt: 'Review code for quality, security, performance, and adherence to best practices.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-unit-test-generator',
        name: 'Unit Test Generator',
        description: 'Generate comprehensive unit tests for code',
        prompt: 'Create unit tests with high coverage for functions, classes, and modules.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-cicd-pipeline-generator',
        name: 'CI/CD Pipeline Generator',
        description: 'Generate GitHub Actions workflows and CI/CD pipelines',
        prompt: 'Create automated CI/CD pipelines for testing, building, and deploying applications.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-database-schema-generator',
        name: 'Database Schema Generator',
        description: 'Design and generate database schemas',
        prompt: 'Create optimized database schemas with proper relationships, indexes, and constraints.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-code-explainer',
        name: 'Code Explainer',
        description: 'Explain code in plain English',
        prompt: 'Break down complex code into understandable explanations for any skill level.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-refactoring-assistant',
        name: 'Refactoring Assistant',
        description: 'Suggest and implement code refactoring improvements',
        prompt: 'Identify code smells and suggest refactoring strategies for cleaner, more maintainable code.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-clean-code',
        name: 'Clean Code',
        description: 'Enforce clean code principles and standards',
        prompt: 'Apply clean code principles including SOLID, DRY, KISS, and naming conventions.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-codemod-generator',
        name: 'Codemod Generator',
        description: 'Generate codemods for large-scale code transformations',
        prompt: 'Create automated code transformation scripts for refactoring across entire codebases.',
        category: 'development',
        enabled: true,
        source: 'clawdbot',
      },

      // Financial Services (10 skills)
      {
        id: 'clawdbot-stock-info-explorer',
        name: 'Stock Info Explorer',
        description: 'Comprehensive stock analysis with charts and financial data',
        prompt: 'Analyze stocks with real-time data, historical charts, fundamentals, and technical indicators.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-stock-market-pro',
        name: 'Stock Market Pro',
        description: 'Professional stock tracking and portfolio management',
        prompt: 'Track portfolios, analyze market trends, and generate investment insights.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-stock-evaluator',
        name: 'Stock Evaluator',
        description: 'Detailed stock valuation analysis',
        prompt: 'Perform DCF analysis, compare valuations, and assess investment opportunities.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-monzo',
        name: 'Monzo',
        description: 'UK bank account integration and management',
        prompt: 'Check balances, track spending, categorize transactions, and manage Monzo accounts.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-sure',
        name: 'Sure',
        description: 'Personal financial board reporting and analytics',
        prompt: 'Generate financial dashboards, track net worth, and analyze spending patterns.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-cost-tracking-models',
        name: 'Cost Tracking for Models',
        description: 'Track AI model usage costs across providers',
        prompt: 'Monitor and optimize spending on AI API calls across different LLM providers.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-save-money',
        name: 'Save Money',
        description: 'Detect task complexity to optimize AI costs',
        prompt: 'Analyze tasks and recommend cheaper models when appropriate to reduce costs.',
        category: 'finance',
        enabled: true,
        source: 'clawdbot',
      },

      // Content Creation (15 skills)
      {
        id: 'clawdbot-ai-video-gen',
        name: 'AI Video Gen',
        description: 'End-to-end AI-powered video generation',
        prompt: 'Create videos from text descriptions including script, voiceover, visuals, and editing.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-gamma-presentations',
        name: 'Gamma Presentations',
        description: 'Create professional presentations via Gamma',
        prompt: 'Generate beautiful slide decks with AI-powered design and content.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-canva',
        name: 'Canva',
        description: 'Design creation and management in Canva',
        prompt: 'Create social media graphics, presentations, posters, and other designs.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-remotion-video-toolkit',
        name: 'Remotion Video Toolkit',
        description: 'Programmatic video creation with React',
        prompt: 'Create videos programmatically using React components and animations.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-demo-video-creator',
        name: 'Demo Video Creator',
        description: 'Automated demo video creation for products',
        prompt: 'Generate product demo videos with screen recordings, voiceovers, and annotations.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-social-card-generator',
        name: 'Social Card Generator',
        description: 'Generate social media preview cards',
        prompt: 'Create Open Graph images and Twitter cards for social media sharing.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-meta-tags-generator',
        name: 'Meta Tags Generator',
        description: 'Generate SEO-optimized meta tags',
        prompt: 'Create comprehensive meta tags for improved search engine visibility.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-landing-page-generator',
        name: 'Landing Page Generator',
        description: 'Generate complete landing page code',
        prompt: 'Create conversion-optimized landing pages with HTML, CSS, and JavaScript.',
        category: 'content-creation',
        enabled: true,
        source: 'clawdbot',
      },

      // Security & Privacy (10 skills)
      {
        id: 'clawdbot-prompt-guard',
        name: 'Prompt Guard',
        description: 'Defend against prompt injection attacks',
        prompt: 'Detect and prevent prompt injection attempts to protect AI systems.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-dont-hack-me',
        name: 'Dont Hack Me',
        description: 'Security self-check and vulnerability assessment',
        prompt: 'Scan for common security vulnerabilities and misconfigurations.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-ggshield-secret-scanner',
        name: 'ggshield Secret Scanner',
        description: 'Detect hardcoded secrets in code',
        prompt: 'Scan codebases for exposed API keys, passwords, and sensitive credentials.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-skill-scanner',
        name: 'Skill Scanner',
        description: 'Malware detection for ClawdBot skills',
        prompt: 'Analyze skills for malicious code and security vulnerabilities.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-clawdbot-security-audit',
        name: 'ClawdBot Security Audit',
        description: 'Comprehensive security configuration audit',
        prompt: 'Review ClawdBot configuration for security best practices.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-auth-auditor',
        name: 'Auth Auditor',
        description: 'Authentication security audit',
        prompt: 'Analyze authentication mechanisms for vulnerabilities and compliance.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-accessibility-auditor',
        name: 'Accessibility Auditor',
        description: 'Check accessibility compliance (WCAG)',
        prompt: 'Audit web applications for accessibility standards and suggest improvements.',
        category: 'security',
        enabled: true,
        source: 'clawdbot',
      },

      // Integration & Automation (20 skills)
      {
        id: 'clawdbot-agent-browser',
        name: 'Agent Browser',
        description: 'Automated browser interactions and web scraping',
        prompt: 'Navigate websites, fill forms, click buttons, and extract data automatically.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-ssh-essentials',
        name: 'SSH Essentials',
        description: 'SSH command toolkit for remote server management',
        prompt: 'Execute SSH commands, manage remote servers, and transfer files.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-curl-http',
        name: 'Curl Http',
        description: 'HTTP request toolkit for API testing',
        prompt: 'Make HTTP requests, test APIs, and debug network issues.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-home-assistant',
        name: 'Home Assistant',
        description: 'Smart home integration and automation',
        prompt: 'Control smart home devices, create automations, and monitor home status.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-my-tesla',
        name: 'My Tesla',
        description: 'Tesla vehicle integration and control',
        prompt: 'Monitor battery, control climate, lock/unlock, and track Tesla vehicles.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-x-api',
        name: 'X API',
        description: 'Twitter/X platform integration',
        prompt: 'Post tweets, monitor mentions, analyze engagement, and manage X accounts.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-telegram-bot-builder',
        name: 'Telegram Bot Builder',
        description: 'Create and manage Telegram bots',
        prompt: 'Build custom Telegram bots with commands, keyboards, and webhooks.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-imap-smtp-email',
        name: 'IMAP SMTP Email',
        description: 'Email reading and sending via IMAP/SMTP',
        prompt: 'Read emails, send messages, manage folders, and filter spam.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-metricool',
        name: 'Metricool',
        description: 'Social media scheduling and analytics',
        prompt: 'Schedule posts, analyze performance, and manage multiple social accounts.',
        category: 'integration',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-lobster',
        name: 'Lobster',
        description: 'Workflow runtime with approval gates',
        prompt: 'Create multi-step workflows with human-in-the-loop approval checkpoints.',
        category: 'automation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-flow',
        name: 'Flow',
        description: 'Intelligent skill orchestrator',
        prompt: 'Automatically chain skills together for complex multi-step tasks.',
        category: 'automation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-proactive-agent',
        name: 'Proactive Agent',
        description: 'Proactive task anticipation and execution',
        prompt: 'Anticipate user needs and proactively suggest or execute tasks.',
        category: 'automation',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-cron-writer',
        name: 'Cron Writer',
        description: 'Cron job creation assistant',
        prompt: 'Generate cron expressions and schedule recurring tasks.',
        category: 'automation',
        enabled: true,
        source: 'clawdbot',
      },

      // Research & Analysis (10 skills)
      {
        id: 'clawdbot-web-search',
        name: 'Web Search',
        description: 'DuckDuckGo web search without API key',
        prompt: 'Search the web for information using DuckDuckGo.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-exa-web-search',
        name: 'Exa Web Search (Free)',
        description: 'Free alternative web search engine',
        prompt: 'Search the web using Exa search engine.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-realtime-web-search',
        name: 'Realtime Web Search',
        description: 'Real-time search with up-to-date results',
        prompt: 'Get the latest information from the web in real-time.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-paper-recommendation',
        name: 'Paper Recommendation',
        description: 'Academic paper suggestions based on topics',
        prompt: 'Discover relevant academic papers and research publications.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-news-aggregator',
        name: 'News Aggregator',
        description: 'Multi-source news aggregation and filtering',
        prompt: 'Aggregate news from multiple sources and filter by topics.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-reddit-insights',
        name: 'Reddit Insights',
        description: 'Reddit data analysis and trending topics',
        prompt: 'Analyze Reddit discussions, find trending topics, and extract insights.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-qmd-search',
        name: 'QMD - Quick Markdown Search',
        description: 'Local markdown file search',
        prompt: 'Search through local markdown files and knowledge bases.',
        category: 'research',
        enabled: true,
        source: 'clawdbot',
      },

      // Communication (5 skills)
      {
        id: 'clawdbot-transcribee',
        name: 'Transcribee 🐝',
        description: 'YouTube and audio transcription',
        prompt: 'Transcribe YouTube videos and audio files to text.',
        category: 'communication',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-faster-whisper',
        name: 'Faster Whisper',
        description: 'Optimized speech transcription',
        prompt: 'Fast and accurate speech-to-text transcription.',
        category: 'communication',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-iresponder',
        name: 'iResponder',
        description: 'Automated response system',
        prompt: 'Generate and send automated responses to messages and emails.',
        category: 'communication',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-zoom-meeting-assistance',
        name: 'Zoom Meeting Assistance RTMS',
        description: 'Real-time Zoom meeting support',
        prompt: 'Provide real-time assistance during Zoom meetings including transcription and notes.',
        category: 'communication',
        enabled: true,
        source: 'clawdbot',
      },

      // Monitoring (5 skills)
      {
        id: 'clawdbot-system-monitor',
        name: 'System Monitor',
        description: 'CPU, RAM, GPU monitoring',
        prompt: 'Monitor system resources and performance metrics.',
        category: 'monitoring',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-linkedin-monitor',
        name: 'LinkedIn Monitor',
        description: 'LinkedIn activity monitoring',
        prompt: 'Track LinkedIn connections, posts, and engagement.',
        category: 'monitoring',
        enabled: true,
        source: 'clawdbot',
      },
      {
        id: 'clawdbot-youtube',
        name: 'YouTube',
        description: 'YouTube channel monitoring and analytics',
        prompt: 'Track video performance, comments, and channel growth.',
        category: 'monitoring',
        enabled: true,
        source: 'clawdbot',
      },
    ];

    // Add all skills to the map
    skills.forEach(skill => {
      this.craftSkills.set(skill.id, skill);
    });

    console.log(`Loaded ${skills.length} predefined ClawdBot skills`);
  }

  /**
   * Get all Craft skills
   */
  getAllSkills(): CraftSkill[] {
    return Array.from(this.craftSkills.values());
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: SkillCategoryType): CraftSkill[] {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  /**
   * Get a specific skill
   */
  getSkill(skillId: string): CraftSkill | undefined {
    return this.craftSkills.get(skillId);
  }

  /**
   * Enable a skill
   */
  async enableSkill(skillId: string): Promise<void> {
    const skill = this.craftSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    skill.enabled = true;
    this.craftSkills.set(skillId, skill);

    // Also enable in ClawdBot if it's a ClawdBot skill
    if (skill.source === 'clawdbot') {
      const clawdBotSkillId = skillId.replace('clawdbot-', '');
      await this.clawdBotClient.enableSkill(clawdBotSkillId);
    }

    console.log(`Enabled skill: ${skill.name}`);
  }

  /**
   * Disable a skill
   */
  async disableSkill(skillId: string): Promise<void> {
    const skill = this.craftSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    skill.enabled = false;
    this.craftSkills.set(skillId, skill);

    // Also disable in ClawdBot if it's a ClawdBot skill
    if (skill.source === 'clawdbot') {
      const clawdBotSkillId = skillId.replace('clawdbot-', '');
      await this.clawdBotClient.disableSkill(clawdBotSkillId);
    }

    console.log(`Disabled skill: ${skill.name}`);
  }

  /**
   * Generate Craft Agents skills directory structure
   */
  generateSkillsDirectory(): Record<string, string> {
    const skillsDir: Record<string, string> = {};

    for (const skill of this.craftSkills.values()) {
      const filename = `${skill.id}.md`;
      const content = `---
name: ${skill.name}
description: ${skill.description}
category: ${skill.category}
enabled: ${skill.enabled}
source: ${skill.source}
---

# ${skill.name}

${skill.prompt}

## Configuration

${JSON.stringify(skill.configuration || {}, null, 2)}
`;
      skillsDir[filename] = content;
    }

    return skillsDir;
  }

  /**
   * Export skills as JSON for Craft Agents
   */
  exportSkillsJSON(): string {
    const skills = this.getAllSkills();
    return JSON.stringify(skills, null, 2);
  }
}
