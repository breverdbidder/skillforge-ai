/**
 * GitHub Automation System
 * Autonomously commits and pushes updates to GitHub repositories
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

const execAsync = promisify(exec);

export interface GitHubConfig {
  repositories: {
    skills: string;           // e.g., 'breverdbidder/clawdbot-skills'
    integration: string;      // e.g., 'breverdbidder/clawdbot-integration'
    kimiKilo: string;        // e.g., 'breverdbidder/kimi-kilo-craft-integration'
  };
  autoCommit: boolean;
  autoPush: boolean;
  commitMessage?: string;
  branch: string;
}

export interface CommitResult {
  repository: string;
  success: boolean;
  commitHash?: string;
  filesChanged: number;
  timestamp: Date;
  error?: string;
}

export class GitHubAutomation {
  private config: GitHubConfig;
  private commitHistory: CommitResult[] = [];

  constructor(config: GitHubConfig) {
    this.config = {
      autoCommit: config.autoCommit !== undefined ? config.autoCommit : true,
      autoPush: config.autoPush !== undefined ? config.autoPush : true,
      branch: config.branch || 'main',
      ...config,
    };
  }

  /**
   * Initialize GitHub automation
   */
  async initialize(): Promise<void> {
    console.log('Initializing GitHub Automation System...');

    // Verify git is available
    try {
      await execAsync('git --version');
      console.log('✓ Git is available');
    } catch (error) {
      throw new Error('Git is not installed or not in PATH');
    }

    // Verify GitHub CLI is available
    try {
      await execAsync('gh --version');
      console.log('✓ GitHub CLI is available');
    } catch (error) {
      throw new Error('GitHub CLI is not installed or not authenticated');
    }

    // Verify authentication
    try {
      await execAsync('gh auth status');
      console.log('✓ GitHub CLI is authenticated');
    } catch (error) {
      throw new Error('GitHub CLI is not authenticated. Run: gh auth login');
    }

    console.log('GitHub Automation System initialized successfully');
  }

  /**
   * Commit and push skills updates
   */
  async commitSkillsUpdate(
    skillsDirectory: string,
    syncResult: any
  ): Promise<CommitResult> {
    const repoPath = resolve(skillsDirectory, '..');
    const repoName = this.config.repositories.skills;

    console.log(`\n📝 Committing skills update to ${repoName}...`);

    const result: CommitResult = {
      repository: repoName,
      success: false,
      filesChanged: 0,
      timestamp: new Date(),
    };

    try {
      // Navigate to repository
      process.chdir(repoPath);

      // Check if it's a git repository
      try {
        await execAsync('git rev-parse --git-dir');
      } catch {
        // Initialize git repository
        console.log('Initializing git repository...');
        await execAsync('git init');
        await execAsync(`git branch -M ${this.config.branch}`);
        
        // Check if remote exists
        try {
          await execAsync('git remote get-url origin');
        } catch {
          // Add remote
          await execAsync(`gh repo create ${repoName} --private --source=. --remote=origin`);
        }
      }

      // Stage all changes
      await execAsync('git add .');

      // Check if there are changes to commit
      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      
      if (!statusOutput.trim()) {
        console.log('No changes to commit');
        result.success = true;
        return result;
      }

      // Count changed files
      const changedFiles = statusOutput.trim().split('\n').length;
      result.filesChanged = changedFiles;

      // Generate commit message
      const commitMessage = this.generateCommitMessage(syncResult);

      // Commit changes
      if (this.config.autoCommit) {
        await execAsync(`git commit -m "${commitMessage}"`);
        
        // Get commit hash
        const { stdout: commitHash } = await execAsync('git rev-parse --short HEAD');
        result.commitHash = commitHash.trim();
        
        console.log(`✓ Committed ${changedFiles} files (${result.commitHash})`);
      }

      // Push to GitHub
      if (this.config.autoPush) {
        await execAsync(`git push origin ${this.config.branch}`);
        console.log(`✓ Pushed to GitHub: ${repoName}`);
      }

      result.success = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to commit/push: ${result.error}`);
    }

    this.commitHistory.push(result);
    return result;
  }

  /**
   * Commit and push integration updates
   */
  async commitIntegrationUpdate(
    integrationDirectory: string,
    message?: string
  ): Promise<CommitResult> {
    const repoPath = integrationDirectory;
    const repoName = this.config.repositories.integration;

    console.log(`\n📝 Committing integration update to ${repoName}...`);

    const result: CommitResult = {
      repository: repoName,
      success: false,
      filesChanged: 0,
      timestamp: new Date(),
    };

    try {
      process.chdir(repoPath);

      // Stage all changes
      await execAsync('git add .');

      // Check for changes
      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      
      if (!statusOutput.trim()) {
        console.log('No changes to commit');
        result.success = true;
        return result;
      }

      result.filesChanged = statusOutput.trim().split('\n').length;

      // Commit
      if (this.config.autoCommit) {
        const commitMsg = message || 'chore: update integration codebase';
        await execAsync(`git commit -m "${commitMsg}"`);
        
        const { stdout: commitHash } = await execAsync('git rev-parse --short HEAD');
        result.commitHash = commitHash.trim();
        
        console.log(`✓ Committed ${result.filesChanged} files (${result.commitHash})`);
      }

      // Push
      if (this.config.autoPush) {
        await execAsync(`git push origin ${this.config.branch}`);
        console.log(`✓ Pushed to GitHub: ${repoName}`);
      }

      result.success = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to commit/push: ${result.error}`);
    }

    this.commitHistory.push(result);
    return result;
  }

  /**
   * Commit and push Kimi-Kilo integration updates
   */
  async commitKimiKiloUpdate(
    kimiKiloDirectory: string,
    message?: string
  ): Promise<CommitResult> {
    const repoPath = kimiKiloDirectory;
    const repoName = this.config.repositories.kimiKilo;

    console.log(`\n📝 Committing Kimi-Kilo update to ${repoName}...`);

    const result: CommitResult = {
      repository: repoName,
      success: false,
      filesChanged: 0,
      timestamp: new Date(),
    };

    try {
      process.chdir(repoPath);

      await execAsync('git add .');

      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      
      if (!statusOutput.trim()) {
        console.log('No changes to commit');
        result.success = true;
        return result;
      }

      result.filesChanged = statusOutput.trim().split('\n').length;

      if (this.config.autoCommit) {
        const commitMsg = message || 'chore: update Kimi-Kilo integration';
        await execAsync(`git commit -m "${commitMsg}"`);
        
        const { stdout: commitHash } = await execAsync('git rev-parse --short HEAD');
        result.commitHash = commitHash.trim();
        
        console.log(`✓ Committed ${result.filesChanged} files (${result.commitHash})`);
      }

      if (this.config.autoPush) {
        await execAsync(`git push origin ${this.config.branch}`);
        console.log(`✓ Pushed to GitHub: ${repoName}`);
      }

      result.success = true;

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to commit/push: ${result.error}`);
    }

    this.commitHistory.push(result);
    return result;
  }

  /**
   * Commit all repositories at once
   */
  async commitAllRepositories(
    directories: {
      skills: string;
      integration: string;
      kimiKilo: string;
    },
    syncResult?: any
  ): Promise<CommitResult[]> {
    console.log('\n🚀 Committing updates to all repositories...');

    const results: CommitResult[] = [];

    // Commit skills
    const skillsResult = await this.commitSkillsUpdate(directories.skills, syncResult);
    results.push(skillsResult);

    // Commit integration
    const integrationResult = await this.commitIntegrationUpdate(
      directories.integration,
      'chore: autonomous daily update'
    );
    results.push(integrationResult);

    // Commit Kimi-Kilo
    const kimiKiloResult = await this.commitKimiKiloUpdate(
      directories.kimiKilo,
      'chore: autonomous daily update'
    );
    results.push(kimiKiloResult);

    // Summary
    const successful = results.filter(r => r.success).length;
    const totalFiles = results.reduce((sum, r) => sum + r.filesChanged, 0);

    console.log(`\n✅ Completed: ${successful}/${results.length} repositories updated`);
    console.log(`📊 Total files changed: ${totalFiles}`);

    return results;
  }

  /**
   * Generate commit message from sync result
   */
  private generateCommitMessage(syncResult: any): string {
    if (this.config.commitMessage) {
      return this.config.commitMessage;
    }

    const date = new Date().toISOString().split('T')[0];
    
    if (!syncResult) {
      return `chore: autonomous skills update ${date}`;
    }

    const changes: string[] = [];
    
    if (syncResult.clawdBotSkillsAdded > 0) {
      changes.push(`+${syncResult.clawdBotSkillsAdded} ClawdBot skills`);
    }
    if (syncResult.clawdBotSkillsUpdated > 0) {
      changes.push(`~${syncResult.clawdBotSkillsUpdated} ClawdBot skills`);
    }
    if (syncResult.kiloToolsAdded > 0) {
      changes.push(`+${syncResult.kiloToolsAdded} Kilo tools`);
    }
    if (syncResult.kiloToolsUpdated > 0) {
      changes.push(`~${syncResult.kiloToolsUpdated} Kilo tools`);
    }

    if (changes.length === 0) {
      return `chore: daily sync check ${date}`;
    }

    return `feat: autonomous skills sync - ${changes.join(', ')} [${date}]`;
  }

  /**
   * Create a release tag
   */
  async createRelease(
    repository: string,
    version: string,
    notes: string
  ): Promise<void> {
    console.log(`\n🏷️  Creating release ${version} for ${repository}...`);

    try {
      // Get repository path
      let repoPath: string;
      if (repository === this.config.repositories.skills) {
        repoPath = 'skills';
      } else if (repository === this.config.repositories.integration) {
        repoPath = 'integration';
      } else {
        repoPath = 'kimi-kilo';
      }

      // Create tag
      await execAsync(`git tag -a ${version} -m "${notes}"`);
      await execAsync(`git push origin ${version}`);

      // Create GitHub release
      await execAsync(`gh release create ${version} --repo ${repository} --title "${version}" --notes "${notes}"`);

      console.log(`✓ Created release ${version}`);

    } catch (error) {
      console.error('Failed to create release:', error);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  getCommitHistory(): CommitResult[] {
    return [...this.commitHistory];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCommits: number;
    successfulCommits: number;
    failedCommits: number;
    totalFilesChanged: number;
    lastCommit?: CommitResult;
  } {
    return {
      totalCommits: this.commitHistory.length,
      successfulCommits: this.commitHistory.filter(c => c.success).length,
      failedCommits: this.commitHistory.filter(c => !c.success).length,
      totalFilesChanged: this.commitHistory.reduce((sum, c) => sum + c.filesChanged, 0),
      lastCommit: this.commitHistory[this.commitHistory.length - 1],
    };
  }

  /**
   * Save commit history to file
   */
  async saveCommitHistory(filepath: string): Promise<void> {
    await writeFile(filepath, JSON.stringify(this.commitHistory, null, 2));
  }

  /**
   * Load commit history from file
   */
  async loadCommitHistory(filepath: string): Promise<void> {
    try {
      const content = await readFile(filepath, 'utf-8');
      this.commitHistory = JSON.parse(content);
    } catch {
      // File doesn't exist, that's okay
      this.commitHistory = [];
    }
  }
}
