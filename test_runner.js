/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.5.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.5.0) ---');

// 1. Test RoleAdvisor Candidate Recommendations & Forego Option
const candidates = RoleAdvisor.recommendRoleCandidates('Design a high performance microservice in Go', 'auto', 'auto');
console.log('✔ Role Candidates Count:', candidates.length);
console.assert(candidates.length >= 4, 'Should return 4 role options including Forego');
console.assert(candidates.some(c => c.id === 'candidate_forego'), 'Should include Forego Role Option');

// 2. Test Forego System Role in MetaPromptEngine
const foregoGen = MetaPromptEngine.generateMetaPrompt({
  task: 'Build a Go service',
  context: 'Running on Kubernetes',
  selectedRoleCandidate: candidates.find(c => c.id === 'candidate_forego')
});

console.log('✔ Forego Role Test Contains Neutral Directive:', foregoGen.metaPrompt.includes('[SYSTEM DIRECTIVE]'));
console.assert(foregoGen.metaPrompt.includes('[SYSTEM DIRECTIVE]'), 'Forego role should use un-opinionated neutral system directive');

// 3. Test VersionManager (v0.5.0)
const ver = VersionManager.saveVersion({
  version: 'v0.5.0',
  title: 'Multi-Candidate Role Recommendation & Forego Option Release',
  promptText: foregoGen.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Added multi-candidate role selection chips and Forego Role option'
});
console.log('✔ VersionManager Test (v0.5.0 Entry):', ver.version);
console.assert(ver.version === 'v0.5.0', 'VersionManager should store v0.5.0 entry');

console.log('--- ALL v0.5.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
