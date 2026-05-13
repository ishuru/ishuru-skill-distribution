/**
 * skill-router — Subscription routing engine
 * 
 * Usage:
 *   const { route, classify, health } = require('./lib/router');
 *   const result = route('deep_review', { dataTier: 'GREEN', zone: 'personal' });
 */

const PROVIDERS = {
  'glm-global-coding-plan': { type: 'free', model: 'GLM-5.1', context: 128000, privacy: ['GREEN'] },
  'codex': { type: 'subscription', model: 'GPT-5.x', context: 200000, privacy: ['RED', 'AMBER', 'GREEN'] },
  'chatgpt-plus': { type: 'subscription', model: 'GPT-5.x', context: 200000, privacy: ['RED', 'AMBER', 'GREEN'] },
  'pi-api-key': { type: 'api-key', model: 'GLM-5.1', context: 128000, privacy: ['GREEN'] },
  'local-ollama': { type: 'local', model: 'varies', context: 8000, privacy: ['RED', 'AMBER', 'GREEN'] },
};

const ROUTING_MATRIX = {
  deep_review:        { primary: 'codex', fallback: 'glm-global-coding-plan', temp: 0.3, context: 80000 },
  implementation:     { primary: 'glm-global-coding-plan', fallback: 'codex', temp: 0.1, context: 20000 },
  editor_native:      { primary: 'codex', fallback: 'chatgpt-plus', temp: 0.05, context: 4000 },
  evaluation:         { primary: 'chatgpt-plus', fallback: 'glm-global-coding-plan', temp: 0.2, context: 32000 },
  cross_validation:   { primary: 'chatgpt-plus', fallback: 'codex', temp: 0.0, context: 32000 },
  vision:             { primary: 'glm-global-coding-plan', fallback: 'codex', temp: 0.2, context: 32000 },
  large_context:      { primary: 'codex', fallback: 'glm-global-coding-plan', temp: 0.0, context: 200000 },
  web_search:         { primary: 'glm-global-coding-plan', fallback: 'codex', temp: 0.7, context: 16000 },
  burst_overflow:     { primary: 'glm-global-coding-plan', fallback: 'local-ollama', temp: 0.1, context: 8000 },
  skill_generation:   { primary: 'glm-global-coding-plan', fallback: 'codex', temp: 0.3, context: 16000 },
  html_prototype:     { primary: 'glm-global-coding-plan', fallback: 'codex', temp: 0.2, context: 16000 },
};

const RED_MARKERS = ['astemo', 'fh4s', 'honda', '4e0a', 'ipm', 'sasg', 'dfmea', 'drbfm', 
  'change point', 'bom', 'drawing', 'mlc', 'usgrp1', 'greenfield', 'tarboro', 
  'keihin', 'hoe-axle', 'smart drawing'];
const AMBER_MARKERS = ['patent', 'sp-00', 'shadow-lab', 'mesh topology', 'api key', 
  'secret', 'financial', 'family', 'tailscale ip'];

/**
 * Classify data tier from content
 */
function classify(text = '', filePaths = []) {
  const combined = (text + ' ' + filePaths.join(' ')).toLowerCase();
  if (RED_MARKERS.some(m => combined.includes(m))) return 'RED';
  if (AMBER_MARKERS.some(m => combined.includes(m))) return 'AMBER';
  return 'GREEN';
}

/**
 * GLM-001 privacy gate — can GLM be used?
 */
function glmGate(dataTier, zone) {
  if (dataTier === 'RED') return false;
  if (dataTier === 'AMBER' && zone === 'enterprise') return false;
  return true;
}

/**
 * Route a task to the optimal subscription
 */
function route(taskType, opts = {}) {
  const { dataTier, zone = 'personal', contextSize = 0, text = '', filePaths = [] } = opts;
  
  // Auto-classify if tier not provided
  const tier = dataTier || classify(text, filePaths);
  
  // Hard privacy override
  if (tier === 'RED') {
    return { provider: 'codex', fallback: 'local-ollama', tier, glmAllowed: false, reason: 'RED tier — GLM blocked' };
  }
  
  // Context override
  if (contextSize > 200000) {
    return { provider: 'codex', fallback: 'glm-global-coding-plan', tier, glmAllowed: true, reason: 'Large context override' };
  }
  
  const rule = ROUTING_MATRIX[taskType] || ROUTING_MATRIX.implementation;
  const glmAllowed = glmGate(tier, zone);
  
  let provider = rule.primary;
  let fallback = rule.fallback;
  
  // GLM privacy gate
  if (!glmAllowed) {
    if (provider === 'glm-global-coding-plan') provider = 'codex';
    if (provider === 'pi-api-key') provider = 'codex';
    if (fallback === 'glm-global-coding-plan') fallback = 'codex';
  }
  
  return {
    taskType,
    provider,
    providerInfo: PROVIDERS[provider],
    fallback,
    fallbackInfo: PROVIDERS[fallback],
    temp: rule.temp,
    contextLimit: rule.context,
    tier,
    glmAllowed,
    zone,
  };
}

/**
 * Multi-agent pattern recommendation
 */
function multiAgentPattern(taskType, opts = {}) {
  const { dataTier, zone = 'personal' } = opts;
  const tier = dataTier || 'GREEN';
  
  const patterns = {
    spawn_evaluate: {
      when: 'Need independent review of output',
      primary: 'glm-global-coding-plan',
      evaluator: 'chatgpt-plus',
      tier: ['GREEN', 'AMBER'],
    },
    cross_validate: {
      when: 'Critical decision, need model agreement',
      models: ['glm-global-coding-plan', 'codex'],
      tier: ['GREEN', 'AMBER'],
    },
    parallel_batch: {
      when: 'Batch classification/summarization',
      engine: 'call_llm with pi/glm-5.1',
      tier: ['GREEN'],
    },
    context_isolation: {
      when: 'Large file processing, keep main window clean',
      engine: 'call_llm with file attachments',
      tier: ['GREEN', 'AMBER', 'RED'],
    },
    deep_reasoning: {
      when: 'Complex subtask needs extended thinking',
      engine: 'call_llm with thinking: true',
      tier: ['GREEN', 'AMBER'],
    },
  };
  
  return Object.entries(patterns)
    .filter(([_, p]) => p.tier.includes(tier))
    .map(([name, p]) => ({ name, ...p }));
}

/**
 * Health check for skill dependency graph
 */
function health(metadata = []) {
  const slugs = new Set(metadata.map(s => s.slug));
  const issues = [];
  
  for (const skill of metadata) {
    for (const dep of (skill.depends_on || [])) {
      if (!slugs.has(dep)) {
        issues.push({ skill: skill.slug, missing: dep });
      }
    }
  }
  
  return {
    total: metadata.length,
    withDeps: metadata.filter(s => s.depends_on?.length).length,
    missingDeps: issues,
    missingCount: issues.length,
    healthy: issues.length === 0,
  };
}

module.exports = { route, classify, glmGate, multiAgentPattern, health, PROVIDERS, ROUTING_MATRIX };
