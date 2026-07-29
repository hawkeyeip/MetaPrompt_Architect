/**
 * MetaPromptEngine Module
 * Master meta-prompt architect engine, task refiner, and instruction breakdown advisor.
 */

const MetaPromptEngine = {
  /**
   * Generates a fully refined meta-prompt combining role, context, refined task, breakdown & constraints
   */
  generateMetaPrompt({
    role,
    task,
    context = '',
    outputFormat = 'Markdown with structured headers',
    reasoningMode = 'Step-by-Step Chain of Thought',
    enableRefining = true,
    enableSecurityCheck = true,
    attachments = []
  }) {
    // Step 1: Refine task if enabled
    const finalTask = enableRefining ? this.refineTaskInstructions(task) : task;

    // Step 2: Build instruction breakdown
    const breakdown = this.getInstructionBreakdown(task);

    // Step 3: Build multimodal attachment context if present
    let multimodalContext = '';
    if (attachments.length > 0) {
      multimodalContext = `\n\n[MULTIMODAL ATTACHMENTS & VISUAL CONTEXT]\nThe user has provided ${attachments.length} media asset(s). Refer to visual elements, document text, and media descriptions attached to this conversation context.`;
    }

    // Step 4: Assemble master prompt structure
    const metaPrompt = `[SYSTEM ROLE]
${role.systemPrompt || role}

[CONTEXT & BACKGROUND]
${context.trim() || 'No explicit context provided. Operate with standard domain expertise.'}${multimodalContext}

[CORE OBJECTIVE]
${finalTask}

[INSTRUCTION BREAKDOWN & GUIDELINES]
${breakdown.map(step => `• ${step}`).join('\n')}

[REASONING METHODOLOGY]
${reasoningMode}: Break down complex decisions explicitly before writing the final output. Highlight assumptions, potential edge cases, and verification steps.

[OUTPUT SPECIFICATIONS]
- Required Format: ${outputFormat}
- Quality Standard: Production-ready, authoritative, token-efficient, and directly actionable.
- Constraint: Do not include fluff, conversational filler, or self-referential disclaimers.

${enableSecurityCheck ? '[SECURITY & PRIVACY MANDATE]\nEnsure all credentials, API keys, PII, and internal server paths are strictly redacted or masked before returning results.' : ''}`;

    return {
      metaPrompt: metaPrompt.trim(),
      refinedTask: finalTask,
      breakdown
    };
  },

  /**
   * Task Refine Feature: Expounds upon initial user prompt instructions
   */
  refineTaskInstructions(taskText) {
    if (!taskText || taskText.trim().length === 0) {
      return 'Perform the requested analysis with comprehensive accuracy and clear documentation.';
    }

    let refined = taskText.trim();

    // Check if task lacks edge case handling and add clarification guidelines
    if (!/edge case|error|exception|failure/i.test(refined)) {
      refined += '\n- Explicitly address edge cases, potential error states, and fallback behavior.';
    }

    // Check if task lacks output formatting parameters
    if (!/format|template|json|markdown|structure/i.test(refined)) {
      refined += '\n- Structure the response logically with key takeaways, actionable steps, and concise explanations.';
    }

    // Check if task involves technical code or logic
    if (/code|script|function|build|create|sql|api/i.test(refined)) {
      if (!/test|verify|validation/i.test(refined)) {
        refined += '\n- Include code validation, sanity tests, or execution steps to verify correctness.';
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
      breakdown.push('Step 2: Design architecture/schema baseline before implementing code.');
      breakdown.push('Step 3: Implement clean, modular code with clear error handling.');
      breakdown.push('Step 4: Provide verification tests and execution examples.');
    } else if (textLower.includes('write') || textLower.includes('article') || textLower.includes('copy')) {
      breakdown.push('Step 2: Define audience persona and key value propositions.');
      breakdown.push('Step 3: Draft scannable content using strong headlines and bullet points.');
      breakdown.push('Step 4: Refine tone and polish for conciseness and engagement.');
    } else {
      breakdown.push('Step 2: Analyze key variables, dependencies, and assumptions.');
      breakdown.push('Step 3: Formulate a structured step-by-step resolution strategy.');
      breakdown.push('Step 4: Validate outcome against acceptance criteria.');
    }

    return breakdown;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaPromptEngine;
}
