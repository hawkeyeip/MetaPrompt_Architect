/**
 * RoleAdvisor Module (v0.2.0 - Dynamic Role Synthesizer & Tone Manager)
 * Dynamically synthesizes custom AI roles based on prompt context and selected Tone & Style format.
 */

const RoleAdvisor = {
  // Robust collection of Persona Formats & Tone Styles
  personaStyles: [
    {
      id: 'domain_authority',
      name: 'Domain Authority & Senior Specialist',
      description: 'Deep technical rigor, production standards, and zero conversational fluff.',
      toneDirective: 'Operate as a top-tier Senior Lead Specialist. Deliver authoritative, highly technical solutions with strict adherence to industry best practices.'
    },
    {
      id: 'socratic_mentor',
      name: 'Socratic Mentor & Diagnostic Partner',
      description: 'Guides step-by-step, explores root causes, and validates mental models.',
      toneDirective: 'Operate as a Socratic Diagnostic Mentor. Break down concepts step-by-step, ask clarifying questions where appropriate, and explain the "why" behind every step.'
    },
    {
      id: 'executive_strategist',
      name: 'C-Suite Executive Strategist',
      description: 'High-level decision framing, ROI, risk mitigation, and strategic clarity.',
      toneDirective: 'Operate as an Executive Strategy Partner. Frame insights around strategic impact, key trade-offs, risk assessment, and clear actionable takeaways.'
    },
    {
      id: 'direct_minimalist',
      name: 'Direct-Response Minimalist',
      description: 'Extremely concise, bulleted, action-first output with maximum token efficiency.',
      toneDirective: 'Operate as a Direct-Response Minimalist. Cut all conversational preamble and present conclusions, directives, and steps using bulleted conciseness.'
    },
    {
      id: 'code_security_auditor',
      name: 'Peer Code Reviewer & Security Auditor',
      description: 'Focuses on defensive coding, OWASP vulnerability prevention, and edge cases.',
      toneDirective: 'Operate as a Senior Security Auditor and Code Reviewer. Scrutinize logic for vulnerability vectors, performance bottlenecks, and edge case failure modes.'
    },
    {
      id: 'creative_ideation',
      name: 'Creative Strategy & Ideation Partner',
      description: 'Explores multi-angle possibilities, innovative approaches, and alternative models.',
      toneDirective: 'Operate as an Innovative Strategy Partner. Offer creative, multi-perspective approaches, highlighting non-obvious possibilities and novel frameworks.'
    },
    {
      id: 'academic_analyst',
      name: 'Empirical Data Analyst & Researcher',
      description: 'Focuses on statistical validity, methodology breakdown, and empirical logic.',
      toneDirective: 'Operate as an Empirical Data Researcher. Ensure statistical validity, methodology clarity, and quantitative precision in all analytical steps.'
    }
  ],

  /**
   * Dynamically synthesizes a custom AI Role tailored to the user's prompt context & selected persona style
   */
  synthesizeRole(promptText, styleId = 'domain_authority') {
    const selectedStyle = this.personaStyles.find(s => s.id === styleId) || this.personaStyles[0];
    
    // Extract key domain keywords to ground the role prompt
    const domainContext = this.extractDomainKeywords(promptText);

    const systemPrompt = `You are an elite ${domainContext.title}. ${selectedStyle.toneDirective} Your objective is to address the request with maximum precision, actionable execution, and contextual domain expertise.`;

    return {
      title: domainContext.title,
      styleName: selectedStyle.name,
      systemPrompt,
      rationale: `Dynamically synthesized ${domainContext.title} role operating under the "${selectedStyle.name}" persona style.`
    };
  },

  /**
   * Extracts domain context and generates dynamic role title
   */
  extractDomainKeywords(text) {
    if (!text || text.trim().length === 0) {
      return { title: 'Domain Lead & Strategic Problem Solver' };
    }

    const t = text.toLowerCase();
    if (t.includes('code') || t.includes('api') || t.includes('backend') || t.includes('refactor') || t.includes('bug') || t.includes('system')) {
      return { title: 'Principal Software & Systems Architect' };
    }
    if (t.includes('sql') || t.includes('query') || t.includes('data') || t.includes('pandas') || t.includes('bigquery') || t.includes('analytic')) {
      return { title: 'Principal Data Engineer & Statistician' };
    }
    if (t.includes('security') || t.includes('auth') || t.includes('token') || t.includes('vulnerability') || t.includes('jwt') || t.includes('encrypt')) {
      return { title: 'Lead AppSec Architect & Vulnerability Auditor' };
    }
    if (t.includes('write') || t.includes('copy') || t.includes('article') || t.includes('blog') || t.includes('pitch') || t.includes('content')) {
      return { title: 'Senior Technical Copywriter & Content Strategist' };
    }
    if (t.includes('product') || t.includes('feature') || t.includes('strategy') || t.includes('user') || t.includes('roadmap')) {
      return { title: 'Principal Product Strategist & UX Lead' };
    }

    return { title: 'Expert Domain Advisor & Solution Architect' };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoleAdvisor;
}
