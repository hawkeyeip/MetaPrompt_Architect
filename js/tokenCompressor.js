/**
 * TokenCompressor Module
 * Token-conscious compression engine that reduces prompt length while preserving key intent & specs.
 */

const TokenCompressor = {
  /**
   * Estimates token count (approx 1 token per 4 characters or 0.75 words)
   */
  estimateTokens(text) {
    if (!text) return 0;
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil((charCount / 4 + wordCount / 0.75) / 2);
  },

  // Boilerplate filler patterns to prune during compression
  fillerPatterns: [
    { regex: /please\s+make\s+sure\s+to/gi, replace: '' },
    { regex: /i\s+would\s+like\s+you\s+to\s+kindly/gi, replace: '' },
    { regex: /as\s+an\s+ai\s+(language\s+model|assistant),?\s*/gi, replace: '' },
    { regex: /could\s+you\s+possibly/gi, replace: '' },
    { regex: /it\s+is\s+very\s+important\s+that\s+you/gi, replace: 'Must' },
    { regex: /keep\s+in\s+mind\s+that\s+/gi, replace: '' },
    { regex: /in\s+order\s+to\s+achieve\s+this,?\s*/gi, replace: 'To' },
    { regex: /due\s+to\s+the\s+fact\s+that/gi, replace: 'because' },
    { regex: /at\s+this\s+point\s+in\s+time/gi, replace: 'now' },
    { regex: /for\s+the\s+purpose\s+of/gi, replace: 'for' },
    { regex: /feel\s+free\s+to/gi, replace: '' }
  ],

  /**
   * Compresses prompt text using syntactic optimizations and boilerplate pruning
   */
  compress(text, level = 'moderate') {
    if (!text || text.trim().length === 0) return '';

    let compressed = text;

    // Step 1: Remove common verbose conversational fillers
    this.fillerPatterns.forEach(pattern => {
      compressed = compressed.replace(pattern.regex, pattern.replace);
    });

    // Step 2: Normalize multiple whitespace & blank lines
    compressed = compressed.replace(/[ \t]+/g, ' ');

    if (level === 'moderate' || level === 'aggressive') {
      // Step 3: Streamline conversational introductory sentences
      compressed = compressed.replace(/^(hello|hi|hey|greetings|dear ai),?\s*/gi, '');
      
      // Step 4: Condense passive phrasing into direct imperatives
      compressed = compressed.replace(/\byou\s+should\s+always\s+ensure\b/gi, 'Ensure');
      compressed = compressed.replace(/\byou\s+must\s+make\s+sure\b/gi, 'Ensure');
      compressed = compressed.replace(/\bmake\s+sure\s+that\s+the\s+output\b/gi, 'Output:');
      compressed = compressed.replace(/\bthe\s+format\s+should\s+be\b/gi, 'Format:');

      // Step 5: Format multi-step instructions concisely
      compressed = compressed.replace(/\n\s*-\s*/g, '\n• ');
    }

    if (level === 'aggressive') {
      // Step 6: Prune redundant prepositions and extra punctuation
      compressed = compressed.replace(/(\n\s*){3,}/g, '\n\n');
      compressed = compressed.replace(/\s*([,.:;])\s*/g, '$1 ');
    }

    return compressed.trim();
  },

  /**
   * Generates compression analytics
   */
  getMetrics(originalText, compressedText) {
    const origTokens = this.estimateTokens(originalText);
    const compTokens = this.estimateTokens(compressedText);
    const tokensSaved = Math.max(0, origTokens - compTokens);
    const savingsPercent = origTokens > 0 ? Math.round((tokensSaved / origTokens) * 100) : 0;
    
    // Estimated cost savings per 1,000 prompt invocations (assuming ~$0.005 per 1k input tokens average)
    const estimatedCostSavingsUSD = ((tokensSaved * 1000 * 0.005) / 1000).toFixed(2);

    return {
      originalTokens: origTokens,
      compressedTokens: compTokens,
      tokensSaved,
      savingsPercent,
      estimatedCostSavingsUSD
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCompressor;
}
