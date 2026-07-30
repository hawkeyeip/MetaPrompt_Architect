/**
 * RoleAdvisor Module (v0.7.0 - Dynamic AI Role Matchmaker Engine)
 * Analyzes prompt semantics and dynamically synthesizes 3 highly specialized domain role options + Forego option.
 */

const RoleAdvisor = {
  personaFormats: [
    { id: 'auto', name: '-- Auto-Synthesize Top Roles (Recommended) --', description: 'Engine dynamically analyzes prompt and synthesizes top 3 domain roles.' },
    { id: 'senior_specialist', name: 'Domain Senior Specialist', description: 'Technical rigor, production standards, and zero fluff.' },
    { id: 'socratic_mentor', name: 'Socratic Diagnostic Mentor', description: 'Step-by-step guidance, probing root cause analysis.' },
    { id: 'executive_advisor', name: 'C-Suite Executive Advisor', description: 'Strategic vision, ROI, risk mitigation, business outcome focus.' },
    { id: 'direct_minimalist', name: 'Direct-Response Minimalist', description: 'Action-first, concise bullet points, token efficient.' },
    { id: 'code_auditor', name: 'Peer Code Reviewer & Auditor', description: 'Defensive coding, OWASP vulnerability prevention, edge cases.' }
  ],

  toneStyles: [
    { id: 'auto', name: '-- Auto-Detect Tone from Context (Recommended) --', directive: '' },
    { id: 'authoritative', name: 'Authoritative & Highly Technical', directive: 'Deliver authoritative, highly technical solutions with strict adherence to production standards.' },
    { id: 'educational', name: 'Encouraging & Educational', directive: 'Explain concepts step-by-step with encouraging guidance and clear diagnostic checkpoints.' },
    { id: 'strategic', name: 'Strategic & Business-Oriented', directive: 'Frame insights around strategic impact, key trade-offs, risk assessment, and actionable takeaways.' },
    { id: 'concise', name: 'Direct, Bulleted & Concise', directive: 'Cut all conversational preamble and present conclusions using concise bullet points.' }
  ],

  /**
   * Dynamically analyzes prompt and synthesizes 3 hyper-relevant domain roles + 1 Forego option
   */
  recommendRoleCandidates(promptText, formatId = 'auto', toneId = 'auto') {
    if (!promptText || promptText.trim().length === 0) {
      return [
        {
          id: 'cand_default_1',
          title: '🏆 Expert Domain Lead & Solution Architect',
          matchScore: 98,
          systemPrompt: 'Act as an Expert Domain Lead & Solution Architect. Provide authoritative, production-grade guidance.',
          rationale: 'Best for general technical problem solving, structured planning, and architecture.'
        },
        {
          id: 'cand_default_2',
          title: '🎯 Socratic Diagnostic Mentor',
          matchScore: 88,
          systemPrompt: 'Act as a Socratic Diagnostic Mentor. Guide through step-by-step diagnostic reasoning and root-cause analysis.',
          rationale: 'Best for educational step-by-step understanding and problem troubleshooting.'
        },
        {
          id: 'cand_default_3',
          title: '🚀 C-Suite Executive & Risk Advisor',
          matchScore: 82,
          systemPrompt: 'Act as a C-Suite Executive & Risk Advisor. Focus on strategic ROI, trade-offs, and high-impact decision framing.',
          rationale: 'Best for executive briefings, business strategy, and trade-off matrices.'
        },
        {
          id: 'candidate_forego',
          title: '🚫 Forego Role Assignment (Neutral LLM)',
          matchScore: 0,
          systemPrompt: 'Provide an authoritative, direct, and un-opinionated response without adopting a persona.',
          rationale: 'Omit specialized role locking and operate as a neutral high-performance LLM.'
        }
      ];
    }

    const t = promptText.toLowerCase();

    // CATEGORY 1: Branding, Design, Logos, Marketing
    if (t.includes('logo') || t.includes('design') || t.includes('brand') || t.includes('color') || t.includes('marketing') || t.includes('vibe')) {
      return [
        {
          id: 'cand_brand_1',
          title: '🏆 Lead Brand Identity Designer & Creative Director',
          matchScore: 98,
          systemPrompt: 'Act as a Lead Brand Identity Designer and Creative Director. Focus on visual storytelling, iconography, color psychology, and brand symbolism.',
          rationale: 'Ideal for creating memorable logos, emblem concepts, and aesthetic color palettes.'
        },
        {
          id: 'cand_brand_2',
          title: '🎯 Local Market Growth & Consumer Brand Strategist',
          matchScore: 92,
          systemPrompt: 'Act as a Local Market Growth and Consumer Brand Strategist. Focus on regional cultural alignment, customer appeal, and memorable messaging.',
          rationale: 'Ideal for making your brand stand out in specific local markets (e.g., Austin lifestyle & vibes).'
        },
        {
          id: 'cand_brand_3',
          title: '📱 Modern UI/UX App & Icon Specialist',
          matchScore: 85,
          systemPrompt: 'Act as a Modern UI/UX App and Icon Specialist. Focus on clean vector minimalism, mobile app icon scannability, and digital display scalability.',
          rationale: 'Ideal for digital delivery services, app icons, and modern simplified logos.'
        },
        {
          id: 'candidate_forego',
          title: '🚫 Forego Role Assignment (Neutral LLM)',
          matchScore: 0,
          systemPrompt: 'Provide direct visual and logo recommendations without adopting a specific designer persona.',
          rationale: 'Omit role assignment and get straightforward, un-opinionated design ideas.'
        }
      ];
    }

    // CATEGORY 2: Software Development, Coding, Architecture, APIs
    if (t.includes('code') || t.includes('api') || t.includes('build') || t.includes('app') || t.includes('go') || t.includes('python') || t.includes('service') || t.includes('backend')) {
      return [
        {
          id: 'cand_code_1',
          title: '🏆 Principal Systems & Application Architect',
          matchScore: 98,
          systemPrompt: 'Act as a Principal Systems and Application Architect. Focus on idiomatic design patterns, modular architecture, and high-performance software engineering.',
          rationale: 'Ideal for building clean, maintainable, and scalable software solutions.'
        },
        {
          id: 'cand_code_2',
          title: '🛡️ Zero-Trust OWASP CyberSecurity Auditor',
          matchScore: 90,
          systemPrompt: 'Act as a Zero-Trust OWASP CyberSecurity Auditor. Focus on vulnerability prevention, secure API endpoints, input validation, and defensive coding.',
          rationale: 'Ideal for auditing code security, authentication logic, and preventing exploits.'
        },
        {
          id: 'cand_code_3',
          title: '⚡ DevOps & Reliability Engineering Lead',
          matchScore: 84,
          systemPrompt: 'Act as a DevOps and Site Reliability Engineering Lead. Focus on deployment stability, error handling, Docker/Kubernetes containerization, and monitoring.',
          rationale: 'Ideal for operational reliability, production readiness, and container setups.'
        },
        {
          id: 'candidate_forego',
          title: '🚫 Forego Role Assignment (Neutral LLM)',
          matchScore: 0,
          systemPrompt: 'Provide raw technical code and architectural solutions without adopting a specific persona.',
          rationale: 'Omit role assignment and receive direct, un-opinionated technical code.'
        }
      ];
    }

    // CATEGORY 3: Data Analysis, SQL, Databases
    if (t.includes('sql') || t.includes('query') || t.includes('data') || t.includes('database') || t.includes('bigquery') || t.includes('pandas') || t.includes('analytics')) {
      return [
        {
          id: 'cand_data_1',
          title: '🏆 Lead Data Engineer & Pipeline Architect',
          matchScore: 98,
          systemPrompt: 'Act as a Lead Data Engineer and Pipeline Architect. Focus on optimized query execution, schema design, data transformation, and ETL efficiency.',
          rationale: 'Ideal for writing high-performance SQL queries, data warehousing, and ETL pipelines.'
        },
        {
          id: 'cand_data_2',
          title: '📊 Senior Quantitative Data Scientist',
          matchScore: 91,
          systemPrompt: 'Act as a Senior Quantitative Data Scientist. Focus on statistical significance, cohort analysis, trend forecasting, and metric modeling.',
          rationale: 'Ideal for extracting business insights, retention metrics, and statistical analysis.'
        },
        {
          id: 'cand_data_3',
          title: '⚙️ Database Administrator & Performance Tuner',
          matchScore: 85,
          systemPrompt: 'Act as a Database Administrator and Performance Tuner. Focus on index optimization, partition strategy, query cost reduction, and locking mechanics.',
          rationale: 'Ideal for optimizing slow queries, reducing cloud database costs, and indexing.'
        },
        {
          id: 'candidate_forego',
          title: '🚫 Forego Role Assignment (Neutral LLM)',
          matchScore: 0,
          systemPrompt: 'Provide direct database queries and analysis without adopting a persona.',
          rationale: 'Omit role assignment and receive direct, un-opinionated SQL scripts.'
        }
      ];
    }

    // CATEGORY 4: Writing, Documentation, Copywriting
    if (t.includes('write') || t.includes('article') || t.includes('copy') || t.includes('doc') || t.includes('email') || t.includes('post')) {
      return [
        {
          id: 'cand_write_1',
          title: '🏆 Senior Technical Copywriter & Editor',
          matchScore: 98,
          systemPrompt: 'Act as a Senior Technical Copywriter and Editor. Focus on scannable structure, engaging tone, clarity, and elimination of unnecessary fluff.',
          rationale: 'Ideal for crafting clear, high-impact articles, documentation, and blog posts.'
        },
        {
          id: 'cand_write_2',
          title: '🎯 Growth Copywriter & Conversion Specialist',
          matchScore: 90,
          systemPrompt: 'Act as a Growth Copywriter and Conversion Specialist. Focus on strong value proposition hooks, reader engagement, and persuasive calls-to-action.',
          rationale: 'Ideal for marketing copy, landing pages, and customer emails.'
        },
        {
          id: 'cand_write_3',
          title: '🎓 Executive Communication Lead',
          matchScore: 84,
          systemPrompt: 'Act as an Executive Communication Lead. Focus on authoritative executive summaries, high-level briefing tone, and decision-driven phrasing.',
          rationale: 'Ideal for C-suite memos, investor updates, and formal announcements.'
        },
        {
          id: 'candidate_forego',
          title: '🚫 Forego Role Assignment (Neutral LLM)',
          matchScore: 0,
          systemPrompt: 'Provide direct written text without adopting a specific writing persona.',
          rationale: 'Omit role assignment for direct, un-opinionated text.'
        }
      ];
    }

    // GENERAL DYNAMIC FALLBACK
    return [
      {
        id: 'cand_gen_1',
        title: '🏆 Domain Senior Specialist & Architect',
        matchScore: 98,
        systemPrompt: 'Act as a Domain Senior Specialist and Architect. Provide structured, authoritative technical solutions.',
        rationale: 'Primary recommended role tailored to the general domain of your task.'
      },
      {
        id: 'cand_gen_2',
        title: '🎯 Socratic Problem Solver & Diagnostic Lead',
        matchScore: 89,
        systemPrompt: 'Act as a Socratic Problem Solver and Diagnostic Lead. Deconstruct assumptions and guide reasoning step-by-step.',
        rationale: 'Best for breaking down complex challenges and evaluating edge cases.'
      },
      {
        id: 'cand_gen_3',
        title: '🚀 Executive Strategy & Decision Lead',
        matchScore: 83,
        systemPrompt: 'Act as an Executive Strategy and Decision Lead. Frame output around ROI, key trade-offs, and actionable decisions.',
        rationale: 'Best for strategic decision making and trade-off comparison.'
      },
      {
        id: 'candidate_forego',
        title: '🚫 Forego Role Assignment (Neutral LLM)',
        matchScore: 0,
        systemPrompt: 'Provide direct, un-opinionated output without adopting a persona.',
        rationale: 'Operate as a neutral, high-performance general model.'
      }
    ];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoleAdvisor;
}
