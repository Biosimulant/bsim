# Epic 10: Web Platform

Status: Draft
Last updated: 2026-01-13

## Goal

Build a web platform that lets users browse, run, combine, and share biological models from any major standard through a unified interface.

## Strategic Context

See `STRATEGY.md` for full business context.

**Vision:** "Hugging Face for biological simulations" - the place where all biology models live, run, and connect.

## Platform Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         bsim.io                                │
├──────────────────────┬─────────────────────────────────────────┤
│   Web Frontend       │   • React (extend SimUI)                │
│                      │   • Model browser                       │
│                      │   • Visual wiring editor                │
│                      │   • Results visualization               │
├──────────────────────┼─────────────────────────────────────────┤
│   API Layer          │   • FastAPI                             │
│                      │   • Model CRUD                          │
│                      │   • Simulation jobs                     │
│                      │   • User auth (JWT)                     │
├──────────────────────┼─────────────────────────────────────────┤
│   Execution Workers  │   • Containerized (Docker)              │
│                      │   • Pre-built images per adapter        │
│                      │   • Job queue (Redis + Celery/ARQ)      │
│                      │   • Resource limits                     │
├──────────────────────┼─────────────────────────────────────────┤
│   Model Index        │   • PostgreSQL for metadata             │
│                      │   • S3/MinIO for model files            │
│                      │   • Elasticsearch for search            │
│                      │   • Sync jobs from BioModels etc        │
├──────────────────────┼─────────────────────────────────────────┤
│   bsim Core          │   • Adapters (SBML, NeuroML, custom)    │
│   (existing)         │   • Wiring, solvers, lifecycle          │
│                      │   • SimUI components                    │
└──────────────────────┴─────────────────────────────────────────┘
```

## Core Features

### F1: Model Browser

**User story:** As a researcher, I want to search and browse biological models from BioModels, ModelDB, and NeuroML-DB in one place.

**Requirements:**
- [ ] Search by title, description, tags, species
- [ ] Filter by standard (SBML, NeuroML, CellML)
- [ ] Filter by domain (metabolism, neuroscience, cardiac)
- [ ] Preview model metadata before running
- [ ] Link to original source

**Technical:**
- PostgreSQL for metadata storage
- Elasticsearch for full-text search
- Daily sync jobs from upstream databases

### F2: One-Click Run

**User story:** As a student, I want to click "Run" on any model and see results without installing anything.

**Requirements:**
- [ ] Run button on every model page
- [ ] Default parameters pre-filled
- [ ] Progress indicator during execution
- [ ] Results displayed inline (charts, tables)
- [ ] Execution time limit (free tier: 60s, pro: 300s)

**Technical:**
- Job queue for async execution
- Containerized workers per adapter type
- SSE for progress updates
- Result caching for repeated runs

### F3: Parameter Tweaking

**User story:** As a researcher, I want to modify model parameters and re-run to explore behavior.

**Requirements:**
- [ ] Parameter editor UI
- [ ] Slider/input for numeric parameters
- [ ] Parameter bounds from model metadata
- [ ] Save parameter sets
- [ ] Compare runs with different parameters

**Technical:**
- Parameter extraction from SBML/NeuroML
- Run history storage
- Diff visualization

### F4: Model Composition (Differentiator)

**User story:** As a systems biologist, I want to wire together models from different standards (e.g., metabolism + neurons).

**Requirements:**
- [ ] Visual wiring editor (node-based)
- [ ] Drag models onto canvas
- [ ] Connect outputs to inputs
- [ ] Transform functions (unit conversion)
- [ ] Validate connections before running
- [ ] Save compositions as new "meta-models"

**Technical:**
- TimeBroker for multi-adapter sync
- Transform function library
- Composition serialization (YAML)
- Composition as first-class entity in DB

### F5: User Accounts & Projects

**User story:** As a returning user, I want to save my work and access it later.

**Requirements:**
- [ ] Sign up / login (email, OAuth)
- [ ] Create projects
- [ ] Save simulations to projects
- [ ] Private vs public projects
- [ ] Share project with link

**Technical:**
- JWT authentication
- PostgreSQL for user/project data
- S3 for artifacts (results, configs)
- Permission model (owner, viewer, editor)

### F6: Collaboration (Team Tier)

**User story:** As a lab PI, I want my team to collaborate on simulation projects.

**Requirements:**
- [ ] Team workspaces
- [ ] Invite team members
- [ ] Role-based permissions
- [ ] Activity feed
- [ ] Comments on simulations

**Technical:**
- Team/membership model in DB
- Real-time updates (SSE or WebSocket)
- Audit log for compliance

## API Design

### Models API

```
GET  /api/models                    # List/search models
GET  /api/models/:id                # Get model details
GET  /api/models/:id/parameters     # Get model parameters
POST /api/models/:id/run            # Start simulation
GET  /api/models/:id/runs/:run_id   # Get run status/results
```

### Compositions API

```
GET  /api/compositions              # List user's compositions
POST /api/compositions              # Create composition
GET  /api/compositions/:id          # Get composition
PUT  /api/compositions/:id          # Update composition
POST /api/compositions/:id/run      # Run composition
```

### Projects API

```
GET  /api/projects                  # List user's projects
POST /api/projects                  # Create project
GET  /api/projects/:id              # Get project
PUT  /api/projects/:id              # Update project
DELETE /api/projects/:id            # Delete project
```

### Users API

```
POST /api/auth/register             # Register
POST /api/auth/login                # Login
GET  /api/users/me                  # Current user
PUT  /api/users/me                  # Update profile
```

## Database Schema (Core Tables)

```sql
-- Models (indexed from external sources + user uploads)
CREATE TABLE models (
    id UUID PRIMARY KEY,
    source VARCHAR(50),           -- 'biomodels', 'neuroml-db', 'user'
    source_id VARCHAR(255),       -- Original ID in source
    standard VARCHAR(50),         -- 'sbml', 'neuroml', 'cellml'
    title TEXT,
    description TEXT,
    tags TEXT[],
    species TEXT[],
    file_path TEXT,               -- S3 path
    metadata JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Runs (simulation executions)
CREATE TABLE runs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    model_id UUID REFERENCES models(id),
    composition_id UUID,          -- If running a composition
    status VARCHAR(50),           -- 'pending', 'running', 'completed', 'failed'
    parameters JSONB,
    results_path TEXT,            -- S3 path
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Compositions (wired models)
CREATE TABLE compositions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    title TEXT,
    description TEXT,
    wiring JSONB,                 -- Module definitions + connections
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Execution Infrastructure

### Worker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Job Queue (Redis)                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ SBML Worker   │    │NeuroML Worker │    │ Custom Worker │
│ (tellurium)   │    │ (pyNeuroML)   │    │ (bsim native) │
│               │    │               │    │               │
│ Docker image  │    │ Docker image  │    │ Docker image  │
│ with deps     │    │ with deps     │    │ with deps     │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Resource Limits

| Tier | Max runtime | Max memory | Concurrent runs |
|------|-------------|------------|-----------------|
| Free | 60s | 512MB | 1 |
| Pro | 300s | 2GB | 5 |
| Team | 600s | 4GB | 10 |
| Enterprise | Custom | Custom | Custom |

### Sandboxing

- Docker containers with:
  - No network access (except result upload)
  - Read-only filesystem (except /tmp)
  - Resource limits (CPU, memory, time)
  - No privileged operations
- Model files validated before execution
- No arbitrary code execution (adapters only)

## Model Index Sync

### BioModels Sync

```python
async def sync_biomodels():
    """Daily job to sync BioModels database."""
    # Fetch model list from BioModels REST API
    models = await fetch_biomodels_list()

    for model in models:
        # Check if we have this version
        existing = await db.get_model_by_source_id("biomodels", model["id"])

        if not existing or existing.version < model["version"]:
            # Download SBML file
            sbml_content = await download_biomodel(model["id"])

            # Upload to S3
            s3_path = await upload_to_s3(sbml_content, f"biomodels/{model['id']}.xml")

            # Extract metadata
            metadata = extract_sbml_metadata(sbml_content)

            # Upsert in database
            await db.upsert_model(
                source="biomodels",
                source_id=model["id"],
                standard="sbml",
                title=model["name"],
                description=model.get("description"),
                tags=model.get("tags", []),
                species=metadata.get("species", []),
                file_path=s3_path,
                metadata=metadata
            )
```

### Sync Schedule

| Source | Frequency | Est. models |
|--------|-----------|-------------|
| BioModels | Daily | 1000+ |
| NeuroML-DB | Daily | 200+ |
| CellML Repository | Weekly | 600+ |

## Acceptance Criteria

### MVP (Month 3)
- [ ] Model browser with BioModels search
- [ ] One-click run for SBML models
- [ ] Results visualization (timeseries)
- [ ] User accounts (basic)
- [ ] Deployed to production

### V1 (Month 6)
- [ ] Parameter tweaking UI
- [ ] Save/load projects
- [ ] Run history
- [ ] NeuroML support

### V2 (Month 9)
- [ ] Visual composition editor
- [ ] Cross-standard wiring
- [ ] Freemium pricing live
- [ ] Team features

## Security Considerations

- **Authentication:** JWT with refresh tokens, secure cookie storage
- **Authorization:** Row-level security for user data
- **Execution:** Sandboxed containers, no user code execution
- **Data:** Encryption at rest (S3), TLS in transit
- **Compliance:** GDPR-ready (data export, deletion)

## Infrastructure

### Initial Setup (MVP)
- **Compute:** Single server or small Kubernetes cluster
- **Database:** PostgreSQL (managed, e.g., Supabase, RDS)
- **Storage:** S3-compatible (AWS S3, MinIO, Cloudflare R2)
- **Search:** Elasticsearch or PostgreSQL full-text (start simple)
- **Queue:** Redis
- **CDN:** Cloudflare for static assets

### Scale Setup (V2+)
- **Compute:** Kubernetes with auto-scaling workers
- **Database:** PostgreSQL with read replicas
- **Storage:** S3 with CloudFront CDN
- **Search:** Elasticsearch cluster
- **Queue:** Redis cluster or SQS
- **Monitoring:** Prometheus + Grafana, Sentry for errors

## Implementation Phases

### Phase 1: Foundation (Months 1-3)
1. Set up infrastructure (DB, S3, queue)
2. Build BioModels sync job
3. Build model browser API + UI
4. Build execution worker (tellurium)
5. Build results display
6. Deploy MVP

### Phase 2: User Features (Months 4-6)
1. User authentication
2. Projects and run history
3. Parameter editing
4. NeuroML adapter + sync
5. Basic analytics

### Phase 3: Composition (Months 7-9)
1. Visual wiring editor
2. TimeBroker integration
3. Composition storage
4. Freemium pricing
5. Team features (basic)

## Dependencies

- **Backend:** FastAPI, SQLAlchemy, Celery/ARQ, boto3
- **Frontend:** React, TypeScript, Plotly, React Flow (wiring editor)
- **Infrastructure:** Docker, PostgreSQL, Redis, S3
- **Adapters:** tellurium, pyneuroml (as bsim adapters)

## Document History

- 2026-01-13: Expanded with full platform architecture
- 2026-01-12: Initial boundary spec
