# bsim Platform Strategy

Status: Draft
Last updated: 2026-01-13

## Executive Summary

bsim is building the **aggregation platform for biological simulation** - a unified interface to run, combine, and share models from every major standard. The goal is to become "Hugging Face for biological simulations."

**Core thesis:** No one owns "run any biology simulation from browser with unified UX." We capture this market by aggregating existing tools (not competing with them) and providing superior composition and collaboration capabilities.

## Vision

```
┌─────────────────────────────────────────────────────────────┐
│                    bsim Platform                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Web UI                               ││
│  │  • Browse models (BioModels, ModelDB, NeuroML-DB)      ││
│  │  • Visual wiring editor                                ││
│  │  • Run simulations                                     ││
│  │  • Share & publish                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Execution Layer (bsim core)               ││
│  │  • Biomodule packages (SBML, NeuroML, CellML, custom) ││
│  │  • Orchestration & wiring                             ││
│  │  • BioWorld orchestration                              ││
│  └─────────────────────────────────────────────────────────┘│
│                           │                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Model Repository                           ││
│  │  • Indexed from BioModels, ModelDB, NeuroML-DB        ││
│  │  • User-contributed models                             ││
│  │  • Versioned, searchable, tagged                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## The One-Liner

> "Hugging Face for biological simulations - run, combine, and share models from every major standard through one platform."

---

## Competitive Landscape

### Direct Competitors

| Player | What they do | Weakness | Our advantage |
|--------|--------------|----------|---------------|
| **BioModels** | SBML model repository | No execution, just storage | We run models |
| **ModelDB** | Neuroscience models | NEURON-centric, clunky UI | Unified UX, multi-paradigm |
| **Simtk/OpenSim** | Biomechanics | Narrow domain | Broad coverage |
| **COPASI** | SBML simulator | Desktop, single-paradigm | Browser, composition |
| **Virtual Cell** | Cell modeling | Academic, dated UI | Modern UX |
| **Tellurium** | SBML in Python | Library, not platform | Platform + UI |

### Adjacent Players

| Player | Relationship |
|--------|--------------|
| **Benchling** | Wet lab focus, not simulation - potential partner |
| **MATLAB/Simulink** | Expensive, not bio-native - we're cheaper, specialized |
| **Brian2/NEURON/Mesa** | Simulators we wrap, not compete with |

### Gap in Market

No one owns "run any biology simulation from browser with unified UX."

---

## Standards vs Simulators (Key Insight)

Understanding this distinction is critical to our strategy:

| Category | Examples | What they are |
|----------|----------|---------------|
| **Simulators** | Brian2, NEURON, Mesa, COPASI, tellurium | Software that *runs* simulations |
| **Standards** | SBML, CellML, NeuroML, SED-ML | File formats that *describe* models |

**Standards need simulators to run.** An SBML file is just XML - it requires COPASI or tellurium to execute.

### Standards Coverage

| Standard | Domain | Best tool | Python API | Integration difficulty |
|----------|--------|-----------|------------|-------------------|
| **SBML** | Biochemical networks | tellurium/libroadrunner | Excellent | Easy |
| **CellML** | Mathematical models | OpenCOR | Limited | Medium |
| **NeuroML** | Computational neuro | pyNeuroML/jNeuroML | Good | Medium |
| **SED-ML** | Simulation protocols | libSEDML | Good | Medium |

### Model Databases (Aggregation Targets)

| Database | Models | Standard | Notes |
|----------|--------|----------|-------|
| **BioModels** | 1000+ | SBML | Curated, high quality |
| **ModelDB** | 1800+ | NEURON/various | Neuroscience focus |
| **NeuroML-DB** | Growing | NeuroML | Structured, programmatic |
| **CellML Repository** | 600+ | CellML | Cardiac, physiology |

---

## Biomodule-First Integration

### Core Principle

We don't reimplement simulators - biomodule packages wrap them and expose the standard BioModule contract:

```
┌─────────────────────────────────────────────────────────────┐
│  User: "Run this SBML model"                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  bsim Biomodule Packages                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ tellurium   │  │ pyNeuroML   │  │  Mesa       │         │
│  │ biomodule   │  │ biomodule   │  │  biomodule  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│  Actual Simulators (unchanged)                              │
│  tellurium        pyNeuroML         Mesa                    │
│  libroadrunner    jNeuroML          ABM runtime             │
└─────────────────────────────────────────────────────────────┘
```

### Biomodule Contract

Packages implement the standard BioModule runtime (`setup/reset/advance_to/...`) and expose ports via `get_outputs()` / `set_inputs()`.

### Scheduling + Synchronization

BioWorld schedules each biomodule using `min_dt` and optional `next_due_time(t)`. Modules can substep internally to match simulator constraints.
### The Killer Demo

```yaml
# Neuron controlling metabolism - impossible without composition
modules:
  glucose_metabolism:
    class: bsim_sbml.GlucoseModel
    args:
      sbml_path: BioModels/MODEL1234.xml

  sensory_neuron:
    class: bsim_neuroml.SensorNeuron
    args:
      neuroml_path: glucose_sensor.nml

  motor_output:
    class: bsim.packs.neuro.IzhikevichPopulation

