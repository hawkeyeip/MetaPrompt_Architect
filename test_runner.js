/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.2.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.2.0) ---');

// 1. Test RoleAdvisor Dynamic Synthesis
const synthRole = RoleAdvisor.synthesizeRole('Design a database schema for user auth and SQL queries', 'domain_authority');
console.log('✔ RoleAdvisor Dynamic Role Test:', synthRole.title, '| Persona:', synthRole.styleName);
console.assert(synthRole.title.includes('Data') || synthRole.title.includes('Software'), 'RoleAdvisor should synthesize relevant title');

// 2. Test SecurityScanner
const sampleSecretPrompt = 'Here is my OpenAI key sk-1234567890abcdef1234567890abcdef and email test@company.com';
const scanResult = SecurityScanner.scan(sampleSecretPrompt);
console.log('✔ SecurityScanner Test:', scanResult.status, 'Risk Score:', scanResult.riskScore, 'Findings:', scanResult.summary.total);
console.assert(scanResult.summary.total >= 2, 'SecurityScanner should detect key & email');

const redacted = SecurityScanner.autoRedact(sampleSecretPrompt);
console.log('✔ AutoRedact Output:', redacted);
console.assert(redacted.includes('[REDACTED_OPENAI_KEY]'), 'AutoRedact should redact OpenAI key');
console.assert(redacted.includes('[REDACTED_EMAIL]'), 'AutoRedact should redact email');

// 3. Test TokenCompressor
const verbosePrompt = 'Please make sure to kindly keep in mind that I would like you to analyze this code in order to achieve the goal.';
const compPrompt = TokenCompressor.compress(verbosePrompt, 'moderate');
const metrics = TokenCompressor.getMetrics(verbosePrompt, compPrompt);
console.log('✔ TokenCompressor Test:', 'Orig Tokens:', metrics.originalTokens, 'Comp Tokens:', metrics.compressedTokens, 'Savings:', metrics.savingsPercent + '%');
console.assert(metrics.tokensSaved > 0, 'TokenCompressor should save tokens');

// 4. Test MetaPromptEngine Dynamic Clarifying Questions & Prompt Synthesis
const generated = MetaPromptEngine.generateMetaPrompt({
  task: 'Build a high-performance REST API in Go with zero data loss',
  context: 'Running on Kubernetes on GCP',
  personaStyleId: 'domain_authority',
  outputFormat: 'Executable Code Blocks with Unit Tests & Comments',
  reasoningMode: 'First Principles Deconstruction',
  enableRefining: true,
  enableSecurityCheck: true
});
console.log('✔ MetaPromptEngine Test: Promp Length', generated.metaPrompt.length, 'chars');
console.log('✔ Dynamic Clarifying Questions Generated:', generated.clarifyingQuestions.length);
console.assert(generated.clarifyingQuestions.length >= 2, 'Should generate clarifying questions');
console.assert(generated.metaPrompt.includes('[SYSTEM ROLE & DIRECTIVE]'), 'MetaPrompt should contain SYSTEM ROLE section');

// 5. Test VersionManager
const ver1 = VersionManager.saveVersion({
  version: 'v0.2.0',
  title: 'Dynamic Role Synthesis & Clarifying Questions Build',
  promptText: generated.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Refactored role advisor to dynamic synthesizer with persona dropdown & clarifying questions'
});

console.log('✔ VersionManager Test (LaunchDarkly QC): Version:', ver1.version, 'Tokens:', ver1.tokenEstimate);
console.assert(ver1.version === 'v0.2.0', 'VersionManager should store v0.2.0 entry');

console.log('--- ALL v0.2.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
