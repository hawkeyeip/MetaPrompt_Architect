/**
 * MetaPromptEngine Module (v0.3.0)
 * Includes detailed descriptions & output examples for Reasoning Modes & Output Formats, tooltips, and prompt synthesis.
 */

const _RoleAdvisor = typeof RoleAdvisor !== 'undefined' ? RoleAdvisor : (typeof require !== 'undefined' ? require('./roleAdvisor.js') : null);

const MetaPromptEngine = {
  // Dictionary of Reasoning Modes with explanations & output format examples
  reasoningModesInfo: {
    cot: {
      name: 'Step-by-Step Chain of Thought (CoT)',
      description: 'Breaks complex tasks down into explicit sequential thought steps before stating the conclusion.',
      bestFor: 'Complex logic, code design, mathematical calculations, and multi-variable problem solving.',
      example: 'Step 1: Identify inputs -> Step 2: Evaluate constraints -> Step 3: Draft solution -> Step 4: Validate against edge cases.'
    },
    first_principles: {
      name: 'First Principles Deconstruction',
      description: 'Deconstructs a problem down to its most basic foundational truths and builds a solution from scratch.',
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

  // Dictionary of Output Formats with explanations & output examples
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
   * Synthesizes master meta-prompt
   */
  generateMetaPrompt({
    task,
    context = '',
    personaFormatId = 'auto',
    toneStyleId = 'auto',
    outputFormatKey = 'markdown',
    reasoningModeKey = 'cot',
    enableRefining = true,
    enableSecurityCheck = true,
    attachments = []
  }) {
    // Step 1: Synthesize dynamic role with optional format & tone overrides
    const role = _RoleAdvisor ? _RoleAdvisor.synthesizeRole(task, personaFormatId, toneStyleId) : { title: 'Domain Advisor', systemPrompt: 'You are an elite Domain Advisor.', rationale: 'Default' };

    // Step 2: Refine task if enabled
    const finalTask = enableRefining ? this.refineTaskInstructions(task) : task;

    // Step 3: Generate dynamic clarifying questions
    const clarifyingQuestions = this.generateClarifyingQuestions(task);

    // Step 4: Build instruction breakdown
    const breakdown = this.getInstructionBreakdown(task);

    // Step 5: Lookup reasoning mode & output format info
    const reasoningInfo = this.reasoningModesInfo[reasoningModeKey] || this.reasoningModesInfo.cot;
    const outputInfo = this.outputFormatsInfo[outputFormatKey] || this.outputFormatsInfo.markdown;

    // Step 6: Multimodal context
    let multimodalContext = '';
    if (attachments && attachments.length > 0) {
      multimodalContext = `\n\n[MULTIMODAL ATTACHMENTS & VISUAL CONTEXT]\nThe user has attached ${attachments.length} media asset(s). Refer to visual layouts, OCR text, and media context provided in this prompt stream.`;
    }

    // Step 7: Assemble master prompt structure
    const metaPrompt = `[SYSTEM ROLE & DIRECTIVE]
${role.systemPrompt}

[CONTEXT & BACKGROUND]
${context.trim() || 'No explicit prior context provided. Apply top-tier domain standards.'}${multimodalContext}

[CORE OBJECTIVE]
${finalTask}

[INSTRUCTION BREAKDOWN & GUIDELINES]
${breakdown.map(step => `• ${step}`).join('\n')}

[REASONING METHODOLOGY]
Mode: ${reasoningInfo.name}
${reasoningInfo.description}

[ENDEAVOR CLARIFICATION & KEY DECISION POINTS]
To maximize utility and eliminate ambiguity, ensure the following aspects are explicitly addressed:
${clarifyingQuestions.map(q => `? ${q}`).join('\n')}

[OUTPUT SPECIFICATIONS]
- Format Requirement: ${outputInfo.name}
- Format Description: ${outputInfo.description}
- Quality Benchmark: Production-ready, authoritative, token-conscious, and directly actionable.
- Constraints: No conversational disclaimers, no generic fillers, and strict adherence to technical accuracy.

${enableSecurityCheck ? '[SECURITY & PRIVACY MANDATE]\nScan and redact any PII, credentials, API keys, or private internal network paths before returning response.' : ''}`;

    return {
      metaPrompt: metaPrompt.trim(),
      role,
      refinedTask: finalTask,
      breakdown,
      clarifyingQuestions,
      reasoningInfo,
      outputInfo
    };
  },

  generateClarifyingQuestions(taskText) {
    if (!taskText || taskText.trim().length === 0) {
      return [
        'What is the specific target audience or consumption environment for this output?',
        'Are there any technical or resource constraints that must be strictly observed?',
        'What criteria define successful execution for this endeavor?'
      ];
    }

    const textLower = taskText.toLowerCase();
    const questions = [];

    if (textLower.includes('code') || textLower.includes('api') || textLower.includes('build') || textLower.includes('app')) {
      questions.push('What specific programming language version, framework, or runtime environment is required?');
      questions.push('What error handling strategy or performance benchmarks (e.g. latency, throughput) should be targeted?');
      questions.push('Are there existing architectural patterns or API contracts that must be preserved?');
    } else if (textLower.includes('sql') || textLower.includes('query') || textLower.includes('data') || textLower.includes('analysis')) {
      questions.push('What is the target database engine (e.g. BigQuery, PostgreSQL, Snowflake) and table schema layout?');
      questions.push('What time window, aggregation grain, or filtering parameters should be applied?');
      questions.push('Should edge cases (such as null values or duplicate entries) be filtered or explicitly highlighted?');
    } else if (textLower.includes('write') || textLower.includes('article') || textLower.includes('copy') || textLower.includes('doc')) {
      questions.push('Who is the exact target reader (e.g. technical engineers, C-level executives, general public)?');
      questions.push('What primary call-to-action or core key takeaway should the reader walk away with?');
      questions.push('What length or section structure is preferred for maximum readability?');
    } else {
      questions.push('What specific constraints, inputs, or variables define the boundaries of this task?');
      questions.push('What secondary use cases or potential edge cases should be anticipated?');
      questions.push('What preferred output structure will yield the highest utility for your current workflow?');
    }

    return questions;
  },

  refineTaskInstructions(taskText) {
    if (!taskText || taskText.trim().length === 0) {
      return 'Perform the requested task with comprehensive accuracy and clear step-by-step documentation.';
    }

    let refined = taskText.trim();

    if (!/edge case|error|exception|failure/i.test(refined)) {
      refined += '\n- Explicitly address edge cases, potential error states, and fallback behavior.';
    }

    if (!/format|template|json|markdown|structure/i.test(refined)) {
      refined += '\n- Structure the response logically with key takeaways, actionable steps, and concise explanations.';
    }

    if (/code|script|function|build|create|sql|api/i.test(refined)) {
      if (!/test|verify|validation/i.test(refined)) {
        refined += '\n- Include sanity validation steps, unit test examples, or execution checks to confirm correctness.';
      }
    }

    return refined;
  },

  getInstructionBreakdown(taskText) {
    const textLower = (taskText || '').toLowerCase();
    const breakdown = [];

    breakdown.push('Step 1: Parse primary goal and identify core technical/business constraints.');

    if (textLower.includes('code') || textLower.includes('build') || textLower.includes('script')) {
      breakdown.push('Step 2: Design architecture/schema baseline before writing code.');
      breakdown.push('Step 3: Implement clean, modular code with inline documentation & robust error handling.');
      breakdown.push('Step 4: Provide verification tests, sanity checks, and sample usage.');
    } else if (textLower.includes('write') || textLower.includes('article') || textLower.includes('copy')) {
      breakdown.push('Step 2: Define reader persona and clarify value proposition hooks.');
      breakdown.push('Step 3: Draft scannable content using bold headers, bullet points, and concise phrasing.');
      breakdown.push('Step 4: Polish tone, eliminate redundancy, and ensure strong call-to-action alignment.');
    } else {
      breakdown.push('Step 2: Deconstruct key variables, dependencies, and underlying assumptions.');
      breakdown.push('Step 3: Formulate a structured step-by-step resolution strategy.');
      breakdown.push('Step 4: Validate outcome against target acceptance criteria.');
    }

    return breakdown;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaPromptEngine;
}
