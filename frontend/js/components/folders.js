// Folders Component

class FoldersManager {
    constructor() {
        this.folders = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.foldersGrid = document.getElementById('folders-grid');
        this.refreshBtn = document.getElementById('refresh-folders');
    }

    setupEventListeners() {
        // Refresh button
        this.refreshBtn.addEventListener('click', () => {
            this.refresh();
        });

        // Listen for upload completion
        window.eventBus.on(EVENTS.UPLOAD_COMPLETE, () => {
            this.refresh();
        });
    }

    /**
     * Load folders from server
     */
    async loadFolders() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const response = await window.apiService.getFolders();
            this.folders = response.folders || {};
            this.renderFolders();
        } catch (error) {
            handleError(error, 'folders load');
            this.showError('Failed to load folders');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render folders in the grid
     */
    renderFolders() {
        this.foldersGrid.innerHTML = '';

        const folderNames = Object.keys(this.folders);
        
        if (folderNames.length === 0) {
            this.showEmptyState();
            return;
        }

        // Sort folders by name
        folderNames.sort().forEach(folderName => {
            const folderData = this.folders[folderName];
            const folderElement = this.createFolderElement(folderName, folderData);
            this.foldersGrid.appendChild(folderElement);
        });
    }

    /**
     * Create folder element
     * @param {string} folderName - Folder name
     * @param {object} folderData - Folder data
     * @returns {Element} - Folder element
     */
    createFolderElement(folderName, folderData) {
        const item = createElement('div', { className: 'folder-item' });
        
        // Folder header
        const header = createElement('div', { className: 'folder-header' });
        
        const title = createElement('div', { className: 'folder-title' });
        title.appendChild(createElement('i', { className: 'fas fa-folder' }));
        title.appendChild(createElement('h3', {}, escapeHtml(folderName)));
        
        const count = createElement('span', { 
            className: 'folder-count',
            textContent: folderData.count || 0
        });
        
        header.appendChild(title);
        header.appendChild(count);

        // Folder preview (show first 3 images)
        const preview = createElement('div', { className: 'folder-preview' });
        const pictures = folderData.pictures || [];
        
        for (let i = 0; i < 3; i++) {
            if (i < pictures.length) {
                const picture = pictures[i];
                const img = createElement('img', {
                    className: 'folder-preview-image',
                    src: window.apiService.getPictureUrl(folderName, picture.filename),
                    alt: picture.filename,
                    loading: 'lazy'
                });
                
                // Handle image load error
                img.addEventListener('error', () => {
                    img.style.display = 'none';
                    const placeholder = createElement('div', {
                        className: 'folder-preview-placeholder',
                        innerHTML: '<i class="fas fa-image"></i>'
                    });
                    preview.appendChild(placeholder);
                });
                
                preview.appendChild(img);
            } else {
                const placeholder = createElement('div', {
                    className: 'folder-preview-placeholder',
                    innerHTML: '<i class="fas fa-plus"></i>'
                });
                preview.appendChild(placeholder);
            }
        }

        // Folder actions
        const actions = createElement('div', { className: 'folder-actions' });
        
        const viewBtn = createElement('button', {
            className: 'btn btn-primary',
            innerHTML: '<i class="fas fa-eye"></i> View'
        });
        
        const downloadBtn = createElement('button', {
            className: 'btn btn-secondary',
            innerHTML: '<i class="fas fa-download"></i> Download All'
        });
        
        const deleteBtn = createElement('button', {
            className: 'btn btn-danger',
            innerHTML: '<i class="fas fa-trash"></i> Delete'
        });

        // Event listeners
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewFolder(folderName);
        });

        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadFolder(folderName, folderData);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteFolder(folderName);
        });

        // Click to view folder
        item.addEventListener('click', () => {
            this.viewFolder(folderName);
        });

        actions.appendChild(viewBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(header);
        item.appendChild(preview);
        item.appendChild(actions);

        return item;
    }

    /**
     * View folder (switch to gallery with filter)
     * @param {string} folderName - Folder name
     */
    viewFolder(folderName) {
        // Switch to gallery tab
        const galleryTab = document.querySelector('[data-tab="gallery"]');
        if (galleryTab) {
            galleryTab.click();
        }
        
        // Set folder filter
        setTimeout(() => {
            const folderFilter = document.getElementById('folder-filter');
            if (folderFilter) {
                folderFilter.value = folderName;
                folderFilter.dispatchEvent(new Event('change'));
            }
        }, 100);
    }

    /**
     * Download all pictures in folder
     * @param {string} folderName - Folder name
     * @param {object} folderData - Folder data
     */
    async downloadFolder(folderName, folderData) {
        const pictures = folderData.pictures || [];
        
        if (pictures.length === 0) {
            window.toastManager?.show('info', 'No Pictures', 'This folder is empty');
            return;
        }

        const confirmed = confirm(`Download all ${pictures.length} pictures from "${folderName}"?`);
        if (!confirmed) return;

        try {
            toggleLoading(true);
            
            let downloaded = 0;
            let failed = 0;
            
            for (const picture of pictures) {
                try {
                    await window.apiService.downloadPicture(folderName, picture.filename);
                    downloaded++;
                } catch (error) {
                    console.error(`Failed to download ${picture.filename}:`, error);
                    failed++;
                }
            }
            
            if (downloaded > 0) {
                window.toastManager?.show('success', 'Download Complete', 
                    `Downloaded ${downloaded} pictures${failed > 0 ? `, ${failed} failed` : ''}`);
            } else {
                window.toastManager?.show('error', 'Download Failed', 
                    'Failed to download any pictures');
            }
            
        } catch (error) {
            handleError(error, 'download folder');
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Delete entire folder
     * @param {string} folderName - Folder name
     */
    async deleteFolder(folderName) {
        const folderData = this.folders[folderName];
        const pictureCount = folderData?.count || 0;
        
        const confirmed = confirm(
            `Are you sure you want to delete the folder "${folderName}" and all ${pictureCount} pictures in it?\n\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            toggleLoading(true);
            await window.apiService.deleteFolder(folderName);
            
            window.toastManager?.show('success', 'Folder Deleted', 
                `Deleted folder "${folderName}" and ${pictureCount} pictures`);
            
            // Remove from local data
            delete this.folders[folderName];
            this.renderFolders();
            
            // Update other components
            window.galleryManager?.refresh();
            
        } catch (error) {
            handleError(error, 'delete folder');
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.foldersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Loading Folders...</h3>
                <p>Please wait while we load your folders.</p>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.foldersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No Folders Found</h3>
                <p>Upload some pictures to create your first folder!</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.foldersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Folders</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="window.foldersManager.refresh()">
                    <i class="fas fa-retry"></i> Try Again
                </button>
            </div>
        `;
    }

    /**
     * Refresh folders
     */
    refresh() {
        this.loadFolders();
    }

    /**
     * Get current state
     * @returns {object} - Current state
     */
    getState() {
        const folderNames = Object.keys(this.folders);
        const totalPictures = folderNames.reduce((total, name) => {
            return total + (this.folders[name].count || 0);
        }, 0);

        return {
            folderCount: folderNames.length,
            totalPictures,
            isLoading: this.isLoading,
            folders: Object.keys(this.folders)
        };
    }
}

// Initialize folders manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.foldersManager = new FoldersManager();
});
