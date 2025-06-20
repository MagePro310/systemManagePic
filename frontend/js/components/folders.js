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
        this.loadFolders();
    }

    setupElements() {
        this.foldersGrid = document.getElementById('folders-grid');
        this.refreshBtn = document.getElementById('refresh-folders');
    }

    setupEventListeners() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }

    /**
     * Load folders from API
     */
    async loadFolders() {
        if (this.isLoading) return;

        console.log('Loading folders...');
        this.isLoading = true;
        this.showLoading();

        try {
            const response = await window.apiService.getFolders();
            console.log('Folders API response:', response);
            this.folders = response.folders || {};
            console.log('Parsed folders:', this.folders);
            this.renderFolders();
        } catch (error) {
            console.error('Error loading folders:', error);
            this.showError('Failed to load folders');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render folders in the grid
     */
    renderFolders() {
        if (!this.foldersGrid) {
            console.error('Folders grid element not found');
            return;
        }

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
     */
    createFolderElement(folderName, folderData) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-item';
        
        const previewImage = folderData.pictures && folderData.pictures.length > 0 
            ? folderData.pictures[0].path 
            : null;

        folderDiv.innerHTML = `
            <div class="folder-preview">
                ${previewImage 
                    ? `<img src="/pictures/${previewImage}" alt="${folderName}" class="folder-preview-image" onerror="this.style.display='none'">`
                    : '<div class="folder-preview-placeholder"><i class="fas fa-folder"></i></div>'
                }
            </div>
            <div class="folder-info">
                <h3 class="folder-name">${this.escapeHtml(folderName)}</h3>
                <p class="folder-count">${folderData.count || 0} pictures</p>
            </div>
            <div class="folder-actions">
                <button class="btn btn-sm btn-primary" onclick="window.foldersManager.viewFolder('${this.escapeHtml(folderName)}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-secondary" onclick="window.foldersManager.downloadFolder('${this.escapeHtml(folderName)}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.foldersManager.deleteFolder('${this.escapeHtml(folderName)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return folderDiv;
    }

    /**
     * View folder (switch to gallery and filter by folder)
     */
    viewFolder(folderName) {
        // Switch to gallery tab and filter by folder
        if (window.app) {
            window.app.switchTab('gallery');
            // Set filter after a small delay to ensure gallery is loaded
            setTimeout(() => {
                if (window.galleryManager) {
                    window.galleryManager.setFolderFilter(folderName);
                }
            }, 100);
        }
    }

    /**
     * Download folder
     */
    async downloadFolder(folderName) {
        try {
            const folderData = this.folders[folderName];
            if (!folderData || !folderData.pictures || folderData.pictures.length === 0) {
                window.toastManager?.show('warning', 'Empty Folder', 'This folder contains no pictures to download.');
                return;
            }

            window.toastManager?.show('info', 'Download Started', `Downloading ${folderData.pictures.length} pictures from ${folderName}...`);

            // Download each picture
            for (const picture of folderData.pictures) {
                const link = document.createElement('a');
                link.href = `/pictures/${picture.path}`;
                link.download = picture.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            window.toastManager?.show('success', 'Download Complete', `Downloaded ${folderData.pictures.length} pictures.`);
        } catch (error) {
            console.error('Error downloading folder:', error);
            window.toastManager?.show('error', 'Download Failed', 'Failed to download folder.');
        }
    }

    /**
     * Delete folder
     */
    async deleteFolder(folderName) {
        if (!confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`)) {
            return;
        }

        try {
            await window.apiService.deleteFolder(folderName);
            window.toastManager?.show('success', 'Folder Deleted', `Folder "${folderName}" has been deleted.`);
            this.refresh();
        } catch (error) {
            console.error('Error deleting folder:', error);
            window.toastManager?.show('error', 'Delete Failed', 'Failed to delete folder.');
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.foldersGrid) {
            this.foldersGrid.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading folders...</p>
                </div>
            `;
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        if (this.foldersGrid) {
            this.foldersGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Folders Found</h3>
                    <p>Upload some pictures to create your first folder!</p>
                    <button class="btn btn-primary" onclick="window.app?.switchTab('upload')">
                        <i class="fas fa-upload"></i> Upload Pictures
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        if (this.foldersGrid) {
            this.foldersGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Folders</h3>
                    <p>${this.escapeHtml(message)}</p>
                    <button class="btn btn-primary" onclick="window.foldersManager.refresh()">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Refresh folders
     */
    refresh() {
        this.loadFolders();
    }

    /**
     * Get current state
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
            folders: folderNames
        };
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize folders manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.foldersManager = new FoldersManager();
    console.log('Folders manager initialized');
});
