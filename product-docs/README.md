# Product Documentation

This folder is the living product, strategy, and engineering plan for `bsim`. It's structured so each document can be updated independently as work progresses.

## Quick Links

| Document | Purpose |
|----------|---------|
| [STRATEGY.md](STRATEGY.md) | Platform vision, competitive landscape, business model, GTM |
| [PRD.md](PRD.md) | Product requirements, personas, features, non-goals |
| [ROADMAP.md](ROADMAP.md) | Milestones, 18-month execution plan, success metrics |

## How to Use

1. **Start with Strategy** - Read `STRATEGY.md` to understand the "why" and market positioning
2. **Review PRD** - Read `PRD.md` for detailed requirements and personas
3. **Check Roadmap** - Read `ROADMAP.md` for sequencing and current priorities
4. **Dive into Epics** - Each epic in `epics/` has implementation details

## Folder Structure

```
product-docs/
├── STRATEGY.md          # Business strategy, GTM, competitive analysis
├── PRD.md               # Product requirements document
├── ROADMAP.md           # Milestones and execution plan
├── epics/               # Feature epics with implementation plans
├── contracts/           # Technical API contracts
└── quality/             # Quality gates and practices
```

## Updating Documents

When working on an epic:
1. Set `Status` and `Last updated`
2. Add/adjust acceptance criteria as requirements clarify
3. Record decisions with rationale
4. Add links to PRs, issues, and docs

## Index

### Strategy & Product
- [STRATEGY.md](STRATEGY.md) - Platform vision, business model, GTM strategy
- [PRD.md](PRD.md) - Product requirements, personas, features
- [ROADMAP.md](ROADMAP.md) - Milestones, execution plan, metrics

### Epics (Implementation Plans)

| Epic | Status | Description |
|------|--------|-------------|
| [01-foundation](epics/01-foundation.md) | Complete | Initial setup |
| [02-core-runtime](epics/02-core-runtime.md) | Complete | BioWorld, events, lifecycle |
| [03-wiring-config](epics/03-wiring-config.md) | Complete | Wiring loaders, validation |
| [04-simui](epics/04-simui.md) | Complete | Web UI, SSE updates |
| [05-cli](epics/05-cli.md) | In Progress | Command-line interface |
| [06-packaging-release](epics/06-packaging-release.md) | Complete | PyPI packaging |
| [07-domain-modules](epics/07-domain-modules.md) | Complete | Neuro + Ecology packs |
| [08-plugin-sdk](epics/08-plugin-sdk.md) | In Progress | Plugin discovery, registry |
| [09-standards-interop](epics/09-standards-interop.md) | Planned | Biomodule-based interoperability |
| [10-web-platform](epics/10-web-platform.md) | Planned | Full platform build |
| [11-observability](epics/11-observability-performance.md) | Partial | Logging, metrics |
| [12-docs-examples](epics/12-docs-examples.md) | In Progress | Documentation |
| [13-repo-hygiene](epics/13-repo-hygiene.md) | Complete | CI, linting, structure |

### Technical Contracts
- [wiring-spec.md](contracts/wiring-spec.md) - Wiring configuration format
- [visualspec.md](contracts/visualspec.md) - Visualization JSON contract
- [simui-api.md](contracts/simui-api.md) - SimUI REST/SSE API
- [plugin-contract.md](contracts/plugin-contract.md) - Plugin registration

### Quality
- [definition-of-done.md](quality/definition-of-done.md) - DoD checklist
- [testing-strategy.md](quality/testing-strategy.md) - Test approach
- [security-and-safety.md](quality/security-and-safety.md) - Security guidelines

## Key Strategic Documents

### For Investors / Business
- `STRATEGY.md` - Market analysis, business model, GTM
- `ROADMAP.md` (Part 2) - 18-month execution plan with metrics

### For Engineers
- `PRD.md` - Feature requirements
- `ROADMAP.md` (Part 1) - Library milestones
- `epics/*` - Implementation details
- `contracts/*` - API specifications

### For Domain Experts
- `epics/09-standards-interop.md` - How we integrate SBML/NeuroML/CellML via biomodule packages
- `epics/07-domain-modules.md` - Neuro and ecology packs