wiring:
  - { from: glucose_metabolism.glucose, to: [sensory_neuron.input_current] }
  - { from: sensory_neuron.spikes, to: [motor_output.input] }
```

**This is what no existing tool does well.**

---

## Business Model

### Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Public models, 10 sim hours/mo, community support |
| **Pro** | $29/mo | Private models, 100 sim hours/mo, priority support, API access, export |
| **Team** | $99/user/mo | Everything in Pro + shared workspace, collaboration, audit logs, SSO |
| **Enterprise** | Custom | On-prem deployment, SLA, dedicated support, compliance |

### Revenue Model Options

| Model | Viability | Notes |
|-------|-----------|-------|
| **Freemium compute** | High | Clear value exchange, compute costs scale with revenue |
| **Team/Enterprise** | High | High LTV but longer sales cycle |
| **Marketplace** | Medium | % of paid model sales, needs critical mass first |
| **Academic licensing** | Medium | Site licenses, slow procurement |

### Unit Economics (Target)

- CAC (education): Low ($50-100) via word of mouth
- CAC (enterprise): High ($5000+) via sales
- LTV Pro: $348/year
- LTV Team (5 users): $5940/year
- Target LTV:CAC > 3:1

---

## Go-to-Market Strategy

### Phase 1: Education Beachhead

**Why education:**
- Concentrated buyers (professors)
- Clear pain point (environment setup is hell for students)
- Low switching cost (new semester, new tool)
- Word of mouth in academic networks
- Students graduate → bring to industry

**Motion:**
1. Identify 5 professors teaching computational biology
2. Offer free use for their course
3. Get feedback, iterate weekly
4. Case studies → more professors
5. Students graduate → bring to industry jobs

**Target courses:**
- Computational Biology 101
- Systems Biology
- Computational Neuroscience
- Mathematical Modeling in Biology

### Phase 2: Research Prototyping

After education foothold:
- Researchers who learned it as students
- "I used this in Prof X's class, can I use it for my thesis?"
- Freemium converts to paid for serious work

### Phase 3: Industry

Once we have:
- Credibility (papers citing bsim)
- Features (compliance, audit, deployment)
- Case studies (pharma pilot projects)

---

## Defensibility / Moat

| Moat Type | Potential | How to Build |
|-----------|-----------|--------------|
| **Network effects** | Medium | User-contributed models, shared simulations |
| **Data/content** | High | Indexed models + user content + run history |
| **Switching costs** | Medium | Saved projects, team workflows |
| **Brand** | Possible | "The place for bio simulations" |
| **Tech** | Low-Medium | Integration packages aren't magic, but tedious to replicate |

**Strongest moat:** Aggregated model repository + user-generated compositions. Hard to replicate once large.

---

## Risk Assessment

### High Severity Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **"Researchers won't pay"** | Fatal | Education beachhead first; prove value before monetizing |
| **Slow adoption** | Severe | Need champion users, patience, content marketing |
| **Can't get first 100 users** | Fatal | Focus on 5 professors before scaling |

### Medium Severity Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Integration packages are fragile** | High | Start with one (tellurium), nail it before expanding |
| **Compute costs eat margin** | High | Aggressive caching, time limits, spot instances |
| **Version hell (upstream changes)** | Medium | Pin versions, maintain compatibility shims |
| **Performance overhead** | Medium | Be explicit about niche (prototyping, not HPC) |

### Low Severity Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Big player copies** | Low | AWS/Google don't care about niche bio tools |
| **Better-funded competitor** | Low | First-mover advantage in unclaimed space |

### What Would Kill This

1. Can't get first 100 users → no validation, no funding
2. Compute economics don't work → burn money
3. Integration packages too brittle -> bad UX, users churn
4. Team falls apart → startup reality

---

## Target Users & Use Cases

### Primary Personas

| Persona | Use Case | Willingness to Pay |
|---------|----------|-------------------|
| **Professor** | Course material, demos | Medium (institutional) |
| **Graduate student** | Thesis research, prototyping | Low (but converts later) |
| **Postdoc/Researcher** | Paper reproducibility, exploration | Medium |
| **Biotech R&D** | Drug discovery modeling | High |
| **Pharma** | Regulatory submissions, QSP | Very High |

### Use Case Fit

| Scenario | bsim Fit | Notes |
|----------|----------|-------|
| Learning computational biology | Excellent | No setup, instant gratification |
| Teaching courses | Excellent | Assignable, reproducible |
| Prototyping multi-scale models | Good | Fast iteration, shareable |
| Publishing reproducible research | Good | Config-driven, versioned |
| Production HPC workloads | Poor | They'll want local control |
| Real-time / robotics | Poor | Latency-sensitive |

---

## Investor FAQ

### "Why now?"

- Cloud compute is cheap and accessible
- Standards have matured (SBML, NeuroML are stable)
- Biology is increasingly computational (AI in drug discovery)
- No dominant player in multi-paradigm simulation space

### "How big is this market?"

- Computational biology software: ~$5B market
- Growing 15-20% annually
- Adjacent to pharma R&D spend ($200B+)

### "What's the unfair advantage?"

- First mover on multi-paradigm composition
- Biomodule architecture (leverage, don't compete)
- Focus on UX in a space with terrible UX

### "What are the risks?"

- Execution risk (integration packages are hard)
- Adoption risk (researchers are conservative)
- Compute cost risk (simulations are expensive)

---

## Success Metrics

### Phase 1 (Months 1-6)

| Metric | Target |
|--------|--------|
| University pilot courses | 5 |
| Weekly active users | 100 |
| Models indexed | 1000+ (BioModels) |
| Working integration packages | 1 (tellurium) |

### Phase 2 (Months 7-12)

| Metric | Target |
|--------|--------|
| Weekly active users | 500 |
| Paying users | 50 |
| MRR | $2,000 |
| Working integration packages | 2 (+ pyNeuroML) |

### Phase 3 (Months 13-18)

| Metric | Target |
|--------|--------|
| Weekly active users | 2,000 |
| Paying users | 200 |
| MRR | $10,000 |
| Enterprise pilots | 2 |

---

## Appendix: Competitive Deep Dive

### Brian2 vs bsim

| Aspect | Brian2 | bsim |
|--------|--------|------|
| Focus | Spiking neural networks | Multi-paradigm composition |
| Approach | Equation-based, code generation | Module wiring, biomodule packages |
| UI | None (library) | SimUI + web platform |
| Standards | NeuroML export | Biomodule-first (wrap Brian2 in packages) |
| Relationship | Potential integration target | Orchestration layer |

### Mesa vs bsim

| Aspect | Mesa | bsim |
|--------|------|------|
| Focus | Agent-based modeling | Multi-paradigm composition |
| Approach | Agents, schedulers, grids | Module wiring, biomodule packages |
| UI | Browser visualization | SimUI + web platform |
| Standards | None | Biomodule-first |
| Relationship | Potential integration target | Orchestration layer |

### tellurium vs bsim

| Aspect | tellurium | bsim |
|--------|-----------|------|
| Focus | SBML simulation | Multi-paradigm composition |
| Approach | Direct SBML execution | Wrap tellurium in biomodule packages |
| UI | Jupyter integration | SimUI + web platform |
| Standards | SBML native | Biomodule-first |
| Relationship | First integration target | Orchestration layer |

---

## Document History

- 2026-01-13: Initial strategy document created
