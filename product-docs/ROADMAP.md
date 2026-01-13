# Roadmap: bsim Platform

Status: Draft (living)
Last updated: 2026-01-13

This roadmap covers both the core library milestones and the platform execution plan. See `STRATEGY.md` for business context.

---

## Part 1: Core Library Milestones

These milestones focus on the `bsim` Python library and local development experience.

### Milestone M0: Repo Hygiene (Complete)

Epics:
- `epics/13-repo-hygiene.md`
- `epics/06-packaging-release.md` (partial)

Exit criteria:
- [x] Base `import bsim` works without optional deps
- [x] Python version targeting matches code syntax
- [x] Docs/CI are consistent
- [x] Standard dev artifacts ignored

### Milestone M1: Core Engine v0.1 (Complete)

Epics:
- `epics/02-core-runtime.md`
- `epics/03-wiring-config.md`
- `epics/11-observability-performance.md` (basic)

Exit criteria:
- [x] Cooperative stop/pause/resume semantics
- [x] Wiring loaders/builders stable
- [x] VisualSpec validation stable

### Milestone M2: CLI + Local Workflow (In Progress)

Epics:
- `epics/05-cli.md`
- `epics/12-docs-examples.md`

Exit criteria:
- [ ] `python -m bsim config.yaml` runs simulations
- [ ] CLI errors are actionable
- [ ] Docs demonstrate workflow

### Milestone M3: SimUI v0.1 (Complete)

Epics:
- `epics/04-simui.md`
- `contracts/simui-api.md`

Exit criteria:
- [x] UI can launch and run/pause/resume/reset
- [x] SSE real-time updates working
- [x] Event and visuals APIs versioned

### Milestone M4: Plugin SDK v0.1 (In Progress)

Epics:
- `epics/08-plugin-sdk.md`
- `contracts/plugin-contract.md`

Exit criteria:
- [ ] Plugin discovery via entry points
- [ ] Registry and validation hooks

### Milestone M5: Domain Packs (Complete)

Epics:
- `epics/07-domain-modules.md`

Exit criteria:
- [x] Neuro pack: Izhikevich, Poisson input, synapses, monitors
- [x] Ecology pack: Population dynamics, interactions, monitors

---

## Part 2: Platform Execution Plan (18 Months)

This plan assumes a team and funding. See `STRATEGY.md` for business model and GTM details.

### Phase 1: Foundation (Months 1-3)

**Goal:** Prove single-paradigm value with SBML

#### Month 1: First Adapter
- [ ] Build tellurium adapter (SBML execution)
- [ ] Test with 10 BioModels models
- [ ] Document adapter contract

#### Month 2: Model Index
- [ ] Index BioModels (automated sync)
- [ ] PostgreSQL for metadata
- [ ] Basic search API

#### Month 3: MVP Web UI
- [ ] Model browser (search, filter)
- [ ] Run model from browser
- [ ] Results visualization
- [ ] Deploy to staging

**Exit criteria:**
- User can search BioModels, click a model, run it, see results
- Works for 100+ SBML models
- <10s startup time

### Phase 2: Validation (Months 4-6)

**Goal:** Prove product-market fit with education

#### Month 4: User Onboarding
- [ ] User accounts (auth)
- [ ] Save/load projects
- [ ] Basic onboarding flow

#### Month 5: Education Pilots
- [ ] Recruit 5 university courses
- [ ] Weekly user interviews
- [ ] Iterate based on feedback

#### Month 6: Analytics & Learning
- [ ] Usage analytics
- [ ] Identify drop-off points
- [ ] Feature prioritization from data

**Exit criteria:**
- 5 courses actively using platform
- 100 weekly active users
- Clear feedback on next priorities

### Phase 3: Second Paradigm (Months 7-9)

**Goal:** Prove multi-paradigm composition

#### Month 7: NeuroML Adapter
- [ ] Build pyNeuroML adapter
- [ ] Index NeuroML-DB models
- [ ] Test composition: SBML + NeuroML

#### Month 8: Composition UI
- [ ] Visual wiring editor
- [ ] Connect modules in browser
- [ ] Save/share compositions

#### Month 9: Freemium Launch
- [ ] Pricing implementation
- [ ] Payment integration (Stripe)
- [ ] Pro tier features

**Exit criteria:**
- Users can wire SBML + NeuroML models together
- First paying customers
- Composition is the differentiator

### Phase 4: Growth (Months 10-12)

**Goal:** Grow user base and revenue

#### Month 10: Content & Community
- [ ] Tutorial library (10+ tutorials)
- [ ] Example compositions gallery
- [ ] Community forum/Discord

