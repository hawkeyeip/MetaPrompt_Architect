# MetaPrompt Architect — LLM Meta-Prompting & Prompt Management Studio

> **Version**: v0.1.0  
> **Manifest Version**: Chrome Manifest V3  
> **Target LLMs**: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 Pro / Flash, DeepSeek R1, Llama 3

**MetaPrompt Architect** is an advanced browser extension and standalone web application engineered to refine, optimize, secure, compress, and version high-efficacy prompts for Large Language Models (LLMs). Built following industry prompt engineering standards and LaunchDarkly prompt versioning & management principles, it elevates user prompt quality while maximizing output efficacy and token efficiency.

---

## ✨ Features (v0.1.0 Initial Build)

### 1. 🤖 Intelligent AI Role & Persona Advisory Engine
- **Intent Analysis**: Automatically analyzes input task directives and matches them against specialized domain personas (Systems Architecture, CyberSecurity Audit, Data Science, Copywriting, Socratic Mentorship, Product Strategy).
- **Match Scoring**: Displays match confidence scores (e.g., `99% Match`) along with domain rationale and tone configurations.
- **Custom Role Builder**: Allows users to define custom AI roles, system prompts, and tone directives.

### 2. ⚡ Meta-Prompt Synthesizer & Task Refine Feature
- **Structural Prompting Framework**: Synthesizes prompts divided into `[SYSTEM ROLE]`, `[CONTEXT]`, `[CORE OBJECTIVE]`, `[INSTRUCTION BREAKDOWN]`, `[REASONING METHODOLOGY]`, `[OUTPUT SPECIFICATIONS]`, and `[SECURITY MANDATE]`.
- **Task Refine Feature**: Automatically expounds upon vague prompt instructions by injecting edge-case handling guidelines, validation steps, and error boundaries.
- **Instruction Breakdown Generator**: Generates step-by-step Chain of Thought (CoT) instructions tailored to the request domain.

### 3. 🛡️ Security & Privacy Vulnerability Scanner
- **Real-time Threat & Leak Detection**: Scans prompt content for:
  - **Secrets & API Keys**: OpenAI keys (`sk-...`), AWS Access Key IDs, RSA/SSH Private Keys, Bearer tokens.
  - **PII**: Email addresses, phone numbers, Social Security Numbers, Credit Cards, internal IP addresses.
  - **Prompt Injection**: System override phrases and jailbreak vectors.
- **Risk Score & Auto-Redaction**: Displays a 0–100 risk indicator with **1-Click Auto-Redact** to replace sensitive content with safe placeholders (`[REDACTED_OPENAI_KEY]`, `[REDACTED_EMAIL]`).

### 4. 🗜️ Token-Conscious Prompt Compression Engine
- **Syntactic Compression**: Prunes conversational filler, preamble, and boilerplate while retaining 100% of major logical intent, constraints, and output format requirements.
- **Compression Aggressiveness Toggles**: Offers `Light`, `Moderate`, and `Aggressive` levels.
- **Savings Metrics**: Displays original vs. compressed token counts, percentage saved, and estimated API cost savings ($ USD per 1k runs).

### 5. 🏷️ LaunchDarkly Prompt Versioning & Quality Control System
- **Semantic Version Control**: Track prompt iterations with SemVer (`v1.0.0`, `v1.1.0`, `v2.0.0`).
- **Side-by-Side Visual Line Diff**: Compares prompt versions side-by-side, highlighting additions in green and deletions in red.
- **Dynamic Variable Templating**: Parameterize prompts using `{{variable_name}}` syntax.
- **Model Tagging & Rollbacks**: Tag prompts with target LLMs, attach changelog notes, and restore any previous version with 1 click.

### 6. 🖼️ Multimodal Asset Integration
- **Drag-and-Drop Attachment**: Drag images, wireframes, architecture diagrams, or text files into the studio.
- **Multimodal Templates**: Provides quick-start templates for Visual & OCR Image Analysis, UI Screenshot to HTML/CSS Code, and Architecture Diagram to Specification workflows.

---

## 🛠️ Installation & Setup

### Loading as an Unpacked Extension in Chrome

1. **Clone or Download** this repository to your local computer.
2. Open Google Chrome and navigate to the extensions page by typing `chrome://extensions/` in the URL bar.
3. Enable **Developer mode** using the toggle switch in the top-right corner of the page.
4. Click the **Load unpacked** button located in the top-left area.
5. Select the project directory:
   ```
   /Users/brandonheisey/.gemini/antigravity-ide/scratch/meta-prompt-architect
   ```
6. The **MetaPrompt Architect** extension icon will now appear in your extension toolbar! You can launch it as a **Popup** or open the **Side Panel** while browsing any website.

### Running as a Standalone Web Studio

To run MetaPrompt Architect in a full browser window:
- Open `index.html` directly in any web browser, or:
- Launch via local HTTP server:
  ```bash
  python3 -m http.server 8085
  ```
  Then visit `http://localhost:8085/index.html` in your browser.

---

## 📂 Repository Directory Structure

```
meta-prompt-architect/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── index.html                 # Standalone Web Studio application
├── sidepanel.html             # Chrome Extension Side Panel interface
├── popup.html                 # Chrome Extension Popup interface
├── .gitignore                 # Standard Git ignore rules
├── README.md                  # Project documentation
├── css/
│   └── styles.css             # Glassmorphic dark mode styling & diff engine
├── js/
│   ├── roleAdvisor.js         # AI Persona & Role recommendation engine
│   ├── securityScanner.js     # Vulnerability & PII scanner with auto-redact
│   ├── tokenCompressor.js     # Token compression engine & metrics
│   ├── versionManager.js      # LaunchDarkly prompt versioning & visual diff
│   ├── metaPromptEngine.js    # Core meta-prompt generator & task refiner
│   ├── multimodalHandler.js   # Drag-and-drop media attachment processor
│   └── app.js                 # Master UI event orchestrator & controller
├── icons/                     # Extension toolbar icons (16px, 48px, 128px)
└── test_runner.js             # Node.js automated unit test suite
```

---

## 🧪 Testing & Verification

Run the automated Node.js test suite to verify core logic:

```bash
node test_runner.js
```

---

## 📄 License
MIT License — Free to use, modify, and distribute for meta-prompt engineering and LLM research.

