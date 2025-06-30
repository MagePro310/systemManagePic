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
        this.initializeFolderInput();
        this.loadExistingFolders();
    }

    setupElements() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.folderSelector = document.getElementById('folder-selector');
        this.folderNameInput = document.getElementById('folder-name');
        this.filePreview = document.getElementById('file-preview');
        this.uploadBtn = document.getElementById('upload-files');
        this.clearBtn = document.getElementById('clear-files');
        
        // Verify elements exist
        if (!this.folderNameInput) {
            console.error('Folder name input not found!');
        }
        if (!this.folderSelector) {
            console.error('Folder selector not found!');
        }
    }

    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
            // Clear the input value to allow selecting the same files again if needed
            e.target.value = '';
        });

        // Browse button click
        this.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.fileInput.click();
        });

        // Upload area click (but not on the browse button)
        this.uploadArea.addEventListener('click', (e) => {
            // Don't trigger if the browse button was clicked
            if (e.target === this.browseBtn || this.browseBtn.contains(e.target)) {
                return;
            }
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

        // Folder selector change
        this.folderSelector.addEventListener('change', (e) => {
            this.handleFolderSelectorChange(e.target.value);
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
        console.log(`Processing ${files.length} files, current selection: ${this.selectedFiles.length}`);
        
        const validFiles = [];
        const errors = [];

        for (const file of Array.from(files)) {
            const validation = validateFile(file);
            if (validation.isValid) {
                // Check for duplicate files by name and size
                const isDuplicate = this.selectedFiles.some(existingFile => 
                    existingFile.name === file.name && existingFile.size === file.size
                );
                
                if (!isDuplicate) {
                    validFiles.push(file);
                    console.log(`Added file: ${file.name}`);
                } else {
                    console.log(`Skipping duplicate file: ${file.name}`);
                }
            } else {
                errors.push(`${file.name}: ${validation.errors.join(', ')}`);
            }
        }

        // Show validation errors
        if (errors.length > 0) {
            window.toastManager?.show('error', 'Invalid Files', errors.join('\n'));
        }

        // Add valid files to selection (only new, non-duplicate files)
        if (validFiles.length > 0) {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
            console.log(`Total files after selection: ${this.selectedFiles.length}`);
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
                className: 'file-thumbnail flex-center'
            }, createIcon('fa-file-image'));
        }

        // File info container
        const fileInfo = createElement('div', { className: 'file-info flex gap-2' });
        fileInfo.appendChild(thumbnail);

        // File details
        const fileDetails = createElement('div', { className: 'file-details' });
        fileDetails.appendChild(createElement('h4', { className: 'mb-1' }, escapeHtml(file.name)));
        fileDetails.appendChild(createElement('p', { className: 'text-secondary' }, formatFileSize(file.size)));

        fileInfo.appendChild(fileDetails);

        // Remove button
        const removeBtn = createButton('', 'danger', {
            className: 'btn-sm file-remove',
            title: 'Remove file'
        });
        removeBtn.appendChild(createIcon('fa-times'));

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

        await executeWithErrorHandling(async () => {
            this.isUploading = true;
            this.updateUploadButton();

            const folderName = this.getFolderName();
            
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
            this.folderSelector.value = '';
            this.folderNameInput.value = '';
            this.folderNameInput.disabled = false;
            this.folderNameInput.placeholder = 'Enter folder name or leave empty for auto-generated';

            // Reload folder list
            await this.loadExistingFolders();

            // Notify other components
            window.eventBus.emit(EVENTS.UPLOAD_COMPLETE, {
                folderName: folderName || result.folder_name,
                fileCount: this.selectedFiles.length
            });

            // Refresh gallery and folders
            window.galleryManager?.refresh();
            window.foldersManager?.refresh();

        }, 'File upload', true);
        
        this.isUploading = false;
        this.updateUploadButton();
    }

    /**
     * Update upload progress
     * @param {number} progress - Progress percentage
     */
    updateUploadProgress(progress) {
        this.uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading... ${Math.round(progress)}%`;
    }

    /**
     * Initialize folder input state
     */
    initializeFolderInput() {
        // Set initial state - create new folder mode
        console.log('Initializing folder input...');
        
        if (!this.folderSelector || !this.folderNameInput) {
            console.error('Folder elements not found during initialization');
            return;
        }
        
        // Ensure elements are visible and properly configured
        this.folderSelector.value = '';
        this.folderNameInput.disabled = false;
        this.folderNameInput.style.display = 'block';
        this.folderNameInput.style.visibility = 'visible';
        this.folderNameInput.placeholder = 'Enter folder name or leave empty for auto-generated';
        this.folderNameInput.value = '';
        this.folderNameInput.focus(); // Try to focus to test if it's working
        
        console.log('Folder input initialized - disabled:', this.folderNameInput.disabled);
        console.log('Folder input display:', this.folderNameInput.style.display);
        console.log('Folder input visibility:', this.folderNameInput.style.visibility);
        
        // Debug the state
        setTimeout(() => this.debugInputState(), 100);
    }

    /**
     * Handle folder selector change
     * @param {string} selectedValue - Selected folder value
     */
    handleFolderSelectorChange(selectedValue) {
        console.log('Folder selector changed to:', selectedValue);
        if (selectedValue === '') {
            // Create new folder - enable text input
            this.folderNameInput.disabled = false;
            this.folderNameInput.placeholder = 'Enter folder name or leave empty for auto-generated';
            this.folderNameInput.value = '';
            console.log('Enabled input for new folder creation');
        } else {
            // Use existing folder - disable text input and set value
            this.folderNameInput.disabled = true;
            this.folderNameInput.value = selectedValue;
            this.folderNameInput.placeholder = `Using existing folder: ${selectedValue}`;
            console.log('Disabled input for existing folder:', selectedValue);
        }
    }

    /**
     * Load existing folders into selector
     */
    async loadExistingFolders() {
        try {
            const response = await window.apiService.getFolders();
            const folders = response.folders || {};
            
            // Clear existing options except the first one
            while (this.folderSelector.children.length > 1) {
                this.folderSelector.removeChild(this.folderSelector.lastChild);
            }
            
            // Add existing folders as options
            Object.keys(folders).forEach(folderName => {
                const option = document.createElement('option');
                option.value = folderName;
                option.textContent = `${folderName} (${folders[folderName].count} files)`;
                this.folderSelector.appendChild(option);
            });
            
            // Ensure the input state is correct after loading
            this.handleFolderSelectorChange(this.folderSelector.value);
            
        } catch (error) {
            console.error('Failed to load folders:', error);
            // Ensure input is enabled even if loading fails
            this.folderNameInput.disabled = false;
        }
    }

    /**
     * Get the selected or entered folder name
     * @returns {string} - Folder name
     */
    getFolderName() {
        const selectedFolder = this.folderSelector.value;
        if (selectedFolder !== '') {
            return selectedFolder;
        }
        return this.folderNameInput.value.trim();
    }

    /**
     * Reset upload form
     */
    reset() {
        this.clearFiles();
        this.folderSelector.value = '';
        this.folderNameInput.value = '';
        this.folderNameInput.disabled = false;
        this.folderNameInput.placeholder = 'Enter folder name or leave empty for auto-generated';
    }

    /**
     * Debug function to check input state
     */
    debugInputState() {
        console.log('=== Folder Input Debug ===');
        console.log('Selector value:', this.folderSelector.value);
        console.log('Input disabled:', this.folderNameInput.disabled);
        console.log('Input value:', this.folderNameInput.value);
        console.log('Input placeholder:', this.folderNameInput.placeholder);
        console.log('Input readonly:', this.folderNameInput.readOnly);
        console.log('Input style.pointerEvents:', this.folderNameInput.style.pointerEvents);
        console.log('=========================');
    }

    /**
     * Get current state
     * @returns {object} - Current state
     */
    getState() {
        return {
            selectedFiles: this.selectedFiles.length,
            isUploading: this.isUploading,
            folderName: this.getFolderName()
        };
    }
}

// Initialize upload manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
    
    // Add global debug function
    window.debugUpload = () => {
        if (window.uploadManager) {
            window.uploadManager.debugInputState();
        } else {
            console.log('Upload manager not found');
        }
    };
    
    console.log('Upload manager initialized. Use debugUpload() to check state.');
});
