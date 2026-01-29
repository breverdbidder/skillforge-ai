# 🔍 SkillForge AI - Competitive Intelligence Module

**Video-powered competitor analysis using NVIDIA NIM Kimi K2.5 (FREE!)**

## 🎯 Overview

The CI Intelligence module enables automated competitive analysis by:

1. **Video Analysis** - Extract features, UI patterns, and pricing from competitor demo videos
2. **Feature Parity Matrix** - Track what competitors have vs BidDeed.AI
3. **Clone Blueprints** - Generate implementation plans for missing features
4. **Nightly Automation** - GitHub Actions runs analysis daily at 11 PM EST

## 💰 Cost: $0.00

NVIDIA NIM provides **FREE** access to Kimi K2.5 with no announced rate limits. This window may close, so we're exploiting it NOW.

| Provider | Input | Output | Video Support |
|----------|-------|--------|---------------|
| **NVIDIA NIM** | **FREE** | **FREE** | ✅ Yes |
| OpenRouter (fallback) | $0.60/M | $3.00/M | ✅ Yes |
| Moonshot Direct | $0.60/M | $2.50/M | ✅ Yes |

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
# Required
export NVIDIA_NIM_API_KEY="nvapi-xxx"  # Get from build.nvidia.com
export SUPABASE_URL="https://mocerqjnksmhcjzxrewo.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Optional
export COMPETITOR="propertyonion"  # Analyze specific competitor
```

### 2. Run Supabase Migration

```sql
-- Run in Supabase SQL Editor
-- See: supabase/migrations/001_ci_intelligence.sql
```

### 3. Run Analysis

```bash
# Analyze all competitors
npm run ci:analyze

# Analyze specific competitor
npm run ci:analyze -- --competitor=propertyonion

# Generate markdown report
npm run ci:report

# Full pipeline
npm run ci:full
```

## 📁 Module Structure

```
src/ci-intelligence/
├── index.ts                 # Module exports
├── nvidia-nim-client.ts     # Kimi K2.5 API client
├── orchestrator.ts          # Main CI orchestrator
├── competitor-registry.ts   # Competitor definitions
├── run-analysis.ts          # CLI runner
└── generate-report.ts       # Markdown report generator

.github/workflows/
└── nightly-ci-analysis.yml  # Nightly automation

supabase/migrations/
└── 001_ci_intelligence.sql  # Database schema
```

## 🎬 Adding Competitor Videos

### Option 1: Code Registry

Edit `src/ci-intelligence/competitor-registry.ts`:

```typescript
{
  id: 'new-competitor',
  name: 'New Competitor',
  domain: 'competitor.com',
  category: 'direct',
  videoSources: [
    {
      url: 'https://www.youtube.com/watch?v=XXXXX',
      type: 'demo',
      title: 'Product Demo',
      priority: 1,
      addedAt: new Date()
    }
  ]
}
```

### Option 2: Supabase Direct

```sql
INSERT INTO ci_video_sources 
  (competitor_id, video_url, video_type, title, priority)
VALUES 
  ('new-competitor', 'https://youtube.com/watch?v=XXX', 'demo', 'Demo Video', 1);
```

## 📊 Output Examples

### Feature Parity Matrix

| Feature | BidDeed | PropertyOnion | Auction.com |
|---------|---------|---------------|-------------|
| Lien Search | ✅ | ✅ | ❌ |
| ML Predictions | ✅ | ❌ | ❌ |
| Mobile App | ❌ | ✅ | ✅ |

### Clone Blueprint

```json
{
  "competitor": "PropertyOnion",
  "features": {
    "critical": ["Mobile App", "Push Notifications"],
    "high": ["Saved Searches", "Email Alerts"],
    "medium": ["Social Sharing"],
    "low": ["Dark Mode"]
  },
  "estimatedEffort": {
    "totalFeatures": 6,
    "estimatedWeeks": 4
  }
}
```

## 🔧 GitHub Actions Secrets Required

Add these to your repository secrets:

- `NVIDIA_NIM_API_KEY` - Get from build.nvidia.com
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not anon!)

## 📈 Supabase Tables

| Table | Purpose |
|-------|---------|
| `ci_analyses` | Raw video analysis results |
| `ci_feature_matrices` | Generated feature comparisons |
| `ci_video_sources` | Videos to analyze |
| `ci_clone_blueprints` | Implementation plans |
| `ci_analysis_jobs` | Job tracking |

## 🎯 Competitors Tracked

### Direct Competitors
- PropertyOnion - Foreclosure research platform
- Auction.com - Online auction marketplace
- Foreclosure.com - Listing aggregator
- RealtyTrac - Data and analytics

### Adjacent Competitors
- PropStream - Real estate data platform
- BatchLeads - Lead generation
- DealMachine - Driving for dollars

### Aspirational
- Zapier - Workflow automation reference
- Make - Visual automation reference
- Manus AI - Agentic AI reference

## 🔒 Security Notes

- Never commit API keys
- Use GitHub Secrets for CI/CD
- Supabase RLS enabled on all tables
- Service role required for writes

---

**Built for BidDeed.AI by SkillForge AI**  
*Exploit the FREE window while it lasts!* 🚀
