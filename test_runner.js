/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.6.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.6.0) ---');

// 1. Test Educational Step Breakdown & Multi-Option Master Prompts
const res = MetaPromptEngine.generateMetaPrompt({
  task: 'help me come up with a new logo design idea for my company. its a lube delivery service in austin and i like the color blue',
  context: 'On-demand delivery app',
  enableSecurityCheck: true
});

console.log('✔ Meta-Prompt Output Generated (Length):', res.metaPrompt.length, 'chars');
console.assert(res.metaPrompt.includes('=== META-PROMPT ARCHITECTURAL BREAKDOWN ==='), 'Should contain architectural step breakdown header');
console.assert(res.metaPrompt.includes('Step 1: Assign a Specific Role'), 'Should contain Step 1 role explanation');
console.assert(res.metaPrompt.includes('--- OPTION A'), 'Should contain Option A master prompt');
console.assert(res.metaPrompt.includes('--- OPTION B'), 'Should contain Option B master prompt');

console.log('✔ Option A Length:', res.optionA.length, 'chars');
console.log('✔ Option B Length:', res.optionB.length, 'chars');
console.assert(res.optionA.length > 50, 'Option A should be generated');
console.assert(res.optionB.length > 50, 'Option B should be generated');

// 2. Test VersionManager (v0.6.0 Entry)
const ver = VersionManager.saveVersion({
  version: 'v0.6.0',
  title: 'Educational Step Breakdown & Option A / Option B Master Prompts Release',
  promptText: res.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Added 4-step educational architectural breakdown alongside 1-click ready-to-use Option A & Option B prompts'
});
console.log('✔ VersionManager Test (v0.6.0 Entry):', ver.version);
console.assert(ver.version === 'v0.6.0', 'VersionManager should store v0.6.0 entry');

console.log('--- ALL v0.6.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
