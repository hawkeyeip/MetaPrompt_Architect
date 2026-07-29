/**
 * VersionManager Module (LaunchDarkly Prompt Versioning & Quality Control System)
 * Manages dynamic version control, variables, side-by-side visual diffs, metadata & rollbacks.
 */

const VersionManager = {
  storageKey: 'metaprompt_architect_versions',
  
  // Default version store
  versions: [],

  init() {
    this.loadFromStorage();
    if (this.versions.length === 0) {
      this.createInitialDemoVersion();
    }
  },

  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          this.versions = JSON.parse(data);
        }
      }
    } catch (e) {
      console.warn('Failed to load versions from storage', e);
    }
  },

  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.versions));
      }
    } catch (e) {
      console.warn('Failed to save versions to storage', e);
    }
  },

  createInitialDemoVersion() {
    const demoPrompt = `[ROLE]
You are a Principal Systems Architect specializing in cloud-native microservices.

[CONTEXT]
The team is refactoring a legacy monolithic application into modular services.

[INSTRUCTION]
Analyze the provided architectural spec: {{architecture_spec}}.

[CONSTRAINTS]
- Adhere to 12-Factor App methodology.
- Ensure strict zero-trust security and data privacy.
- Format response in markdown with architecture diagrams.`;

    this.saveVersion({
      version: 'v1.0.0',
      title: 'Initial Architecture Master Prompt',
      promptText: demoPrompt,
      targetModel: 'GPT-4o',
      changeLog: 'Initial release of systems architecture prompt template.',
      rating: 5,
      variables: ['architecture_spec']
    });
  },

  /**
   * Extracts dynamic template variables {{variable_name}}
   */
  extractVariables(promptText) {
    if (!promptText) return [];
    const matches = promptText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
    if (!matches) return [];
    const vars = matches.map(m => m.replace(/[\{\}]/g, '').trim());
    return [...new Set(vars)];
  },

  /**
   * Evaluates template variables with user inputs
   */
  interpolate(promptText, variableValues = {}) {
    if (!promptText) return '';
    let result = promptText;
    Object.keys(variableValues).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, variableValues[key]);
    });
    return result;
  },

  /**
   * Saves a new prompt version (LaunchDarkly SemVer entry)
   */
  saveVersion({ version, title, promptText, targetModel, changeLog, rating }) {
    const vars = this.extractVariables(promptText);
    const newEntry = {
      id: 'ver_' + Date.now(),
      version: version || this.getNextVersionNumber(),
      title: title || 'Prompt Update',
      promptText,
      targetModel: targetModel || 'Universal (Any LLM)',
      changeLog: changeLog || 'Routine update',
      rating: rating || 5,
      variables: vars,
      timestamp: new Date().toISOString(),
      tokenEstimate: typeof TokenCompressor !== 'undefined' ? TokenCompressor.estimateTokens(promptText) : 0
    };

    this.versions.unshift(newEntry);
    this.saveToStorage();
    return newEntry;
  },

  getNextVersionNumber() {
    if (this.versions.length === 0) return 'v1.0.0';
    const latest = this.versions[0].version;
    const parts = latest.replace('v', '').split('.').map(Number);
    if (parts.length === 3) {
      parts[2] += 1; // Increment patch version
      return `v${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return `v1.0.${this.versions.length + 1}`;
  },

  getAllVersions() {
    return this.versions;
  },

  getVersionById(id) {
    return this.versions.find(v => v.id === id);
  },

  deleteVersion(id) {
    this.versions = this.versions.filter(v => v.id !== id);
    this.saveToStorage();
  },

  /**
   * Computes visual side-by-side line diff between two prompt texts
   */
  computeDiff(textA, textB) {
    const linesA = (textA || '').split('\n');
    const linesB = (textB || '').split('\n');
    
    const diffA = [];
    const diffB = [];

    const maxLines = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < maxLines; i++) {
      const lineA = linesA[i];
      const lineB = linesB[i];

      if (lineA === lineB) {
        diffA.push({ text: lineA || '', type: 'normal' });
        diffB.push({ text: lineB || '', type: 'normal' });
      } else {
        if (lineA !== undefined) diffA.push({ text: lineA, type: 'removed' });
        if (lineB !== undefined) diffB.push({ text: lineB, type: 'added' });
      }
    }

    return { diffA, diffB };
  }
};

if (typeof VersionManager !== 'undefined') {
  VersionManager.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersionManager;
}