#### Month 11: Conference Presence
- [ ] COMBINE conference presence
- [ ] CNS (Computational Neuroscience)
- [ ] Academic partnerships

#### Month 12: Seed Fundraise
- [ ] Pitch deck
- [ ] Metrics package
- [ ] Investor meetings

**Exit criteria:**
- 500 WAU
- 50 paying users
- $2k MRR
- Seed round closed or in progress

### Phase 5: Scale (Months 13-15)

**Goal:** Team features and enterprise readiness

#### Month 13: Team Tier
- [ ] Shared workspaces
- [ ] Collaboration features
- [ ] Team billing

#### Month 14: More Adapters
- [ ] CellML adapter (OpenCOR)
- [ ] Custom Python module upload
- [ ] Adapter documentation

#### Month 15: Enterprise Prep
- [ ] Audit logs
- [ ] SSO integration
- [ ] Compliance documentation

**Exit criteria:**
- Team tier launched
- 3+ working adapters
- Enterprise-ready feature set

### Phase 6: Enterprise (Months 16-18)

**Goal:** Enterprise revenue and Series A prep

#### Month 16: Enterprise Pilots
- [ ] 2 enterprise pilot customers
- [ ] Custom deployment option
- [ ] SLA framework

#### Month 17: Advanced Features
- [ ] Parameter sweeps
- [ ] Batch execution
- [ ] API rate limits and metering

#### Month 18: Series A Prep
- [ ] Growth metrics
- [ ] Unit economics
- [ ] Series A pitch

**Exit criteria:**
- 2,000 WAU
- 200 paying users
- $10k MRR
- 2 enterprise pilots
- Series A ready

---

## Part 3: Technical Milestones (Platform)

### Milestone P1: First Adapter (tellurium/SBML)

Priority: Critical
Dependencies: None

Deliverables:
- [ ] `TelluriumAdapter` implementing `SimulatorAdapter` protocol
- [ ] Time synchronization working
- [ ] BioSignal interchange format
- [ ] Tests against 10+ BioModels

### Milestone P2: Model Index

Priority: Critical
Dependencies: P1

Deliverables:
- [ ] BioModels sync job (daily)
- [ ] PostgreSQL schema for model metadata
- [ ] Search API (title, tags, species)
- [ ] S3 storage for model files

### Milestone P3: Web Platform MVP

Priority: Critical
Dependencies: P1, P2

Deliverables:
- [ ] FastAPI backend
- [ ] React frontend (extend SimUI)
- [ ] User authentication
- [ ] Model browser
- [ ] Run execution (containerized)
- [ ] Results display

### Milestone P4: Second Adapter (pyNeuroML)

Priority: High
Dependencies: P1

Deliverables:
- [ ] `NeuroMLAdapter` implementing `SimulatorAdapter`
- [ ] NeuroML-DB indexing
- [ ] Cross-paradigm composition tests

### Milestone P5: Composition Engine

Priority: High
Dependencies: P1, P4

Deliverables:
- [ ] TimeBroker for multi-adapter sync
- [ ] Transform functions (unit conversion)
- [ ] Visual wiring editor
- [ ] Composition serialization (YAML)

### Milestone P6: Monetization

Priority: High
Dependencies: P3

Deliverables:
- [ ] Stripe integration
- [ ] Usage metering
- [ ] Tier enforcement
- [ ] Billing dashboard

---

## Success Metrics by Phase

| Phase | WAU | Paying Users | MRR | Adapters |
|-------|-----|--------------|-----|----------|
| End of Phase 2 | 100 | 0 | $0 | 1 |
| End of Phase 3 | 300 | 10 | $500 | 2 |
| End of Phase 4 | 500 | 50 | $2,000 | 2 |
| End of Phase 5 | 1,000 | 100 | $5,000 | 3+ |
| End of Phase 6 | 2,000 | 200 | $10,000 | 4+ |

---

## Risk Mitigation Checkpoints

### Month 3 Checkpoint
- Can we run 100 SBML models reliably?
- Is the UI usable without explanation?
- **Kill criteria:** Adapter fundamentally broken, >50% model failures

### Month 6 Checkpoint
- Do professors actually use it in courses?
- Are students completing exercises?
- **Kill criteria:** Zero course adoption after 3 months of outreach

### Month 9 Checkpoint
- Does composition work reliably?
- Will anyone pay?
- **Kill criteria:** Composition too slow/buggy, zero conversion to paid

### Month 12 Checkpoint
- Is growth sustainable?
- Can we raise seed?
- **Kill criteria:** Flat growth, no investor interest

---

## Document History

- 2026-01-13: Added platform execution plan (18 months)
- 2026-01-12: Initial library roadmap
