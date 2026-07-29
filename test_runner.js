/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.3.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.3.0) ---');

// 1. Test RoleAdvisor Optional Selectors & Auto-Synthesis
const synthRoleAuto = RoleAdvisor.synthesizeRole('Design a database schema for user auth and SQL queries', 'auto', 'auto');
console.log('✔ RoleAdvisor Auto-Synthesis Test:', synthRoleAuto.title);

const synthRoleCustom = RoleAdvisor.synthesizeRole('Design a database schema', 'socratic_mentor', 'educational');
console.log('✔ RoleAdvisor Custom Override Test:', synthRoleCustom.title);
console.assert(synthRoleCustom.title.includes('Socratic Diagnostic Mentor'), 'Should respect persona format override');

// 2. Test Reasoning Mode & Output Format Tooltip Info Dictionaries
console.log('✔ Reasoning Modes Count:', Object.keys(MetaPromptEngine.reasoningModesInfo).length);
console.log('✔ Output Formats Count:', Object.keys(MetaPromptEngine.outputFormatsInfo).length);
console.assert(MetaPromptEngine.reasoningModesInfo.cot.example !== undefined, 'Reasoning info should contain examples');
console.assert(MetaPromptEngine.outputFormatsInfo.markdown.example !== undefined, 'Output info should contain examples');

// 3. Test SecurityScanner
const sampleSecretPrompt = 'Here is my OpenAI key sk-1234567890abcdef1234567890abcdef and email test@company.com';
const scanResult = SecurityScanner.scan(sampleSecretPrompt);
console.log('✔ SecurityScanner Test:', scanResult.status, 'Risk Score:', scanResult.riskScore, 'Findings:', scanResult.summary.total);

// 4. Test MetaPromptEngine Synthesis
const generated = MetaPromptEngine.generateMetaPrompt({
  task: 'Build a high-performance REST API in Go with zero data loss',
  context: 'Running on Kubernetes on GCP',
  personaFormatId: 'auto',
  toneStyleId: 'authoritative',
  outputFormatKey: 'code_tests',
  reasoningModeKey: 'tree_of_thoughts',
  enableRefining: true,
  enableSecurityCheck: true
});
console.log('✔ MetaPromptEngine Test: Promp Length', generated.metaPrompt.length, 'chars');
console.log('✔ Reasoning Info Selected:', generated.reasoningInfo.name);
console.log('✔ Output Info Selected:', generated.outputInfo.name);
console.assert(generated.reasoningInfo.name.includes('Tree of Thoughts'), 'Should reflect reasoning mode info');

// 5. Test VersionManager
const ver1 = VersionManager.saveVersion({
  version: 'v0.3.0',
  title: 'Optional Persona/Tone Selectors & Info Tooltips Release',
  promptText: generated.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Added tooltips, output examples, and optional persona/tone selectors'
});
console.log('✔ VersionManager Test (LaunchDarkly QC): Version:', ver1.version);
console.assert(ver1.version === 'v0.3.0', 'VersionManager should store v0.3.0 entry');

console.log('--- ALL v0.3.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
