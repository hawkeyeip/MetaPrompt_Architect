/**
 * App Controller (Master Orchestrator)
 * Binds UI events across tabs, orchestrates MetaPrompt, Security, Compression & LaunchDarkly Versioning.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  selectedRole: null,
  currentMetaPrompt: '',

  init() {
    this.bindNavigation();
    this.bindGenerator();
    this.bindRoleAdvisor();
    this.bindSecurityScanner();
    this.bindTokenCompressor();
    this.bindVersionManager();
    this.bindMultimodal();
    this.bindSamplePrompts();

    // Default recommendation setup
    this.updateRoleRecommendations();
  },

  /* ------------------------------------------------------------------
     1. Navigation & Tab Switching
     ------------------------------------------------------------------ */
  bindNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewPanels = document.querySelectorAll('.view-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        viewPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = document.getElementById(`view-${targetView}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }

        // Refresh views on tab change
        if (targetView === 'versioning') {
          this.renderVersionHistory();
        } else if (targetView === 'compressor') {
          this.syncCompressorWithCurrentPrompt();
        } else if (targetView === 'security') {
          this.syncSecurityWithCurrentPrompt();
        }
      });
    });
  },

  /* ------------------------------------------------------------------
     2. Meta-Prompt Generator Tab
     ------------------------------------------------------------------ */
  bindGenerator() {
    const taskInput = document.getElementById('input-task');
    const contextInput = document.getElementById('input-context');
    const generateBtn = document.getElementById('btn-generate-prompt');
    const outputContainer = document.getElementById('output-meta-prompt');
    const copyBtn = document.getElementById('btn-copy-prompt');
    const tokenCountBadge = document.getElementById('badge-token-count');

    // Real-time role recommendation as user types task
    if (taskInput) {
      taskInput.addEventListener('input', () => {
        this.updateRoleRecommendations();
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const task = taskInput.value;
        const context = contextInput.value;
        const outputFormat = document.getElementById('select-output-format')?.value || 'Structured Markdown';
        const reasoningMode = document.getElementById('select-reasoning-mode')?.value || 'Step-by-Step Chain of Thought';
        const enableRefining = document.getElementById('check-enable-refine')?.checked ?? true;
        const enableSecurity = document.getElementById('check-enable-security')?.checked ?? true;

        if (!task || task.trim().length === 0) {
          alert('Please enter a task or topic for your prompt.');
          return;
        }

        // Get selected role or fallback to default
        const role = this.selectedRole || RoleAdvisor.recommendRoles(task)[0];

        // Generate Meta-Prompt
        const result = MetaPromptEngine.generateMetaPrompt({
          role,
          task,
          context,
          outputFormat,
          reasoningMode,
          enableRefining,
          enableSecurityCheck: enableSecurity,
          attachments: MultimodalHandler.attachments
        });

        // If security enabled, perform security scan on output
        let finalPromptText = result.metaPrompt;
        if (enableSecurity) {
          const scan = SecurityScanner.scan(finalPromptText);
          this.renderHeaderSecurityIndicator(scan);
        }

        this.currentMetaPrompt = finalPromptText;
        outputContainer.textContent = finalPromptText;

        // Update token badge
        const tokens = TokenCompressor.estimateTokens(finalPromptText);
        if (tokenCountBadge) {
          tokenCountBadge.textContent = `${tokens} Tokens`;
        }

        // Auto-scroll to result
        outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!this.currentMetaPrompt) {
          alert('No prompt generated yet.');
          return;
        }
        navigator.clipboard.writeText(this.currentMetaPrompt);
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Copied!';
        setTimeout(() => { copyBtn.innerHTML = origText; }, 2000);
      });
    }
  },

  /* ------------------------------------------------------------------
     3. Role Advisor Tab & Panel
     ------------------------------------------------------------------ */
  updateRoleRecommendations() {
    const taskInput = document.getElementById('input-task');
    const text = taskInput ? taskInput.value : '';
    const recommendations = RoleAdvisor.recommendRoles(text);

    const container = document.getElementById('role-recommendations-container');
    if (!container) return;

    container.innerHTML = '';
    recommendations.forEach((role, idx) => {
      const card = document.createElement('div');
      card.className = `role-card ${this.selectedRole?.id === role.id ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="role-card-header">
          <span class="role-name">${role.name}</span>
          <span class="role-score">${role.matchScore}% Match</span>
        </div>
        <div class="role-description">${role.description}</div>
        <div class="role-tags">
          <span class="role-tag">Tone: ${role.tone}</span>
          <span class="role-tag">${role.category}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedRole = role;
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const activeRoleBadge = document.getElementById('badge-active-role');
        if (activeRoleBadge) {
          activeRoleBadge.textContent = role.name;
        }
      });

      // Default select top recommendation if none selected
      if (idx === 0 && !this.selectedRole) {
        this.selectedRole = role;
        card.classList.add('selected');
        const activeRoleBadge = document.getElementById('badge-active-role');
        if (activeRoleBadge) activeRoleBadge.textContent = role.name;
      }

      container.appendChild(card);
    });
  },

  bindRoleAdvisor() {
    // Custom role generator
    const applyCustomRoleBtn = document.getElementById('btn-apply-custom-role');
    if (applyCustomRoleBtn) {
      applyCustomRoleBtn.addEventListener('click', () => {
        const title = document.getElementById('custom-role-title').value;
        const system = document.getElementById('custom-role-system').value;
        const tone = document.getElementById('custom-role-tone').value;

        if (!title || !system) {
          alert('Please enter a role title and system instruction.');
          return;
        }

        const customRole = {
          id: 'custom_' + Date.now(),
          name: title,
          systemPrompt: system,
          tone: tone || 'Professional',
          category: 'Custom',
          description: 'User-defined custom AI role persona.'
        };

        this.selectedRole = customRole;
        const activeRoleBadge = document.getElementById('badge-active-role');
        if (activeRoleBadge) activeRoleBadge.textContent = customRole.name;
        alert(`Role "${title}" applied successfully!`);
      });
    }
  },

  /* ------------------------------------------------------------------
     4. Security Scanner Tab & Actions
     ------------------------------------------------------------------ */
  bindSecurityScanner() {
    const scanBtn = document.getElementById('btn-run-security-scan');
    const autoRedactBtn = document.getElementById('btn-auto-redact');

    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        const text = document.getElementById('security-input-text').value;
        const scan = SecurityScanner.scan(text);
        this.renderSecurityFindings(scan);
      });
    }

    if (autoRedactBtn) {
      autoRedactBtn.addEventListener('click', () => {
        const textEl = document.getElementById('security-input-text');
        if (!textEl.value) return;

        const redacted = SecurityScanner.autoRedact(textEl.value);
        textEl.value = redacted;

        // Re-scan
        const scan = SecurityScanner.scan(redacted);
        this.renderSecurityFindings(scan);
        alert('All detected sensitive data and PII have been auto-redacted!');
      });
    }
  },

  syncSecurityWithCurrentPrompt() {
    const secInput = document.getElementById('security-input-text');
    if (secInput && this.currentMetaPrompt && !secInput.value) {
      secInput.value = this.currentMetaPrompt;
      const scan = SecurityScanner.scan(this.currentMetaPrompt);
      this.renderSecurityFindings(scan);
    }
  },

  renderSecurityFindings(scan) {
    const banner = document.getElementById('security-status-banner');
    const findingsList = document.getElementById('security-findings-list');

    if (banner) {
      banner.className = `security-banner ${scan.status}`;
      if (scan.status === 'safe') {
        banner.innerHTML = '✓ <strong>Security Scan Clean:</strong> No PII, API keys, or security vulnerabilities detected.';
      } else if (scan.status === 'warning') {
        banner.innerHTML = `⚠️ <strong>Security Risk Score ${scan.riskScore}/100:</strong> Found ${scan.summary.total} potential sensitivity item(s). Review recommendations below.`;
      } else {
        banner.innerHTML = `🚨 <strong>High Risk Security Flag (${scan.riskScore}/100):</strong> Detected ${scan.summary.highCount} HIGH severity secret/PII risk(s). Auto-redaction strongly recommended.`;
      }
    }

    if (findingsList) {
      findingsList.innerHTML = '';
      if (scan.findings.length === 0) {
        findingsList.innerHTML = '<div style="color: var(--text-muted); font-size: 13px;">No security vulnerabilities or PII detected.</div>';
        return;
      }

      scan.findings.forEach(f => {
        const item = document.createElement('div');
        item.className = 'finding-item';
        item.innerHTML = `
          <div class="finding-header">
            <span class="finding-title">${f.name} (${f.category})</span>
            <span class="finding-badge ${f.severity}">${f.severity}</span>
          </div>
          <div class="finding-snippet">${f.matchSnippet}</div>
          <div style="font-size: 11.5px; color: var(--text-secondary);">Suggested Replacement: <code>${f.replacement}</code></div>
        `;
        findingsList.appendChild(item);
      });
    }
  },

  renderHeaderSecurityIndicator(scan) {
    const indicator = document.getElementById('header-security-indicator');
    if (!indicator) return;

    if (scan.status === 'safe') {
      indicator.innerHTML = '<span style="color: #34d399; font-size: 11px;">🛡️ Clean</span>';
    } else {
      indicator.innerHTML = `<span style="color: #f87171; font-size: 11px;">⚠️ ${scan.summary.total} Risks</span>`;
    }
  },

  /* ------------------------------------------------------------------
     5. Token Compressor Tab
     ------------------------------------------------------------------ */
  bindTokenCompressor() {
    const compressBtn = document.getElementById('btn-run-compression');

    if (compressBtn) {
      compressBtn.addEventListener('click', () => {
        const origText = document.getElementById('compressor-input-text').value;
        const level = document.getElementById('select-compression-level')?.value || 'moderate';

        if (!origText) {
          alert('Please enter or generate a prompt to compress.');
          return;
        }

        const compressed = TokenCompressor.compress(origText, level);
        const metrics = TokenCompressor.getMetrics(origText, compressed);

        document.getElementById('compressor-output-text').textContent = compressed;
        document.getElementById('stat-orig-tokens').textContent = metrics.originalTokens;
        document.getElementById('stat-comp-tokens').textContent = metrics.compressedTokens;
        document.getElementById('stat-savings-pct').textContent = `${metrics.savingsPercent}%`;
        document.getElementById('stat-cost-savings').textContent = `$${metrics.estimatedCostSavingsUSD}`;
      });
    }
  },

  syncCompressorWithCurrentPrompt() {
    const compInput = document.getElementById('compressor-input-text');
    if (compInput && this.currentMetaPrompt && !compInput.value) {
      compInput.value = this.currentMetaPrompt;
    }
  },

  /* ------------------------------------------------------------------
     6. LaunchDarkly Prompt Versioning Tab & QC
     ------------------------------------------------------------------ */
  bindVersionManager() {
    const saveVerBtn = document.getElementById('btn-save-new-version');
    const compareBtn = document.getElementById('btn-compare-versions');

    if (saveVerBtn) {
      saveVerBtn.addEventListener('click', () => {
        const title = document.getElementById('version-title-input').value;
        const text = document.getElementById('version-prompt-text').value || this.currentMetaPrompt;
        const targetModel = document.getElementById('version-model-select').value;
        const changeLog = document.getElementById('version-changelog-input').value;

        if (!text) {
          alert('Please enter prompt text to commit a version.');
          return;
        }

        const newVersion = VersionManager.saveVersion({
          title: title || 'Meta-Prompt Iteration',
          promptText: text,
          targetModel,
          changeLog
        });

        alert(`Saved ${newVersion.version} successfully!`);
        this.renderVersionHistory();
      });
    }

    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        const verIdA = document.getElementById('select-diff-a').value;
        const verIdB = document.getElementById('select-diff-b').value;

        const verA = VersionManager.getVersionById(verIdA);
        const verB = VersionManager.getVersionById(verIdB);

        if (!verA || !verB) return;

        const diff = VersionManager.computeDiff(verA.promptText, verB.promptText);
        this.renderDiffOutput(diff, verA, verB);
      });
    }
  },

  renderVersionHistory() {
    const versions = VersionManager.getAllVersions();

    // Populate selectors
    const selectA = document.getElementById('select-diff-a');
    const selectB = document.getElementById('select-diff-b');
    const historyContainer = document.getElementById('version-history-list');

    if (selectA && selectB) {
      selectA.innerHTML = '';
      selectB.innerHTML = '';
      versions.forEach((v, idx) => {
        const optA = new Option(`${v.version} - ${v.title}`, v.id);
        const optB = new Option(`${v.version} - ${v.title}`, v.id);
        selectA.add(optA);
        selectB.add(optB);
      });

      if (versions.length > 1) {
        selectA.selectedIndex = 1;
        selectB.selectedIndex = 0;
      }
    }

    if (historyContainer) {
      historyContainer.innerHTML = '';
      versions.forEach(v => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.padding = '14px';
        card.innerHTML = `
          <div class="flex-between">
            <span style="font-weight: 700; color: #ffffff;">${v.version} — ${v.title}</span>
            <span class="brand-badge">${v.targetModel}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">${v.changeLog}</div>
          <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 12px;">
            <span>📅 ${new Date(v.timestamp).toLocaleString()}</span>
            <span>⚡ ${v.tokenEstimate} Tokens</span>
            ${v.variables.length > 0 ? `<span>📌 Variables: ${v.variables.map(x => `{{${x}}}`).join(', ')}</span>` : ''}
          </div>
          <div class="btn-group" style="margin-top: 6px;">
            <button class="btn btn-secondary btn-sm btn-restore" data-id="${v.id}">Restore to Generator</button>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${v.id}">Delete</button>
          </div>
        `;

        card.querySelector('.btn-restore').addEventListener('click', () => {
          this.currentMetaPrompt = v.promptText;
          document.getElementById('output-meta-prompt').textContent = v.promptText;
          alert(`Restored ${v.version} into the Meta-Prompt Generator!`);
          document.querySelector('[data-tab="generator"]').click();
        });

        card.querySelector('.btn-delete').addEventListener('click', () => {
          if (confirm(`Delete version ${v.version}?`)) {
            VersionManager.deleteVersion(v.id);
            this.renderVersionHistory();
          }
        });

        historyContainer.appendChild(card);
      });
    }
  },

  renderDiffOutput(diff, verA, verB) {
    const boxA = document.getElementById('diff-box-a');
    const boxB = document.getElementById('diff-box-b');

    if (boxA && boxB) {
      boxA.innerHTML = `<strong>${verA.version} (${verA.title})</strong>\n\n` + 
        diff.diffA.map(l => `<span class="${l.type === 'removed' ? 'diff-line-removed' : ''}">${this.escapeHtml(l.text)}</span>`).join('\n');
      
      boxB.innerHTML = `<strong>${verB.version} (${verB.title})</strong>\n\n` + 
        diff.diffB.map(l => `<span class="${l.type === 'added' ? 'diff-line-added' : ''}">${this.escapeHtml(l.text)}</span>`).join('\n');
    }
  },

  /* ------------------------------------------------------------------
     7. Multimodal Inputs Handler
     ------------------------------------------------------------------ */
  bindMultimodal() {
    MultimodalHandler.init('dropzone-media', 'input-media-files', 'media-preview-container', (attachments) => {
      const badge = document.getElementById('badge-multimodal-count');
      if (badge) badge.textContent = `${attachments.length} Attached`;
    });

    const templateBtns = document.querySelectorAll('.btn-multimodal-template');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const text = MultimodalHandler.getMultimodalPromptTemplate(type);
        const taskInput = document.getElementById('input-task');
        if (taskInput) {
          taskInput.value = text;
          this.updateRoleRecommendations();
        }
      });
    });
  },

  /* ------------------------------------------------------------------
     8. Quick Sample Prompts Loader
     ------------------------------------------------------------------ */
  bindSamplePrompts() {
    const sampleSelect = document.getElementById('select-sample-prompts');
    if (!sampleSelect) return;

    const samples = {
      architecture: {
        task: 'Design a high-throughput event-driven microservices backend for payment processing',
        context: 'We handle 50,000 transactions per second with strict zero-loss requirements and PCI-DSS compliance.'
      },
      security: {
        task: 'Audit our authentication API endpoint for OWASP vulnerabilities and token leakage',
        context: 'The service uses JWT tokens signed with RS256, running on AWS ECS behind Cloudflare.'
      },
      data_analysis: {
        task: 'Write a BigQuery SQL script to analyze customer churn cohort retention over 12 months',
        context: 'Events table contains user_id, event_timestamp, event_type, and transaction_amount.'
      }
    };

    sampleSelect.addEventListener('change', (e) => {
      const key = e.target.value;
      if (samples[key]) {
        document.getElementById('input-task').value = samples[key].task;
        document.getElementById('input-context').value = samples[key].context;
        this.updateRoleRecommendations();
      }
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
