// Modal Component

class ModalManager {
    constructor() {
        this.currentImage = null;
        this.currentActions = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.modal = document.getElementById('image-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalImage = document.getElementById('modal-image');
        this.modalClose = document.getElementById('modal-close');
        this.downloadBtn = document.getElementById('download-image');
        this.deleteBtn = document.getElementById('delete-image');
    }

    setupEventListeners() {
        // Close modal
        this.modalClose.addEventListener('click', () => {
            this.hide();
        });

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });

        // Download button
        this.downloadBtn.addEventListener('click', () => {
            if (this.currentActions?.download) {
                this.currentActions.download();
            }
        });

        // Delete button
        this.deleteBtn.addEventListener('click', () => {
            if (this.currentActions?.delete) {
                this.currentActions.delete();
                this.hide();
            }
        });

        // Prevent body scroll when modal is open
        this.modal.addEventListener('transitionend', () => {
            if (this.isVisible()) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    /**
     * Show image in modal
     * @param {string} imageUrl - Image URL
     * @param {string} title - Modal title
     * @param {object} actions - Available actions
     */
    showImage(imageUrl, title, actions = {}) {
        this.currentImage = imageUrl;
        this.currentActions = actions;
        
        this.modalTitle.textContent = title;
        this.modalImage.src = imageUrl;
        this.modalImage.alt = title;
        
        // Show/hide action buttons based on provided actions
        this.downloadBtn.style.display = actions.download ? 'flex' : 'none';
        this.deleteBtn.style.display = actions.delete ? 'flex' : 'none';
        
        this.show();
    }

    /**
     * Show modal
     */
    show() {
        this.modal.classList.add('show');
        
        // Focus trap
        this.modalClose.focus();
    }

    /**
     * Hide modal
     */
    hide() {
        this.modal.classList.remove('show');
        this.currentImage = null;
        this.currentActions = null;
        
        // Clear image src to stop loading
        this.modalImage.src = '';
    }

    /**
     * Check if modal is visible
     * @returns {boolean} - Visibility state
     */
    isVisible() {
        return this.modal.classList.contains('show');
    }

    /**
     * Update modal content
     * @param {object} updates - Updates to apply
     */
    update(updates) {
        if (updates.title) {
            this.modalTitle.textContent = updates.title;
        }
        
        if (updates.imageUrl) {
            this.modalImage.src = updates.imageUrl;
            this.currentImage = updates.imageUrl;
        }
        
        if (updates.actions) {
            this.currentActions = { ...this.currentActions, ...updates.actions };
            this.downloadBtn.style.display = this.currentActions.download ? 'flex' : 'none';
            this.deleteBtn.style.display = this.currentActions.delete ? 'flex' : 'none';
        }
    }
}

// Initialize modal manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});
