// Upload Component

class UploadManager {
    constructor() {
        this.selectedFiles = [];
        this.isUploading = false;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.folderNameInput = document.getElementById('folder-name');
        this.filePreview = document.getElementById('file-preview');
        this.uploadBtn = document.getElementById('upload-files');
        this.clearBtn = document.getElementById('clear-files');
    }

    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Browse button click
        this.browseBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // Upload button click
        this.uploadBtn.addEventListener('click', () => {
            this.uploadFiles();
        });

        // Clear button click
        this.clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });

        // Prevent default drag behaviors on document
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Handle file selection
     * @param {FileList} files - Selected files
     */
    async handleFileSelect(files) {
        const validFiles = [];
        const errors = [];

        for (const file of Array.from(files)) {
            const validation = validateFile(file);
            if (validation.isValid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.errors.join(', ')}`);
            }
        }

        // Show validation errors
        if (errors.length > 0) {
            window.toastManager?.show('error', 'Invalid Files', errors.join('\n'));
        }

        // Add valid files to selection
        if (validFiles.length > 0) {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
            await this.updatePreview();
            this.updateUploadButton();
        }
    }

    /**
     * Update file preview display
     */
    async updatePreview() {
        this.filePreview.innerHTML = '';

        if (this.selectedFiles.length === 0) {
            this.filePreview.style.display = 'none';
            return;
        }

        this.filePreview.style.display = 'block';

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            const fileItem = await this.createFilePreviewItem(file, i);
            this.filePreview.appendChild(fileItem);
        }
    }

    /**
     * Create file preview item
     * @param {File} file - File object
     * @param {number} index - File index
     * @returns {Element} - File preview element
     */
    async createFilePreviewItem(file, index) {
        const fileItem = createElement('div', { className: 'file-item' });

        // Create thumbnail
        let thumbnail;
        try {
            const previewUrl = await createPreviewUrl(file);
            thumbnail = createElement('img', {
                className: 'file-thumbnail',
                src: previewUrl,
                alt: file.name
            });
        } catch (error) {
            thumbnail = createElement('div', {
                className: 'file-thumbnail',
                innerHTML: '<i class="fas fa-file-image"></i>'
            });
        }

        // File info
        const fileInfo = createElement('div', { className: 'file-info' });
        fileInfo.appendChild(thumbnail);

        const fileDetails = createElement('div', { className: 'file-details' });
        fileDetails.appendChild(createElement('h4', {}, escapeHtml(file.name)));
        fileDetails.appendChild(createElement('p', {}, formatFileSize(file.size)));

        fileInfo.appendChild(fileDetails);

        // Remove button
        const removeBtn = createElement('button', {
            className: 'file-remove',
            innerHTML: '<i class="fas fa-times"></i>',
            title: 'Remove file'
        });

        removeBtn.addEventListener('click', () => {
            this.removeFile(index);
        });

        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);

        return fileItem;
    }

    /**
     * Remove file from selection
     * @param {number} index - File index
     */
    async removeFile(index) {
        this.selectedFiles.splice(index, 1);
        await this.updatePreview();
        this.updateUploadButton();
    }

    /**
     * Clear all selected files
     */
    async clearFiles() {
        this.selectedFiles = [];
        this.fileInput.value = '';
        await this.updatePreview();
        this.updateUploadButton();
    }

    /**
     * Update upload button state
     */
    updateUploadButton() {
        this.uploadBtn.disabled = this.selectedFiles.length === 0 || this.isUploading;
        
        if (this.isUploading) {
            this.uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        } else {
            this.uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
        }
    }

    /**
     * Upload selected files
     */
    async uploadFiles() {
        if (this.selectedFiles.length === 0 || this.isUploading) {
            return;
        }

        this.isUploading = true;
        this.updateUploadButton();
        toggleLoading(true);

        try {
            const folderName = this.folderNameInput.value.trim();
            
            const result = await window.apiService.uploadPictures(
                this.selectedFiles,
                folderName,
                (progress) => {
                    this.updateUploadProgress(progress);
                }
            );

            // Success
            window.toastManager?.show('success', 'Upload Complete', 
                `Successfully uploaded ${this.selectedFiles.length} file(s)`);

            // Clear files and reset form
            await this.clearFiles();
            this.folderNameInput.value = '';

            // Notify other components
            window.eventBus.emit(EVENTS.UPLOAD_COMPLETE, {
                folderName: folderName || result.folder_name,
                fileCount: this.selectedFiles.length
            });

            // Refresh gallery and folders
            window.galleryManager?.refresh();
            window.foldersManager?.refresh();

        } catch (error) {
            handleError(error, 'upload');
        } finally {
            this.isUploading = false;
            this.updateUploadButton();
            toggleLoading(false);
        }
    }

    /**
     * Update upload progress
     * @param {number} progress - Progress percentage
     */
    updateUploadProgress(progress) {
        this.uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading... ${Math.round(progress)}%`;
    }

    /**
     * Reset upload form
     */
    reset() {
        this.clearFiles();
        this.folderNameInput.value = '';
    }

    /**
     * Get current state
     * @returns {object} - Current state
     */
    getState() {
        return {
            selectedFiles: this.selectedFiles.length,
            isUploading: this.isUploading,
            folderName: this.folderNameInput.value.trim()
        };
    }
}

// Initialize upload manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});
