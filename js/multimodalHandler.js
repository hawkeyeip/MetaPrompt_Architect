/**
 * MultimodalHandler Module
 * Handles drag-and-drop image/document attachments, visual context previews, and multimodal prompt templates.
 */

const MultimodalHandler = {
  attachments: [],

  init(dropzoneId, fileInputId, previewContainerId, onChangeCallback) {
    this.dropzone = document.getElementById(dropzoneId);
    this.fileInput = document.getElementById(fileInputId);
    this.previewContainer = document.getElementById(previewContainerId);
    this.onChangeCallback = onChangeCallback;

    if (this.dropzone && this.fileInput) {
      this.bindEvents();
    }
  },

  bindEvents() {
    this.dropzone.addEventListener('click', () => this.fileInput.click());

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFiles(e.target.files);
      }
    });
  },

  handleFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: e.target.result
        };
        this.attachments.push(item);
        this.renderPreviews();
        if (this.onChangeCallback) this.onChangeCallback(this.attachments);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  },

  removeAttachment(id) {
    this.attachments = this.attachments.filter(a => a.id !== id);
    this.renderPreviews();
    if (this.onChangeCallback) this.onChangeCallback(this.attachments);
  },

  renderPreviews() {
    if (!this.previewContainer) return;
    this.previewContainer.innerHTML = '';

    if (this.attachments.length === 0) {
      return;
    }

    this.attachments.forEach(att => {
      const card = document.createElement('div');
      card.className = 'media-preview-card';

      if (att.type.startsWith('image/')) {
        card.innerHTML = `
          <img src="${att.dataUrl}" alt="${att.name}" title="${att.name}" />
          <button type="button" class="media-remove-btn" data-id="${att.id}">&times;</button>
        `;
      } else {
        card.innerHTML = `
          <div style="padding: 10px; font-size: 11px; text-align: center; word-break: break-all;">
            📄 <strong>${att.name}</strong>
          </div>
          <button type="button" class="media-remove-btn" data-id="${att.id}">&times;</button>
        `;
      }

      const removeBtn = card.querySelector('.media-remove-btn');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeAttachment(att.id);
      });

      this.previewContainer.appendChild(card);
    });
  },

  getMultimodalPromptTemplate(type = 'vision_analysis') {
    const templates = {
      vision_analysis: 'Analyze the attached image in detail. Extract key visual components, text elements (OCR), color hierarchy, layout structure, and any underlying patterns.',
      ui_to_code: 'Examine the attached UI screenshot/wireframe. Convert this visual layout into semantic HTML5 and CSS grid/flexbox code. Maintain exact component hierarchy and spacing.',
      diagram_architecture: 'Analyze the attached architectural/flow diagram. Identify all system components, data flows, protocols, and boundaries. Provide a written technical summary and Mermaid diagram.'
    };
    return templates[type] || templates.vision_analysis;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultimodalHandler;
}
