#!/usr/bin/env node
const { route, classify, glmGate, multiAgentPattern, health, PROVIDERS, ROUTING_MATRIX } = require('../lib/router');

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

const G = '\x1b[32m', B = '\x1b[34m', C = '\x1b[36m', Y = '\x1b[33m', R = '\x1b[31m', NC = '\x1b[0m';

switch (cmd) {
  case 'route': {
    const task = args[1];
    if (!task) { console.log('Usage: skill-router route <task-type>'); process.exit(1); }
    const result = route(task, { text: task });
    console.log(`\n${B}Route: ${C}${task}${NC}`);
    console.log(`  Primary:   ${result.provider} (${result.providerInfo?.model || '?'} | ${result.providerInfo?.context || '?'} ctx | ${result.providerInfo?.type || '?'})`);
    console.log(`  Fallback:  ${result.fallback}`);
    console.log(`  Tier:      ${result.tier}`);
    console.log(`  GLM:       ${result.glmAllowed ? '✅ allowed' : '❌ blocked'}`);
    console.log(`  Temp:      ${result.temp}`);
    console.log(`  Context:   ${result.contextLimit?.toLocaleString() || '?'}\n`);
    break;
  }
  case 'classify': {
    const text = args.slice(1).join(' ') || '';
    const tier = classify(text);
    console.log(`\n  "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`);
    console.log(`  Tier: ${tier === 'RED' ? R : tier === 'AMBER' ? Y : G}${tier}${NC}\n`);
    break;
  }
  case 'patterns': {
    const patterns = multiAgentPattern('general');
    console.log(`\n${B}Multi-Agent Patterns:${NC}`);
    for (const p of patterns) {
      console.log(`  ${C}${p.name}${NC}: ${p.when}`);
    }
    console.log();
    break;
  }
  case 'providers': {
    console.log(`\n${B}Providers:${NC}`);
    for (const [name, p] of Object.entries(PROVIDERS)) {
      console.log(`  ${name.padEnd(25)} ${p.model.padEnd(10)} ${p.type.padEnd(13)} ${p.context.toLocaleString().padStart(7)} ctx  ${p.privacy.join(',')}`);
    }
    console.log();
    break;
  }
  case 'matrix': {
    console.log(`\n${B}Routing Matrix:${NC}`);
    console.log(`  ${'Task'.padEnd(20)} ${'Primary'.padEnd(25)} ${'Fallback'.padEnd(25)} ${'Temp'.padEnd(6)} Context`);
    for (const [task, rule] of Object.entries(ROUTING_MATRIX)) {
      console.log(`  ${task.padEnd(20)} ${rule.primary.padEnd(25)} ${(rule.fallback || '-').padEnd(25)} ${String(rule.temp).padEnd(6)} ${rule.context?.toLocaleString() || '?'}`);
    }
    console.log();
    break;
  }
  default:
    console.log(`@ishuru/skill-router v1.0.0`);
    console.log();
    console.log(`Usage: skill-router <command> [args]`);
    console.log();
    console.log(`Commands:`);
    console.log(`  route <task>     Route task type to optimal subscription`);
    console.log(`  classify <text>  Classify data tier (RED/AMBER/GREEN)`);
    console.log(`  patterns         Show multi-agent patterns`);
    console.log(`  providers        List available providers`);
    console.log(`  matrix           Show full routing matrix`);
}
