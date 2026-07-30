/**
 * RoleAdvisor Module (v0.5.0 - Multi-Candidate Role Recommendation & Forego System)
 * Generates selectable role candidates based on prompt context, with options to forego or supply custom roles.
 */

const RoleAdvisor = {
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
   * Generates 3-4 top candidate role recommendations + Forego option
   */
  recommendRoleCandidates(promptText, formatId = 'auto', toneId = 'auto') {
    const domainContext = this.extractDomainKeywords(promptText);

    // Dynamic Primary Candidate
    const primaryTitle = formatId !== 'auto' 
      ? `${(this.personaFormats.find(f => f.id === formatId) || {}).name || domainContext.title}` 
      : domainContext.title;

    const candidates = [
      {
        id: 'candidate_primary',
        title: primaryTitle,
        matchScore: 98,
        systemPrompt: `You are an elite ${primaryTitle}. ${domainContext.defaultTone} Your objective is to address the prompt with maximum precision and contextual domain expertise.`,
        rationale: `Primary recommended role based on context analysis of "${domainContext.category}".`
      },
      {
        id: 'candidate_mentor',
        title: `Socratic Mentor & Diagnostic Lead (${domainContext.category})`,
        matchScore: 88,
        systemPrompt: `You are a Senior Socratic Mentor specializing in ${domainContext.category}. Break down decisions step-by-step, explain underlying mechanics, and guide diagnostic troubleshooting.`,
        rationale: 'Best for educational step-by-step understanding and root-cause analysis.'
      },
      {
        id: 'candidate_auditor',
        title: `Defensive Security & Performance Auditor (${domainContext.category})`,
        matchScore: 82,
        systemPrompt: `You are a Defensive Auditor specializing in ${domainContext.category}. Scrutinize logic for vulnerabilities, performance bottlenecks, and edge cases.`,
        rationale: 'Best for production hardening, security audits, and risk assessment.'
      },
      {
        id: 'candidate_forego',
        title: '🚫 Forego Role Assignment (Neutral General Model)',
        matchScore: 0,
        systemPrompt: 'Provide an authoritative, direct, and un-opinionated technical response without adopting a specific persona.',
        rationale: 'Omit specialized role locking and operate as a neutral high-performance LLM.'
      }
    ];

    return candidates;
  },

  extractDomainKeywords(text) {
    if (!text || text.trim().length === 0) {
      return { title: 'Domain Lead & Solution Architect', category: 'General Problem Solving', defaultTone: 'Deliver authoritative technical solutions.' };
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
