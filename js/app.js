/**
 * App Controller (v0.3.0 Master Orchestrator)
 * Handles optional persona & tone dropdowns, tooltips & output examples for reasoning modes & formats, and LaunchDarkly versioning.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentMetaPrompt: '',

  init() {
    this.populateDropdownOptions();
    this.bindTooltips();
    this.bindNavigation();
    this.bindGenerator();
    this.bindRoleAdvisor();
    this.bindSecurityScanner();
    this.bindTokenCompressor();
    this.bindVersionManager();
    this.bindMultimodal();
    this.bindSamplePrompts();
  },

  /* ------------------------------------------------------------------
     0. Populate Dropdowns (Optional Persona Formats, Tone Styles, Reasoning, Formats)
     ------------------------------------------------------------------ */
  populateDropdownOptions() {
    // 1. Persona Formats Dropdown
    const formatSelect = document.getElementById('select-persona-format');
    if (formatSelect && RoleAdvisor.personaFormats) {
      formatSelect.innerHTML = '';
      RoleAdvisor.personaFormats.forEach(f => {
        const opt = new Option(f.name, f.id);
        formatSelect.add(opt);
      });
    }

    // 2. Tone & Style Dropdown
    const toneSelect = document.getElementById('select-tone-style');
    if (toneSelect && RoleAdvisor.toneStyles) {
      toneSelect.innerHTML = '';
      RoleAdvisor.toneStyles.forEach(t => {
        const opt = new Option(t.name, t.id);
        toneSelect.add(opt);
      });
    }

    // 3. Reasoning Modes Dropdown
    const reasoningSelect = document.getElementById('select-reasoning-mode');
    if (reasoningSelect && MetaPromptEngine.reasoningModesInfo) {
      reasoningSelect.innerHTML = '';
      Object.keys(MetaPromptEngine.reasoningModesInfo).forEach(key => {
        const item = MetaPromptEngine.reasoningModesInfo[key];
        const opt = new Option(item.name, key);
        reasoningSelect.add(opt);
      });
    }

    // 4. Output Formats Dropdown
    const outputSelect = document.getElementById('select-output-format');
    if (outputSelect && MetaPromptEngine.outputFormatsInfo) {
      outputSelect.innerHTML = '';
      Object.keys(MetaPromptEngine.outputFormatsInfo).forEach(key => {
        const item = MetaPromptEngine.outputFormatsInfo[key];
        const opt = new Option(item.name, key);
        outputSelect.add(opt);
      });
    }
  },

  /* ------------------------------------------------------------------
     0.1 Tooltips & Dynamic Info Cards Setup
     ------------------------------------------------------------------ */
  bindTooltips() {
    const reasoningSelect = document.getElementById('select-reasoning-mode');
    const outputSelect = document.getElementById('select-output-format');

    if (reasoningSelect) {
      reasoningSelect.addEventListener('change', () => this.updateReasoningTooltip());
      this.updateReasoningTooltip();
    }

    if (outputSelect) {
      outputSelect.addEventListener('change', () => this.updateOutputTooltip());
      this.updateOutputTooltip();
    }
  },

  updateReasoningTooltip() {
    const key = document.getElementById('select-reasoning-mode')?.value;
    const tooltipBox = document.getElementById('tooltip-reasoning-mode');
    if (!key || !tooltipBox || !MetaPromptEngine.reasoningModesInfo[key]) return;

    const info = MetaPromptEngine.reasoningModesInfo[key];
    tooltipBox.innerHTML = `
      <div class="info-tooltip-title">💡 ${info.name}</div>
      <div>${info.description}</div>
      <div style="font-size: 11px; color: #a5b4fc; margin-top: 4px;"><strong>Best for:</strong> ${info.bestFor}</div>
      <div class="info-tooltip-example">Example: ${info.example}</div>
    `;
  },

  updateOutputTooltip() {
    const key = document.getElementById('select-output-format')?.value;
    const tooltipBox = document.getElementById('tooltip-output-format');
    if (!key || !tooltipBox || !MetaPromptEngine.outputFormatsInfo[key]) return;

    const info = MetaPromptEngine.outputFormatsInfo[key];
    tooltipBox.innerHTML = `
      <div class="info-tooltip-title">📄 ${info.name}</div>
      <div>${info.description}</div>
      <div class="info-tooltip-example">Preview:\n${info.example}</div>
    `;
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

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const task = taskInput.value;
        const context = contextInput.value;
        const personaFormatId = document.getElementById('select-persona-format')?.value || 'auto';
        const toneStyleId = document.getElementById('select-tone-style')?.value || 'auto';
        const outputFormatKey = document.getElementById('select-output-format')?.value || 'markdown';
        const reasoningModeKey = document.getElementById('select-reasoning-mode')?.value || 'cot';
        const enableRefining = document.getElementById('check-enable-refine')?.checked ?? true;
        const enableSecurity = document.getElementById('check-enable-security')?.checked ?? true;

        if (!task || task.trim().length === 0) {
          alert('Please enter a prompt, task, or question.');
          return;
        }

        // Generate Meta-Prompt
        const result = MetaPromptEngine.generateMetaPrompt({
          task,
          context,
          personaFormatId,
          toneStyleId,
          outputFormatKey,
          reasoningModeKey,
          enableRefining,
          enableSecurityCheck: enableSecurity,
          attachments: MultimodalHandler.attachments
        });

        // Security scan if enabled
        let finalPromptText = result.metaPrompt;
        if (enableSecurity) {
          const scan = SecurityScanner.scan(finalPromptText);
          this.renderHeaderSecurityIndicator(scan);
        }

        this.currentMetaPrompt = finalPromptText;
        outputContainer.textContent = finalPromptText;

        // Render role summary & clarifying questions
        this.renderRoleSummary(result.role);
        this.renderClarifyingQuestions(result.clarifyingQuestions);

        // Update token count badge
        const tokens = TokenCompressor.estimateTokens(finalPromptText);
        if (tokenCountBadge) {
          tokenCountBadge.textContent = `${tokens} Tokens`;
        }

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

  renderRoleSummary(role) {
    const badgeRole = document.getElementById('badge-active-role');
    const summaryBox = document.getElementById('recommended-role-summary');

    if (badgeRole) badgeRole.textContent = role.title;
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; font-size: 13.5px;">Synthesized Role: ${role.title}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${role.rationale}</div>
      `;
    }
  },

  renderClarifyingQuestions(questions) {
    const container = document.getElementById('clarifying-questions-container');
    if (!container) return;

    if (!questions || questions.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">No additional clarification needed.</div>';
      return;
    }

    container.innerHTML = questions.map((q, idx) => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; font-size: 12.5px;">
        <strong style="color: var(--accent-primary);">Q${idx + 1}:</strong> ${q}
      </div>
    `).join('');
  },

  /* ------------------------------------------------------------------
     3. Role Advisor Tab
     ------------------------------------------------------------------ */
  bindRoleAdvisor() {
    const applyCustomRoleBtn = document.getElementById('btn-apply-custom-role');
    if (applyCustomRoleBtn) {
      applyCustomRoleBtn.addEventListener('click', () => {
        const title = document.getElementById('custom-role-title').value;
        const system = document.getElementById('custom-role-system').value;
        const tone = document.getElementById('custom-role-tone').value;

        if (!title || !system) {
          alert('Please enter a role title and system directive.');
          return;
        }

        const customRole = {
          title,
          systemPrompt: system,
          rationale: `Custom User Directive: ${title} (${tone || 'Standard Tone'})`
        };

        this.renderRoleSummary(customRole);
        alert(`Custom Role "${title}" applied successfully!`);
      });
    }
  },

  /* ------------------------------------------------------------------
     4. Security Scanner Tab
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
        banner.innerHTML = `⚠️ <strong>Security Risk Score ${scan.riskScore}/100:</strong> Found ${scan.summary.total} potential sensitivity item(s).`;
      } else {
        banner.innerHTML = `🚨 <strong>High Risk Security Flag (${scan.riskScore}/100):</strong> Detected ${scan.summary.highCount} HIGH severity secret/PII risk(s).`;
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

    const selectA = document.getElementById('select-diff-a');
    const selectB = document.getElementById('select-diff-b');
    const historyContainer = document.getElementById('version-history-list');

    if (selectA && selectB) {
      selectA.innerHTML = '';
      selectB.innerHTML = '';
      versions.forEach(v => {
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
            ${v.variables && v.variables.length > 0 ? `<span>📌 Variables: ${v.variables.map(x => `{{${x}}}`).join(', ')}</span>` : ''}
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
      }
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
