const _RoleAdvisor = typeof RoleAdvisor !== 'undefined' ? RoleAdvisor : (typeof require !== 'undefined' ? require('./roleAdvisor.js') : null);

const MetaPromptEngine = {
  /**
   * Generates a fully synthesized meta-prompt with dynamic role recommendation & clarifying questions
   */
  generateMetaPrompt({
    task,
    context = '',
    personaStyleId = 'domain_authority',
    outputFormat = 'Structured Markdown with headers & callouts',
    reasoningMode = 'Step-by-Step Chain of Thought (CoT)',
    enableRefining = true,
    enableSecurityCheck = true,
    attachments = []
  }) {
    // Step 1: Synthesize dynamic role
    const role = _RoleAdvisor ? _RoleAdvisor.synthesizeRole(task, personaStyleId) : { title: 'Domain Advisor', systemPrompt: 'You are an elite Domain Advisor.', rationale: 'Default' };

    // Step 2: Refine task if enabled
    const finalTask = enableRefining ? this.refineTaskInstructions(task) : task;

    // Step 3: Generate dynamic clarifying questions for user's endeavor
    const clarifyingQuestions = this.generateClarifyingQuestions(task);

    // Step 4: Build instruction breakdown
    const breakdown = this.getInstructionBreakdown(task);

    // Step 5: Build multimodal attachment context if present
    let multimodalContext = '';
    if (attachments && attachments.length > 0) {
      multimodalContext = `\n\n[MULTIMODAL ATTACHMENTS & VISUAL CONTEXT]\nThe user has attached ${attachments.length} media asset(s). Refer to visual layouts, OCR text, and media context provided in this prompt stream.`;
    }

    // Step 6: Assemble master prompt structure
    const metaPrompt = `[SYSTEM ROLE & DIRECTIVE]
${role.systemPrompt}

[CONTEXT & BACKGROUND]
${context.trim() || 'No explicit prior context provided. Apply top-tier domain standards.'}${multimodalContext}

[CORE OBJECTIVE]
${finalTask}

[INSTRUCTION BREAKDOWN & GUIDELINES]
${breakdown.map(step => `• ${step}`).join('\n')}

[REASONING METHODOLOGY]
Mode: ${reasoningMode}
Execute using the specified reasoning mode. Evaluate assumptions, trade-offs, and failure points explicitly prior to stating final answers.

[ENDEAVOR CLARIFICATION & KEY DECISION POINTS]
To maximize utility and eliminate ambiguity, ensure the following aspects are explicitly addressed:
${clarifyingQuestions.map(q => `? ${q}`).join('\n')}

[OUTPUT SPECIFICATIONS]
- Format Requirement: ${outputFormat}
- Quality Benchmark: Production-ready, authoritative, token-conscious, and directly actionable.
- Constraints: No conversational disclaimers, no generic fillers, and strict adherence to technical accuracy.

${enableSecurityCheck ? '[SECURITY & PRIVACY MANDATE]\nScan and redact any PII, credentials, API keys, or private internal network paths before returning response.' : ''}`;

    return {
      metaPrompt: metaPrompt.trim(),
      role,
      refinedTask: finalTask,
      breakdown,
      clarifyingQuestions
    };
  },

  /**
   * Generates 2-3 dynamic clarifying questions to sharpen the prompt's clarity & purpose
   */
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

  /**
   * Task Refine Feature: Expounds upon initial user prompt instructions
   */
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

  /**
   * Instruction Breakdown & Recommendation Engine
   */
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
