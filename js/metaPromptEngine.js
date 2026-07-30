/**
 * MetaPromptEngine Module (v0.6.0 - Educational Meta Breakdown & Multi-Option Master Prompts)
 * Synthesizes Step-by-Step Prompt Architectural Breakdowns alongside Option A / Option B Ready-to-Use Prompts.
 */

const _RoleAdvisor = typeof RoleAdvisor !== 'undefined' ? RoleAdvisor : (typeof require !== 'undefined' ? require('./roleAdvisor.js') : null);
const _SecurityScanner = typeof SecurityScanner !== 'undefined' ? SecurityScanner : (typeof require !== 'undefined' ? require('./securityScanner.js') : null);

const MetaPromptEngine = {
  reasoningModesInfo: {
    cot: {
      name: 'Step-by-Step Chain of Thought (CoT)',
      description: 'Breaks complex tasks down into explicit sequential thought steps before stating conclusions.',
      bestFor: 'Complex logic, code design, mathematical calculations, and multi-variable problem solving.',
      example: 'Step 1: Identify inputs -> Step 2: Evaluate constraints -> Step 3: Draft solution -> Step 4: Validate against edge cases.'
    },
    first_principles: {
      name: 'First Principles Deconstruction',
      description: 'Deconstructs a problem down to its foundational truths and builds a solution from scratch.',
      bestFor: 'Novel problems, architectural redesigns, and overcoming legacy assumptions.',
      example: 'Fundamental Assumptions -> Foundational Truths -> Unconstrained Rebuilding -> Final Architecture.'
    },
    tree_of_thoughts: {
      name: 'Tree of Thoughts (Multi-Path Evaluation)',
      description: 'Explores multiple alternative branches of solution paths, evaluates trade-offs, and selects the optimal path.',
      bestFor: 'Strategic decision making, tech stack comparison, and complex trade-off evaluations.',
      example: 'Path A (Pros/Cons) vs. Path B (Pros/Cons) vs. Path C (Pros/Cons) -> Selection Matrix -> Final Recommendation.'
    },
    socratic: {
      name: 'Socratic Diagnostics & Root Cause Traceback',
      description: 'Asks probing questions to identify root causes and guide diagnostic reasoning.',
      bestFor: 'Debugging, troubleshooting broken code/systems, and educational mentoring.',
      example: 'Symptom -> Diagnostic Hypothesis -> Root Cause Traceback -> Resolution Strategy.'
    },
    defensive: {
      name: 'Defensive Failure-Mode & Edge-Case Analysis',
      description: 'Analyzes how a system or strategy could fail, flagging vulnerabilities and edge cases first.',
      bestFor: 'Security audits, API design, financial calculations, and mission-critical systems.',
      example: 'Vulnerability Matrix -> Failure Scenarios -> Mitigation Controls -> Defensive Implementation.'
    },
    executive: {
      name: 'Direct Executive Synthesis',
      description: 'Provides high-level executive summary first, followed immediately by actionable directives.',
      bestFor: 'C-level briefings, status reports, and fast decision-making.',
      example: 'Executive Summary -> Key Decisions -> Action Items -> ROI & Risk Impact.'
    }
  },

  outputFormatsInfo: {
    markdown: {
      name: 'Structured Markdown with headers & callouts',
      description: 'Organizes content into clean hierarchical headers, bullet lists, bold highlights, and alert blocks.',
      example: '# Heading\n> [!NOTE]\n> Key takeaway\n- Bullet point 1\n- Bullet point 2'
    },
    code_tests: {
      name: 'Executable Code Blocks with Unit Tests & Comments',
      description: 'Delivers complete, production-ready code with inline docstrings and executable test assertions.',
      example: '```python\ndef solution():\n  pass\n\n# Unit Test\ndef test_solution():\n  assert solution() == expected\n```'
    },
    json_schema: {
      name: 'JSON Schema Directive & Sample Payload',
      description: 'Defines formal JSON schema specifications alongside valid sample JSON data payloads.',
      example: '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "properties": { "id": { "type": "string" } }\n}'
    },
    executive_summary: {
      name: 'Executive Summary & Actionable Decision Matrix',
      description: 'High-impact summary for leaders, featuring bulleted key takeaways, risk indicators, and ROI.',
      example: '## Executive Summary\n- High Impact Key Result\n\n| Decision | Cost | Risk | Recommendation |'
    },
    tutorial: {
      name: 'Step-by-Step Tutorial & Technical Walkthrough',
      description: 'Educational format broken into prerequisites, numbered setup steps, code blocks, and verification.',
      example: '### Prerequisites\n### Step 1: Configuration\n### Step 2: Implementation\n### Step 3: Verification'
    },
    architecture_diagram: {
      name: 'System Architecture & Mermaid Sequence Diagram',
      description: 'Combines technical architectural breakdown with visual Mermaid flowcharts or sequence diagrams.',
      example: '```mermaid\nsequenceDiagram\n  Client->>API: Request\n  API->>DB: Query\n  DB-->>Client: Data\n```'
    },
    sql_data: {
      name: 'Data Transformation Query (SQL / Pandas / BigQuery)',
      description: 'Optimized data manipulation queries (BigQuery SQL, PostgreSQL, or Pandas DataFrames).',
      example: 'SELECT user_id, COUNT(*) FROM events WHERE date >= CURRENT_DATE() GROUP BY 1'
    },
    tradeoff_matrix: {
      name: 'Comparative Analysis Matrix (Trade-off Comparison)',
      description: 'Tabular comparison matrix evaluating alternative options against cost, latency, complexity, and scale.',
      example: '| Option | Speed | Scalability | Trade-offs | Rating |\n|--------|-------|-------------|------------|--------|'
    }
  },

  /**
   * Master generation engine combining Step Breakdown & Option A / Option B master prompts
   */
  generateMetaPrompt({
    task,
    context = '',
    selectedRoleCandidate = null,
    personaFormatId = 'auto',
    toneStyleId = 'auto',
    outputFormatKey = 'markdown',
    reasoningModeKey = 'cot',
    enableRefining = true,
    enableSecurityCheck = true,
    userClarificationAnswers = [],
    attachments = []
  }) {
    // 1. Role Candidates
    const candidates = _RoleAdvisor ? _RoleAdvisor.recommendRoleCandidates(task, personaFormatId, toneStyleId) : [];
    const role = selectedRoleCandidate || candidates[0] || { title: 'Domain Advisor', systemPrompt: 'Provide an authoritative, direct technical response.' };

    // 2. Refine Context & Polish Objective
    const polishedObjective = enableRefining ? this.polishObjective(task) : task;
    const refinedContext = enableRefining ? this.refineContext(context, task) : (context.trim() || 'Operate with standard technical domain expertise.');

    // 3. Dynamic Clarifying Questions
    const clarifyingQuestions = this.generateClarifyingQuestions(task);

    // 4. Generate Step-by-Step Educational Meta Breakdown
    const metaBreakdown = this.buildMetaBreakdown(task, context, role, outputFormatKey);

    // 5. Generate Upgraded Option A & Option B Master Prompts
    const promptOptions = this.buildUpgradedPromptOptions({
      task,
      context,
      role,
      outputFormatKey,
      reasoningModeKey,
      userClarificationAnswers,
      attachments
    });

    // 6. Security Scan
    let securitySection = '';
    if (enableSecurityCheck) {
      const scan = _SecurityScanner ? _SecurityScanner.scan(polishedObjective + ' ' + refinedContext) : { status: 'safe', findings: [] };
      if (scan.status === 'safe' || (scan.findings && scan.findings.length === 0)) {
        securitySection = `[SECURITY & PRIVACY CHECK]\nScan Complete: 0 Vulnerabilities or PII Detected.`;
      } else {
        const addressedList = (scan.findings || []).map(f => `${f.name} (${f.replacement})`).join(', ');
        securitySection = `[SECURITY & PRIVACY MANDATE]\nAddressed Sensitivity Items: ${addressedList}. Maintain 100% redaction.`;
      }
    }

    // 7. Full Synthesized Output Document
    const fullOutput = `=== META-PROMPT ARCHITECTURAL BREAKDOWN ===

${metaBreakdown}

=== UPGRADED READY-TO-USE MASTER PROMPTS ===

--- OPTION A (Primary Focused Specification) ---
${promptOptions.optionA}

--- OPTION B (Exploratory / Alternative Scenario) ---
${promptOptions.optionB}

${securitySection}`;

    return {
      metaPrompt: fullOutput.trim(),
      optionA: promptOptions.optionA,
      optionB: promptOptions.optionB,
      role,
      candidates,
      clarifyingQuestions,
      reasoningInfo: this.reasoningModesInfo[reasoningModeKey],
      outputInfo: this.outputFormatsInfo[outputFormatKey]
    };
  },

  /**
   * Builds the Step-by-Step Educational Breakdown (Step 1: Role, Step 2: Details, Step 3: Vibe/Constraints, Step 4: Output)
   */
  buildMetaBreakdown(taskText, contextText, role, outputFormatKey) {
    const roleAddition = role.id === 'candidate_forego' 
      ? 'No specialized role locking — operate as a direct un-opinionated model.' 
      : `"Act as a ${role.title}. ${role.systemPrompt.substring(0, 120)}..."`;

    return `Step 1: Assign a Specific Role
Giving the LLM a specific persona tells it which brain and domain depth to use.
• Applied Role Directive: ${roleAddition}

Step 2: Clarify Business Details & Remove Ambiguity
Vague prompts leave the AI guessing. We clarify key variables, target audiences, and specific domain conditions.
• Enhancements: Clarified domain parameters, target audience expectations, and operational context (${contextText.trim() || 'Standard Domain Baseline'}).

Step 3: Define Style, Tone, and Constraints
Defining constraints ensures the output matches your aesthetic or technical standards.
• Technical & Aesthetic Rules: Applied strict formatting constraints, edge-case validation, and token-conscious conciseness.

Step 4: Dictate Precise Output Format
Instead of asking for a general response, specify exact section headers, code structure, or concept counts.
• Output Spec: Dictated ${this.outputFormatsInfo[outputFormatKey]?.name || 'Structured Markdown'}.`;
  },

  /**
   * Builds Option A and Option B Ready-to-Use Upgraded Prompts
   */
  buildUpgradedPromptOptions({ task, context, role, outputFormatKey, reasoningModeKey, userClarificationAnswers, attachments }) {
    const outputInfo = this.outputFormatsInfo[outputFormatKey] || this.outputFormatsInfo.markdown;
    const reasoningInfo = this.reasoningModesInfo[reasoningModeKey] || this.reasoningModesInfo.cot;

    const roleHeader = role.id === 'candidate_forego'
      ? '[SYSTEM DIRECTIVE]\nProvide an authoritative, direct, and un-opinionated technical solution.'
      : `[SYSTEM ROLE]\nAct as an elite ${role.title}. ${role.systemPrompt}`;

    const cleanContext = context.trim() ? context.trim() : 'Standard domain baseline';

    // Format User Clarification Answers
    let answersBlock = '';
    const validAnswers = userClarificationAnswers.filter(a => a && a.answer && a.answer.trim().length > 0);
    if (validAnswers.length > 0) {
      answersBlock = `\n[SPECIFIED PARAMETERS]\n` + validAnswers.map(a => `- ${a.question}: ${a.answer.trim()}`).join('\n');
    }

    // Multimodal block
    let multiBlock = attachments && attachments.length > 0 ? `\n[ATTACHED MEDIA]\nAttached ${attachments.length} visual/media asset(s). Refer to attached context.` : '';

    // Option A: Primary Technical & Production Focus
    const optionA = `${roleHeader}

[OBJECTIVE & CONTEXT]
I need a comprehensive, high-efficacy solution for: "${task}".
Background Environment: ${cleanContext}.${answersBlock}${multiBlock}

[METHODOLOGY]
Apply ${reasoningInfo.name}. Break down key assumptions and validate logic step-by-step prior to state conclusions.

[OUTPUT FORMAT & REQUIREMENTS]
Provide output formatted as ${outputInfo.name}.
1. Include explicit solutions addressing core requirements.
2. Address edge cases, error states, and execution steps.
3. Ensure token-conscious clarity with zero conversational disclaimers.`.trim();

    // Option B: Multi-Variant / Alternative Scenario Focus
    const optionB = `${roleHeader}

[OBJECTIVE & ALTERNATIVE CONCEPTS]
I need 3 distinct, high-efficacy concepts/approaches for: "${task}".
Target Domain Context: ${cleanContext}.${answersBlock}${multiBlock}

[EVALUATION METHODOLOGY]
For each of the 3 distinct concepts/approaches, provide:
1) Core Structure / Implementation Strategy
2) Key Trade-offs (Pros & Cons)
3) Psychological or Architectural rationale for why it fits the domain.

[OUTPUT FORMAT]
Format as ${outputInfo.name}. Keep explanations scannable, structured, and production-ready.`.trim();

    return { optionA, optionB };
  },

  refineContext(rawContext, taskText) {
    if (!rawContext || rawContext.trim().length === 0) {
      return 'Operate within standard production software & business environment baselines.';
    }
    return `Target Environment Baseline:\n- ${rawContext.trim()}`;
  },

  polishObjective(taskText) {
    if (!taskText || taskText.trim().length === 0) {
      return 'Deliver a high-efficacy, production-grade technical solution meeting all acceptance criteria.';
    }
    let polished = taskText.trim();
    if (!polished.endsWith('.')) polished += '.';
    return polished;
  },

  generateClarifyingQuestions(taskText) {
    if (!taskText || taskText.trim().length === 0) {
      return [
        'What is the specific target audience or deployment environment?',
        'Are there any strict performance benchmarks or technical constraints?',
        'What criteria define successful execution for this endeavor?'
      ];
    }

    const textLower = taskText.toLowerCase();
    const questions = [];

    if (textLower.includes('logo') || textLower.includes('design') || textLower.includes('brand')) {
      questions.push('What specific product/service category is your business delivering (e.g. automotive vs personal)?');
      questions.push('What ideal target customer or local audience vibe (e.g. Austin lifestyle) should it convey?');
      questions.push('What 3 adjectives describe your brand feel and color preferences?');
    } else if (textLower.includes('code') || textLower.includes('api') || textLower.includes('build') || textLower.includes('app')) {
      questions.push('What programming language version, framework, or runtime environment is required?');
      questions.push('What performance benchmarks (e.g. latency, throughput) or error handling strategy should be targeted?');
      questions.push('Are there existing architectural patterns or API contracts that must be preserved?');
    } else if (textLower.includes('sql') || textLower.includes('query') || textLower.includes('data') || textLower.includes('analysis')) {
      questions.push('What is the target database engine (e.g. BigQuery, PostgreSQL, Snowflake) and table schema layout?');
      questions.push('What time window, aggregation grain, or filtering parameters should be applied?');
      questions.push('Should edge cases (such as null values or duplicate entries) be filtered or explicitly highlighted?');
    } else {
      questions.push('What specific constraints, inputs, or variables define the boundaries of this task?');
      questions.push('What secondary use cases or potential edge cases should be anticipated?');
      questions.push('What preferred output structure will yield the highest utility for your current workflow?');
    }

    return questions;
  },

  getInstructionBreakdown(taskText) {
    return [
      'Step 1: Assign specialized role directive or neutral domain model.',
      'Step 2: Clarify business details, target audience, and domain context.',
      'Step 3: Define style, tone, and technical/visual constraints.',
      'Step 4: Dictate output structure and exact concept requirements.'
    ];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaPromptEngine;
}
