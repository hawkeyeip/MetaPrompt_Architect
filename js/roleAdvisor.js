/**
 * RoleAdvisor Module (v0.3.0 - Flexible Persona & Tone Synthesizer)
 * Synthesizes AI roles with optional persona format & tone/style overrides.
 */

const RoleAdvisor = {
  // Built-in Persona Formats
  personaFormats: [
    { id: 'auto', name: '-- Auto-Synthesize from Prompt Context (Recommended) --', description: 'Engine dynamically extracts context and formulates optimal persona.' },
    { id: 'senior_specialist', name: 'Domain Senior Specialist', description: 'Technical rigor, production standards, and zero fluff.' },
    { id: 'socratic_mentor', name: 'Socratic Diagnostic Mentor', description: 'Step-by-step guidance, probing root cause analysis.' },
    { id: 'executive_advisor', name: 'C-Suite Executive Advisor', description: 'Strategic vision, ROI, risk mitigation, business outcome focus.' },
    { id: 'direct_minimalist', name: 'Direct-Response Minimalist', description: 'Action-first, concise bullet points, token efficient.' },
    { id: 'code_auditor', name: 'Peer Code Reviewer & Auditor', description: 'Defensive coding, OWASP vulnerability prevention, edge cases.' },
    { id: 'creative_partner', name: 'Creative Ideation Partner', description: 'Multi-perspective frameworks, innovative possibilities.' },
    { id: 'empirical_researcher', name: 'Empirical Data Researcher', description: 'Quantitative validity, methodology breakdown, empirical logic.' }
  ],

  // Built-in Tone & Style options
  toneStyles: [
    { id: 'auto', name: '-- Auto-Detect Tone from Context (Recommended) --', directive: '' },
    { id: 'authoritative', name: 'Authoritative & Highly Technical', directive: 'Deliver authoritative, highly technical solutions with strict adherence to production standards.' },
    { id: 'educational', name: 'Encouraging & Educational', directive: 'Explain concepts step-by-step with encouraging guidance and clear diagnostic checkpoints.' },
    { id: 'strategic', name: 'Strategic & Business-Oriented', directive: 'Frame insights around strategic impact, key trade-offs, risk assessment, and actionable takeaways.' },
    { id: 'concise', name: 'Direct, Bulleted & Concise', directive: 'Cut all conversational preamble and present conclusions using concise bullet points.' },
    { id: 'defensive', name: 'Rigorous & Zero-Trust Defensive', directive: 'Scrutinize logic for vulnerability vectors, performance bottlenecks, and edge case failure modes.' },
    { id: 'exploratory', name: 'Exploratory & Multi-Perspective', directive: 'Offer creative, multi-perspective approaches, highlighting non-obvious possibilities and frameworks.' }
  ],

  /**
   * Synthesizes role directive with optional persona & tone overrides
   */
  synthesizeRole(promptText, formatId = 'auto', toneId = 'auto') {
    const domainContext = this.extractDomainKeywords(promptText);

    // Determine Persona Title
    let title = domainContext.title;
    if (formatId !== 'auto') {
      const selectedFormat = this.personaFormats.find(f => f.id === formatId);
      if (selectedFormat) {
        title = `${selectedFormat.name} (${domainContext.category})`;
      }
    }

    // Determine Tone Directive
    let toneDirective = domainContext.defaultTone;
    if (toneId !== 'auto') {
      const selectedTone = this.toneStyles.find(t => t.id === toneId);
      if (selectedTone && selectedTone.directive) {
        toneDirective = selectedTone.directive;
      }
    }

    const systemPrompt = `You are an elite ${title}. ${toneDirective} Your objective is to address the prompt with maximum precision, contextual domain expertise, and actionable execution.`;

    return {
      title,
      systemPrompt,
      rationale: `Synthesized ${title} role with tone directive: "${toneDirective}".`
    };
  },

  /**
   * Domain keyword extraction
   */
  extractDomainKeywords(text) {
    if (!text || text.trim().length === 0) {
      return { title: 'Domain Lead & Solution Architect', category: 'General', defaultTone: 'Deliver authoritative technical solutions.' };
    }

    const t = text.toLowerCase();
    if (t.includes('code') || t.includes('api') || t.includes('backend') || t.includes('refactor') || t.includes('bug') || t.includes('system')) {
      return { title: 'Principal Software & Systems Architect', category: 'Software Architecture', defaultTone: 'Deliver authoritative, production-ready software solutions with strict technical rigor.' };
    }
    if (t.includes('sql') || t.includes('query') || t.includes('data') || t.includes('pandas') || t.includes('bigquery') || t.includes('analytic')) {
      return { title: 'Principal Data Engineer & Statistician', category: 'Data Science', defaultTone: 'Ensure statistical validity, quantitative precision, and optimized data transformations.' };
    }
    if (t.includes('security') || t.includes('auth') || t.includes('token') || t.includes('vulnerability') || t.includes('jwt') || t.includes('encrypt')) {
      return { title: 'Lead AppSec Architect & Vulnerability Auditor', category: 'CyberSecurity', defaultTone: 'Scrutinize logic through zero-trust security, defense-in-depth, and vulnerability mitigation.' };
    }
    if (t.includes('write') || t.includes('copy') || t.includes('article') || t.includes('blog') || t.includes('pitch') || t.includes('content')) {
      return { title: 'Senior Technical Copywriter & Content Strategist', category: 'Content Strategy', defaultTone: 'Focus on high impact, value proposition, scannable formatting, and audience engagement.' };
    }
    if (t.includes('product') || t.includes('feature') || t.includes('strategy') || t.includes('user') || t.includes('roadmap')) {
      return { title: 'Principal Product Strategist & UX Lead', category: 'Product Strategy', defaultTone: 'Evaluate options through user experience impact, business value, and strategic execution.' };
    }

    return { title: 'Expert Domain Advisor & Solution Architect', category: 'General Problem Solving', defaultTone: 'Provide structured, highly effective analysis and actionable solutions.' };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoleAdvisor;
}
