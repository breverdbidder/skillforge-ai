#!/usr/bin/env node
/**
 * CI Report Generator
 * Generates markdown reports from CI analysis data
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface FeatureRow {
  name: string;
  competitors: Record<string, boolean>;
  bidDeedHas: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📊 Generating CI Report...\n');

  // Fetch latest feature matrix
  const { data: matrix, error: matrixError } = await supabase
    .from('ci_feature_matrices')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (matrixError || !matrix) {
    console.error('❌ No feature matrix found. Run analysis first.');
    process.exit(1);
  }

  // Fetch recent analyses
  const { data: analyses } = await supabase
    .from('ci_analyses')
    .select('*')
    .order('analyzed_at', { ascending: false })
    .limit(20);

  // Generate report
  const report = generateMarkdownReport(matrix, analyses || []);

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports', 'ci');
  fs.mkdirSync(reportsDir, { recursive: true });

  // Write report
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportsDir, `ci-report-${timestamp}.md`);
  fs.writeFileSync(reportPath, report);

  // Also write latest report
  const latestPath = path.join(reportsDir, 'LATEST.md');
  fs.writeFileSync(latestPath, report);

  // Write JSON data
  const jsonPath = path.join(reportsDir, `ci-data-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ matrix, analyses }, null, 2));

  console.log(`✅ Report generated: ${reportPath}`);
  console.log(`✅ Latest symlink: ${latestPath}`);
}

function generateMarkdownReport(matrix: any, analyses: any[]): string {
  const now = new Date().toISOString();
  const competitors = matrix.competitors || [];
  const features: FeatureRow[] = matrix.features || [];
  const gaps = matrix.biddeed_gaps || [];

  let report = `# 🔍 BidDeed.AI Competitive Intelligence Report

**Generated:** ${now}  
**Powered by:** NVIDIA NIM Kimi K2.5 (FREE Tier)  
**Competitors Analyzed:** ${competitors.length}  
**Total Features Tracked:** ${features.length}  

---

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| Competitors Tracked | ${competitors.length} |
| Total Features Found | ${features.length} |
| BidDeed.AI Has | ${features.filter(f => f.bidDeedHas).length} |
| **Feature Gaps** | **${gaps.length}** |
| Gap Rate | ${((gaps.length / features.length) * 100).toFixed(1)}% |

---

## 🔴 Critical Feature Gaps

These features exist in competitors but NOT in BidDeed.AI:

`;

  const criticalGaps = features
    .filter(f => !f.bidDeedHas && f.priority === 'critical')
    .slice(0, 10);

  if (criticalGaps.length > 0) {
    report += `| Feature | Found In | Priority |\n|---------|----------|----------|\n`;
    for (const gap of criticalGaps) {
      const foundIn = Object.entries(gap.competitors)
        .filter(([_, has]) => has)
        .map(([comp]) => comp)
        .join(', ');
      report += `| ${gap.name} | ${foundIn} | 🔴 Critical |\n`;
    }
  } else {
    report += `✅ No critical feature gaps found!\n`;
  }

  report += `\n---\n\n## 📈 Feature Parity Matrix\n\n`;

  // Build matrix table header
  report += `| Feature | BidDeed |`;
  for (const comp of competitors.slice(0, 5)) {
    report += ` ${comp} |`;
  }
  report += `\n|---------|---------|`;
  for (const _ of competitors.slice(0, 5)) {
    report += `---------|`;
  }
  report += `\n`;

  // Add feature rows (top 20)
  for (const feature of features.slice(0, 20)) {
    const bidDeed = feature.bidDeedHas ? '✅' : '❌';
    report += `| ${feature.name} | ${bidDeed} |`;
    
    for (const comp of competitors.slice(0, 5)) {
      const has = feature.competitors[comp] ? '✅' : '➖';
      report += ` ${has} |`;
    }
    report += `\n`;
  }

  if (features.length > 20) {
    report += `\n*... and ${features.length - 20} more features*\n`;
  }

  report += `\n---\n\n## 🎯 Implementation Priorities\n\n`;

  const priorityGroups = {
    critical: features.filter(f => !f.bidDeedHas && f.priority === 'critical'),
    high: features.filter(f => !f.bidDeedHas && f.priority === 'high'),
    medium: features.filter(f => !f.bidDeedHas && f.priority === 'medium'),
    low: features.filter(f => !f.bidDeedHas && f.priority === 'low')
  };

  report += `### 🔴 Critical (${priorityGroups.critical.length})\n`;
  for (const f of priorityGroups.critical.slice(0, 5)) {
    report += `- ${f.name}\n`;
  }

  report += `\n### 🟠 High (${priorityGroups.high.length})\n`;
  for (const f of priorityGroups.high.slice(0, 5)) {
    report += `- ${f.name}\n`;
  }

  report += `\n### 🟡 Medium (${priorityGroups.medium.length})\n`;
  for (const f of priorityGroups.medium.slice(0, 5)) {
    report += `- ${f.name}\n`;
  }

  report += `\n---\n\n## 📹 Recent Video Analyses\n\n`;

  for (const analysis of analyses.slice(0, 5)) {
    report += `### ${analysis.competitor_name}\n`;
    report += `- **URL:** ${analysis.video_url}\n`;
    report += `- **Analyzed:** ${analysis.analyzed_at}\n`;
    report += `- **Features Found:** ${(analysis.features || []).length}\n`;
    report += `- **UI Patterns:** ${(analysis.ui_patterns || []).length}\n\n`;
  }

  report += `---\n\n## 🤖 Analysis Methodology\n\n`;
  report += `This report was generated using:\n\n`;
  report += `- **Video Analysis:** NVIDIA NIM Kimi K2.5 multimodal model\n`;
  report += `- **Cost:** $0.00 (FREE tier - no rate limits announced)\n`;
  report += `- **Data Storage:** Supabase\n`;
  report += `- **Automation:** GitHub Actions (nightly at 11 PM EST)\n\n`;

  report += `---\n\n*Report generated by SkillForge AI CI Intelligence Module*\n`;

  return report;
}

main().catch(console.error);
