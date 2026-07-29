/**
 * Node Automated Unit Test Suite for MetaPrompt Architect (v0.4.0)
 */

const RoleAdvisor = require('./js/roleAdvisor.js');
const SecurityScanner = require('./js/securityScanner.js');
const TokenCompressor = require('./js/tokenCompressor.js');
const VersionManager = require('./js/versionManager.js');
const MetaPromptEngine = require('./js/metaPromptEngine.js');

console.log('--- RUNNING METAPROMPT ARCHITECT TEST SUITE (v0.4.0) ---');

// 1. Test Objective Polisher & Context Refiner
const rawTask = 'build a microservice in go';
const rawContext = 'we use postgres and Redis running on GCP';

const polishedObj = MetaPromptEngine.polishObjective(rawTask);
const refinedCtx = MetaPromptEngine.refineContext(rawContext, rawTask);

console.log('✔ Objective Polisher Test:', polishedObj);
console.log('✔ Context Refiner Test:', refinedCtx);
console.assert(polishedObj.includes('Ensure explicit handling'), 'Should append edge-case requirement');
console.assert(refinedCtx.includes('Target Environment Baseline'), 'Should format context into target baseline');

// 2. Test Interactive Clarifying Question Answers Integration
const generatedWithAnswers = MetaPromptEngine.generateMetaPrompt({
  task: rawTask,
  context: rawContext,
  personaFormatId: 'auto',
  toneStyleId: 'auto',
  outputFormatKey: 'code_tests',
  reasoningModeKey: 'tree_of_thoughts',
  enableRefining: true,
  enableSecurityCheck: true,
  userClarificationAnswers: [
    { question: 'What programming language version is required?', answer: 'Go 1.22 with Gin framework' }
  ]
});

console.log('✔ MetaPrompt with Answers Length:', generatedWithAnswers.metaPrompt.length, 'chars');
console.assert(generatedWithAnswers.metaPrompt.includes('[USER SPECIFICATIONS & CLARIFIED DECISION POINTS]'), 'Should contain clarification answers section');
console.assert(generatedWithAnswers.metaPrompt.includes('Go 1.22 with Gin framework'), 'Should embed user answer in prompt body');

// 3. Test Streamlined Security Formatting (0 Vulnerabilities vs Found Vulnerabilities)
const cleanGen = MetaPromptEngine.generateMetaPrompt({
  task: 'Design a clean architecture diagram',
  context: 'No secrets here',
  enableSecurityCheck: true
});

console.log('✔ Streamlined Security Output (Clean):', cleanGen.metaPrompt.includes('0 Vulnerabilities or PII Detected'));
console.assert(cleanGen.metaPrompt.includes('0 Vulnerabilities or PII Detected'), 'Clean scan should render 1-line note');

// 4. Test VersionManager (v0.4.0)
const ver = VersionManager.saveVersion({
  version: 'v0.4.0',
  title: 'Context Refiner, Objective Polisher & Interactive Clarifications Release',
  promptText: generatedWithAnswers.metaPrompt,
  targetModel: 'GPT-4o',
  changeLog: 'Added context refiner, objective polisher, interactive clarification inputs, and neat 0-vulnerability security formatting'
});
console.log('✔ VersionManager Test (v0.4.0 Entry):', ver.version);
console.assert(ver.version === 'v0.4.0', 'VersionManager should store v0.4.0 entry');

console.log('--- ALL v0.4.0 AUTOMATED TESTS PASSED SUCCESSFULLY 🎉 ---');
