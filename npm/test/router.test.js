const { route, classify, glmGate, multiAgentPattern, health, PROVIDERS, ROUTING_MATRIX } = require('../lib/router');

let pass = 0, fail = 0;

function assert(condition, msg) {
  if (condition) { pass++; }
  else { fail++; console.log(`  ✗ ${msg}`); }
}

console.log('Testing @ishuru/skill-router\n');

// Test classify
console.log('classify()');
assert(classify('astemo FH4S drawing') === 'RED', 'RED tier detection');
assert(classify('patent draft for shadow-lab') === 'AMBER', 'AMBER tier detection');
assert(classify('build a React component with shadcn') === 'GREEN', 'GREEN tier detection');
assert(classify('hello world') === 'GREEN', 'default GREEN');

// Test glmGate
console.log('glmGate()');
assert(glmGate('RED', 'personal') === false, 'RED blocked in personal');
assert(glmGate('RED', 'enterprise') === false, 'RED blocked in enterprise');
assert(glmGate('AMBER', 'enterprise') === false, 'AMBER blocked in enterprise');
assert(glmGate('AMBER', 'personal') === true, 'AMBER allowed in personal');
assert(glmGate('GREEN', 'personal') === true, 'GREEN allowed');

// Test route
console.log('route()');
const impl = route('implementation');
assert(impl.provider === 'glm-global-coding-plan', 'implementation routes to GLM');
assert(impl.fallback === 'codex', 'implementation fallback to codex');
assert(impl.tier === 'GREEN', 'default tier is GREEN');
assert(impl.glmAllowed === true, 'GLM allowed for GREEN');

const review = route('deep_review');
assert(review.provider === 'codex', 'deep_review routes to codex');
assert(review.temp === 0.3, 'deep_review temp 0.3');

// Test RED override
const redRoute = route('implementation', { text: 'astemo FH4S change point' });
assert(redRoute.provider === 'codex', 'RED override to codex');
assert(redRoute.glmAllowed === false, 'GLM blocked for RED');

// Test multiAgentPattern
console.log('multiAgentPattern()');
const patterns = multiAgentPattern('general');
assert(patterns.length >= 3, 'returns 3+ patterns for GREEN');
assert(patterns.some(p => p.name === 'spawn_evaluate'), 'includes spawn_evaluate');

// Test health
console.log('health()');
const h = health([
  { slug: 'a', depends_on: ['b'] },
  { slug: 'b', depends_on: [] },
  { slug: 'c', depends_on: ['missing'] },
]);
assert(h.total === 3, 'health counts total');
assert(h.missingCount === 1, 'health detects missing dep');
assert(h.healthy === false, 'health false with missing deps');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
