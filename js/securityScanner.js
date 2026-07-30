/**
 * SecurityScanner Module
 * Detects PII, credentials, API keys, sensitive data, and prompt injection vulnerabilities.
 * Provides 1-click Auto-Redact and Masking features.
 */

const SecurityScanner = {
  // Vulnerability detection patterns
  rules: [
    {
      id: 'openai_api_key',
      name: 'OpenAI API Key',
      category: 'Secret / API Key',
      severity: 'high',
      regex: /sk-[a-zA-Z0-9]{20,}/g,
      replacement: '[REDACTED_OPENAI_KEY]'
    },
    {
      id: 'aws_access_key',
      name: 'AWS Access Key ID',
      category: 'Secret / API Key',
      severity: 'high',
      regex: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
      replacement: '[REDACTED_AWS_KEY]'
    },
    {
      id: 'generic_api_key',
      name: 'Generic API Key / Token',
      category: 'Secret / API Key',
      severity: 'high',
      regex: /(api[_-]?key|access[_-]?token|bearer[_-]?token|auth[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[a-zA-Z0-9_\-\.]{16,}["']?/gi,
      replacement: '$1: "[REDACTED_SECRET]"'
    },
    {
      id: 'private_key',
      name: 'RSA / SSH Private Key',
      category: 'Secret / Credential',
      severity: 'high',
      regex: /-----BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY-----[\s\S]*?-----END \1 PRIVATE KEY-----/g,
      replacement: '[REDACTED_PRIVATE_KEY]'
    },
    {
      id: 'email_address',
      name: 'Personal Email Address (PII)',
      category: 'PII',
      severity: 'medium',
      regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
      replacement: '[REDACTED_EMAIL]'
    },
    {
      id: 'phone_number',
      name: 'Phone Number (PII)',
      category: 'PII',
      severity: 'medium',
      regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      replacement: '[REDACTED_PHONE]'
    },
    {
      id: 'ip_address',
      name: 'Internal / Public IP Address',
      category: 'Network PII',
      severity: 'low',
      regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      replacement: '[REDACTED_IP]'
    },
    {
      id: 'social_security',
      name: 'Social Security Number (SSN)',
      category: 'PII',
      severity: 'high',
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      replacement: '[REDACTED_SSN]'
    },
    {
      id: 'credit_card',
      name: 'Credit Card Number',
      category: 'Financial PII',
      severity: 'high',
      regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      replacement: '[REDACTED_CREDIT_CARD]'
    },
    {
      id: 'prompt_injection',
      name: 'Potential Prompt Injection / System Override',
      category: 'Security Risk',
      severity: 'high',
      regex: /(ignore\s+all\s+previous\s+instructions|system\s+override|jailbreak|disregard\s+above|forget\s+all\s+prior\s+rules)/gi,
      replacement: '[FLAGGED_SYSTEM_OVERRIDE_ATTEMPT]'
    }
  ],

  /**
   * Scans text and returns structured findings and risk score
   */
  scan(text) {
    if (!text || text.trim().length === 0) {
      return { status: 'safe', riskScore: 0, summary: { highCount: 0, mediumCount: 0, lowCount: 0, total: 0 }, findings: [] };
    }

    const findings = [];
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    this.rules.forEach(rule => {
      // Reset regex index for global matches
      rule.regex.lastIndex = 0;
      const matches = text.match(rule.regex);
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          findings.push({
            id: rule.id,
            name: rule.name,
            category: rule.category,
            severity: rule.severity,
            matchSnippet: match.length > 60 ? match.substring(0, 57) + '...' : match,
            fullMatch: match,
            replacement: rule.replacement
          });

          if (rule.severity === 'high') highCount++;
          else if (rule.severity === 'medium') mediumCount++;
          else lowCount++;
        });
      }
    });

    const riskScore = Math.min(100, (highCount * 35) + (mediumCount * 15) + (lowCount * 5));
    let status = 'safe';
    if (riskScore >= 50) status = 'danger';
    else if (riskScore > 0) status = 'warning';

    return {
      status,
      riskScore,
      summary: { highCount, mediumCount, lowCount, total: findings.length },
      findings
    };
  },

  /**
   * Automatically redacts all detected sensitive vulnerabilities in text
   */
  autoRedact(text) {
    if (!text) return text;
    let redactedText = text;

    this.rules.forEach(rule => {
      rule.regex.lastIndex = 0;
      redactedText = redactedText.replace(rule.regex, rule.replacement);
    });

    return redactedText;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityScanner;
}
