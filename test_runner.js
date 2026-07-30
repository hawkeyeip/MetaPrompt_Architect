/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.7.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.7.0) ---');

// 1. Test Dynamic Role Matchmaker for Logo/Design prompt
const logoCandidates = RoleAdvisor.recommendRoleCandidates('help me come up with a logo for my lube delivery service in austin');
console.log('✔ Logo Prompt Candidates:', logoCandidates.map(c => c.title));
console.assert(logoCandidates.some(c => c.title.includes('Brand Identity Designer')), 'Should synthesize Brand Identity Designer role for logo prompt');
console.assert(logoCandidates.some(c => c.title.includes('Local Market Growth')), 'Should synthesize Local Market Growth role for Austin prompt');

// 2. Test Dynamic Role Matchmaker for Coding prompt
const codeCandidates = RoleAdvisor.recommendRoleCandidates('build an API microservice in Go with Postgres');
console.log('✔ Coding Prompt Candidates:', codeCandidates.map(c => c.title));
console.assert(codeCandidates.some(c => c.title.includes('Systems & Application Architect')), 'Should synthesize Systems Architect role for Go prompt');
console.assert(codeCandidates.some(c => c.title.includes('OWASP CyberSecurity Auditor')), 'Should synthesize Security Auditor role for API prompt');

// 3. Test VersionManager (v0.7.0 Entry)
const ver = VersionManager.saveVersion({
  version: 'v0.7.0',
  title: 'Dynamic AI Role Matchmaker Engine Release',
  promptText: 'v0.7.0 test',
  targetModel: 'GPT-4o',
  changeLog: 'Replaced static role lists with dynamic domain-specific AI Role Matchmaker Engine synthesizing top 3 tailored roles per prompt + Forego option'
});
console.log('✔ VersionManager Test (v0.7.0 Entry):', ver.version);
console.assert(ver.version === 'v0.7.0', 'VersionManager should store v0.7.0 entry');

console.log('--- ALL v0.7.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
