# ishuru-skill-distribution

Unified skill distribution registry, installer, and multi-agent subscription routing across 7 GitHub accounts.

## Quick Start

```bash
# Install all 385 skills
curl -sL https://raw.githubusercontent.com/ishuru/ishuru-skill-distribution/main/install.sh | bash

# Or clone and run
git clone https://github.com/ishuru/ishuru-skill-distribution
cd ishuru-skill-distribution
./install.sh all

# Install specific category
./install.sh ai-agent
./install.sh enterprise

# List categories
./install.sh list
```

---

## Distribution Map

```
6 accounts · 7 repos · 385 skills · 13 categories
```

| Account | Repo | Skills | Domain |
|---------|------|--------|--------|
| **ishuru** | `ishuru-skills` | 86 | General dev, design, AI, platforms |
| **ishuru** | `sd-dataeng-skills` | 14 | Data engineering, SQL, Fabric |
| **s4b7-ai** | `s4b7-ai-skills` | 40 | AI/ML, models, orchestration |
| **sabarish-duvvuru** | `productivity-skills` | 46 | Calendar, focus, Bee AI, notes |
| **theleostark** | `infra-skills` | 74 | Mesh, shadow ops, devices, security |
| **ishork** | `research-skills` | 38 | X, YouTube, Reddit, content, patterns |
| **sduvvuru-qx** | `enterprise-skills` | 115 | Astemo, FH4S, M365, governance |

---

## Categories

| Category | Skills | Primary Repo |
|----------|--------|-------------|
| `dev-workflow` | 13 | ishuru-skills |
| `code-quality` | 6 | ishuru-skills |
| `design-ui` | 29 | ishuru-skills |
| `ai-agent` | 17 | s4b7-ai-skills |
| `model-subscription` | 12 | productivity-skills |
| `browser-auth` | 1 | ishuru-skills |
| `infra-mesh` | 48 | infra-skills |
| `research-content` | 28 | research-skills |
| `knowledge-comms` | 17 | research-skills |
| `enterprise-astemo` | 67 | enterprise-skills |
| `data-engineering` | 13 | sd-dataeng-skills |
| `productivity` | 40 | productivity-skills |

---

## Multi-Agent Patterns

### Spawn + Evaluate
Primary work on GLM-5.1 → spawn GPT-5.5 evaluation session for independent review.

```python
# In Craft Agent: spawn evaluation on alternate model
spawn_session(
    prompt="Evaluate this output for correctness and completeness...",
    model="chatgpt-plus",  # GPT-5.x for independent perspective
    thinkingLevel="high"
)
```

### Cross-Validation
Run same prompt on 2+ models, compare outputs.

```python
# Use call_llm for batch cross-validation
call_llm(prompt="...", model="codex", outputFormat="analysis")
# Compare with main model output
```

### Parallel Processing
Use `call_llm` for batch classification/summarization — all run simultaneously.

```python
# Multiple call_llm in one message = parallel
call_llm(prompt="Classify...", model="pi/glm-5.1", outputFormat="classification")
call_llm(prompt="Summarize...", model="pi/glm-5.1", outputFormat="summary")
```

### Context Isolation
Process large files via `call_llm` to avoid polluting main context window.

### Deep Reasoning
Force `thinking: true` on `call_llm` for complex subtasks without affecting main model budget.

---

## Subscription Routing

### Providers

| Provider | Type | Model | Context | Privacy |
|----------|------|-------|---------|---------|
| `glm-global-coding-plan` | Free | GLM-5.1 | 128K | GREEN only |
| `codex` | Subscription | GPT-5.x | 200K | All tiers |
| `chatgpt-plus` | Subscription | GPT-5.x | 200K | All tiers |
| `pi-api-key` | API key | GLM-5.1 | 128K | GREEN only |

### Routing Matrix

| Task Type | Primary | Fallback |
|-----------|---------|----------|
| Deep review | codex (GPT-5.x) | GLM-5.1 |
| Implementation | GLM-5.1 | codex |
| Evaluation | chatgpt-plus (GPT-5.x) | GLM-5.1 |
| Cross-validation | chatgpt-plus | codex |
| Vision | GLM-5.1 | codex |
| Large context | codex | GLM-5.1 |
| Enterprise RED | codex | local-ollama |

### Privacy Tiers (GLM-001)

| Tier | Markers | GLM? | Route To |
|------|---------|------|----------|
| **RED** | Astemo, Honda, FH4S, BOM, drawings, SASG | ❌ NEVER | Codex or local |
| **AMBER** | Patent drafts, mesh topology, personal financial | ⚠️ Conditional | Gemini preferred |
| **GREEN** | OSS code, public docs, UI prototypes, research | ✅ Preferred | GLM primary |

### Value Maximization

- GLM (free) → maximize for all GREEN-tier tasks
- GPT-5.x (paid) → reserve for evaluation, cross-validation, RED-tier enterprise
- `call_llm` with pi/glm-5.1 → default for batch/parallel subtasks
- Spawn sessions on alternate models → self-review isn't sufficient

---

## Files

| File | Purpose |
|------|---------|
| `skill-registry.json` | Full registry: accounts, repos, skills, categories, routing |
| `install.sh` | Multi-account installer (all or by category) |
| `README.md` | This file |

---

## License

MIT License

---

**Updated**: 2026-05-13
**Maintainer**: [@ishuru](https://github.com/ishuru)
