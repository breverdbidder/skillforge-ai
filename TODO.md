# SkillForge AI - Backend Services & CI Intelligence

## Architecture
- **Stack:** Node.js + TypeScript + Express + Supabase
- **Repo:** github.com/breverdbidder/skillforge-ai
- **Deploy:** Render.com (skillforge-ai-backend-db1s.onrender.com)
- **Frontend:** skillforge-ai-web (separate repo)

## Features to Implement

### Phase 1: Core Backend ✅
- [x] Express server setup
- [x] TypeScript configuration
- [x] Supabase integration
- [x] Health check endpoints
- [x] Render.com deployment

### Phase 2: ClawdBot Integration ✅
- [x] ClawdBot client implementation
- [x] Skills adapter layer
- [x] 100+ skills catalog access
- [x] Skill execution API

### Phase 3: CI Intelligence Module ✅
- [x] Competitor registry (14 competitors)
- [x] NVIDIA NIM client (Kimi K2.5)
- [x] Video analysis pipeline
- [x] Feature extraction
- [x] SimilarWeb integration (Apify)

### Phase 4: Database Schema ✅
- [x] ci_competitors table
- [x] ci_analyses table
- [x] ci_feature_matrix table
- [x] ci_video_sources table
- [x] ci_clone_blueprints table

### Phase 5: API Endpoints ✅
- [x] GET /health
- [x] GET /ci/health
- [x] GET /ci/competitors
- [x] GET /ci/analyses
- [x] GET /ci/video-sources
- [x] POST /ci/video-sources
- [x] GET /ci/blueprints
- [x] GET /ci/feature-matrix
- [x] POST /ci/pipeline/run

### Phase 6: Local CI Solution (skillforge-ai-web) ✅
- [x] Migration SQL pushed
- [x] routers-ci.ts created
- [x] Server index updated
- [x] 14 competitors seeded
- [x] 19 features seeded
- [ ] Redeploy to Render
- [ ] Test production endpoints

### Phase 7: Pipeline Orchestration
- [ ] Full CI pipeline workflow
- [ ] Video → Analysis → Blueprint
- [ ] Multi-competitor comparison
- [ ] Automated reporting
- [ ] Slack notifications

### Phase 8: Clone Blueprint Generation
- [ ] Feature gap analysis
- [ ] Implementation roadmap
- [ ] Effort estimation
- [ ] Priority scoring
- [ ] Export to DOCX

## API Documentation

### Health Endpoints
```
GET /health → {status: "healthy", timestamp}
GET /ci/health → {status: "healthy", tables: {...}}
```

### Competitor Endpoints
```
GET /api/ci/competitors → List all competitors
GET /api/ci/competitors/:id → Get competitor details
POST /api/ci/competitors → Add/update competitor
```

### Analysis Endpoints
```
GET /api/ci/analyses → List recent analyses
POST /api/ci/analyses → Store analysis result
GET /api/ci/feature-matrix → Feature comparison
GET /api/ci/summary → Dashboard stats
```

## Deployment
- **URL:** https://skillforge-ai-backend-db1s.onrender.com
- **Auto-deploy:** On GitHub push to main
- **Health check:** /health endpoint

## Key Files
- `src/index.ts` - Server entry point
- `src/ci-intelligence/` - CI module
- `src/clawdbot-client/` - ClawdBot integration
- `render.yaml` - Render deployment config
