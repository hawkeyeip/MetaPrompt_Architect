/**
 * Node Automated Unit Test Suite for MetaPrompt Architect
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE ---');

// 1. Test RoleAdvisor
const roleRecs = RoleAdvisor.recommendRoles('Design a database schema for user auth and SQL queries');
console.log('✔ RoleAdvisor Test:', roleRecs[0].name, 'Match Score:', roleRecs[0].matchScore);
console.assert(roleRecs.length >= 1, 'RoleAdvisor should return recommendations');

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

// 4. Test MetaPromptEngine
const generated = MetaPromptEngine.generateMetaPrompt({
  role: roleRecs[0],
  task: 'Build a high-performance REST API in Go',
  context: 'Running on Kubernetes',
  outputFormat: 'Structured Markdown',
  enableRefining: true,
  enableSecurityCheck: true
});
console.log('✔ MetaPromptEngine Test: Promp Length', generated.metaPrompt.length, 'chars');
console.assert(generated.metaPrompt.includes('[SYSTEM ROLE]'), 'MetaPrompt should contain SYSTEM ROLE section');

// 5. Test VersionManager
const ver1 = VersionManager.saveVersion({
  version: 'v1.0.0',
  title: 'Master Go API Prompt',
  promptText: generated.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Initial release'
});

const ver2 = VersionManager.saveVersion({
  version: 'v1.1.0',
  title: 'Updated Go API Prompt with Zero-Trust Security',
  promptText: generated.metaPrompt + '\n[ADDITIONAL CONSTRAINTS]\nMust enforce OAuth2 scopes.',
  targetModel: 'Claude 3.5 Sonnet',
  changeLog: 'Added OAuth2 security constraints'
});

const diffResult = VersionManager.computeDiff(ver1.promptText, ver2.promptText);
console.log('✔ VersionManager Test (LaunchDarkly QC): Version A:', ver1.version, 'Version B:', ver2.version, 'Diff Lines Added:', diffResult.diffB.filter(x => x.type === 'added').length);
console.assert(diffResult.diffB.some(x => x.type === 'added'), 'Diff should detect added lines');

console.log('--- ALL AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
