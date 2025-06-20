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
        
        // Debug: log element existence
        console.log('Folders grid found:', !!this.foldersGrid);
        console.log('Refresh button found:', !!this.refreshBtn);
    }

    setupEventListeners() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Refresh button clicked');
                this.refresh();
            });
        } else {
            console.warn('Refresh button not found with ID: refresh-folders');
        }
    }

    /**
     * Load folders from API
     */
    async loadFolders() {
        if (this.isLoading) {
            console.log('Already loading folders, skipping...');
            return;
        }

        console.log('Loading folders...');
        console.log('Current tab at start of loadFolders:', window.app?.currentTab);
        window.tabSwitchMonitor?.log('loadFolders starting');
        
        this.isLoading = true;
        this.showLoading();

        try {
            // Check if API service is available
            if (!window.apiService) {
                throw new Error('API service not available');
            }

            console.log('Making getFolders API call...');
            window.tabSwitchMonitor?.log('getFolders API call starting');
            const response = await window.apiService.getFolders();
            console.log('Folders API response:', response);
            console.log('Current tab after API response:', window.app?.currentTab);
            window.tabSwitchMonitor?.log('getFolders API call completed');
            
            if (response && response.folders) {
                this.folders = response.folders;
                console.log('Parsed folders:', this.folders);
                console.log('Current tab before renderFolders:', window.app?.currentTab);
                window.tabSwitchMonitor?.log('About to render folders');
                this.renderFolders();
                console.log('Current tab after renderFolders:', window.app?.currentTab);
                window.tabSwitchMonitor?.log('renderFolders completed');
            } else {
                console.warn('Invalid API response:', response);
                this.showError('Invalid response from server');
            }
        } catch (error) {
            console.error('Error loading folders:', error);
            console.log('Current tab when error occurred in loadFolders:', window.app?.currentTab);
            window.tabSwitchMonitor?.log(`loadFolders error: ${error.message}`);
            this.showError('Failed to load folders: ' + error.message);
        } finally {
            this.isLoading = false;
            console.log('loadFolders finally block - Current tab:', window.app?.currentTab);
            window.tabSwitchMonitor?.log('loadFolders completed');
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

        console.log('renderFolders starting');
        console.log('Current tab at start of renderFolders:', window.app?.currentTab);
        window.tabSwitchMonitor?.log('renderFolders starting');

        this.foldersGrid.innerHTML = '';

        const folderNames = Object.keys(this.folders);
        console.log('Number of folders to render:', folderNames.length);
        
        if (folderNames.length === 0) {
            console.log('No folders found, showing empty state');
            console.log('Current tab before showEmptyState:', window.app?.currentTab);
            window.tabSwitchMonitor?.log('Showing empty state');
            this.showEmptyState();
            console.log('Current tab after showEmptyState:', window.app?.currentTab);
            window.tabSwitchMonitor?.log('Empty state shown');
            return;
        }

        console.log('Rendering folders:', folderNames);
        window.tabSwitchMonitor?.log(`Rendering ${folderNames.length} folders`);
        
        // Sort folders by name
        folderNames.sort().forEach(folderName => {
            const folderData = this.folders[folderName];
            const folderElement = this.createFolderElement(folderName, folderData);
            this.foldersGrid.appendChild(folderElement);
        });
        
        console.log('renderFolders completed');
        console.log('Current tab after renderFolders:', window.app?.currentTab);
        window.tabSwitchMonitor?.log('renderFolders completed');
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
                <button type="button" class="btn btn-sm btn-primary view-folder-btn" data-folder="${this.escapeHtml(folderName)}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button type="button" class="btn btn-sm btn-secondary download-folder-btn" data-folder="${this.escapeHtml(folderName)}">
                    <i class="fas fa-download"></i> Download
                </button>
                <button type="button" class="btn btn-sm btn-danger delete-folder-btn" data-folder="${this.escapeHtml(folderName)}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        // Add event listeners
        const viewBtn = folderDiv.querySelector('.view-folder-btn');
        const downloadBtn = folderDiv.querySelector('.download-folder-btn');
        const deleteBtn = folderDiv.querySelector('.delete-folder-btn');

        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.viewFolder(folderName);
        });

        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.downloadFolder(folderName);
        });

        deleteBtn.addEventListener('click', (e) => {
            console.log('=== DELETE BUTTON CLICKED ===');
            
            // Prevent ALL possible default behaviors
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('Calling deleteFolder for:', folderName);
            this.deleteFolder(folderName);
            
            // Return false to prevent any default action
            return false;
        });

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
     * Get the actual current tab from DOM instead of app state
     */
    getActualCurrentTab() {
        const activeNavBtn = document.querySelector('.nav-btn.active');
        return activeNavBtn ? activeNavBtn.dataset.tab : 'upload';
    }

    /**
     * Ensure we're actually on the folders tab
     */
    ensureFoldersTab() {
        const actualTab = this.getActualCurrentTab();
        console.log('Actual tab from DOM:', actualTab);
        console.log('App current tab:', window.app?.currentTab);
        
        if (actualTab !== 'folders') {
            console.log('DOM shows we are not on folders tab, switching...');
            // Click the folders tab button directly
            const foldersBtn = document.querySelector('.nav-btn[data-tab="folders"]');
            if (foldersBtn) {
                foldersBtn.click();
                console.log('Clicked folders tab button');
            }
        }
        
        // Also update app state to match
        if (window.app) {
            window.app.currentTab = 'folders';
            console.log('Updated app.currentTab to folders');
        }
        
        // Start a persistent monitor to keep checking
        if (!this.tabMonitorInterval) {
            this.startTabMonitor();
        }
    }

    /**
     * Start a persistent tab monitor
     */
    startTabMonitor() {
        console.log('Starting persistent tab monitor');
        this.tabMonitorInterval = setInterval(() => {
            const actualTab = this.getActualCurrentTab();
            if (actualTab === 'folders' && window.app?.currentTab !== 'folders') {
                console.log('TAB MONITOR: Correcting app state - DOM shows folders but app thinks', window.app.currentTab);
                window.app.currentTab = 'folders';
            } else if (actualTab !== 'folders' && window.app?.currentTab === 'folders') {
                console.log('TAB MONITOR: Correcting DOM state - app thinks folders but DOM shows', actualTab);
                const foldersBtn = document.querySelector('.nav-btn[data-tab="folders"]');
                if (foldersBtn) {
                    foldersBtn.click();
                }
            }
        }, 500); // Check every 500ms
    }

    /**
     * Stop the tab monitor
     */
    stopTabMonitor() {
        if (this.tabMonitorInterval) {
            clearInterval(this.tabMonitorInterval);
            this.tabMonitorInterval = null;
            console.log('Stopped tab monitor');
        }
    }
    async deleteFolder(folderName) {
        console.log('=== DELETE FOLDER OPERATION START ===');
        console.log('Folder to delete:', folderName);
        
        // Check actual tab state
        const actualTab = this.getActualCurrentTab();
        console.log('Actual current tab from DOM:', actualTab);
        console.log('App current tab state:', window.app?.currentTab);
        
        // Ensure we're on folders tab before starting
        this.ensureFoldersTab();
        
        window.tabSwitchMonitor?.log('Delete operation starting');
        
        try {
            // Use custom confirmation instead of browser's confirm()
            const shouldDelete = await this.showCustomConfirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`);
            
            console.log('Confirmation result:', shouldDelete);
            window.tabSwitchMonitor?.log(`Confirmation completed: ${shouldDelete}`);
            
            if (!shouldDelete) {
                console.log('Delete operation cancelled by user');
                return;
            }

            console.log('Delete confirmed, proceeding...');
            
            // Enable tab preservation to prevent app reset from switching to upload
            window.app?.preserveTab();
            
            // Ensure we're still on folders tab after confirmation
            this.ensureFoldersTab();
            
            window.tabSwitchMonitor?.log('About to start API call');

            console.log(`Starting deletion of folder: ${folderName}`);
            
            // Show loading state during deletion
            this.showLoading();
            console.log('Loading state shown');
            window.tabSwitchMonitor?.log('Loading state displayed');
            
            console.log('Making API call to delete folder...');
            window.tabSwitchMonitor?.log('API call starting');
            const result = await window.apiService.deleteFolder(folderName);
            
            console.log('API call successful, result:', result);
            window.tabSwitchMonitor?.log('API call completed successfully');
            
            // Ensure we're still on folders tab after API call
            this.ensureFoldersTab();
            
            window.toastManager?.show('success', 'Folder Deleted', `Folder "${folderName}" has been deleted.`);
            console.log('Success toast shown');
            window.tabSwitchMonitor?.log('Success toast displayed');
            
            // Refresh the folders list
            console.log('Refreshing folders list after deletion');
            window.tabSwitchMonitor?.log('About to refresh folders');
            
            await this.refresh();
            
            console.log('Refresh completed');
            window.tabSwitchMonitor?.log('Folders refresh completed');
            
            // Final check - ensure we're still on folders tab
            this.ensureFoldersTab();
            
            // Stop the monitor after a delay to let things settle
            setTimeout(() => {
                this.stopTabMonitor();
                // Disable tab preservation after successful operation
                window.app?.stopPreservingTab();
            }, 3000);
            
            console.log(`Delete operation completed successfully for folder: ${folderName}`);
            window.tabSwitchMonitor?.log('Delete operation completed');
            console.log('=== DELETE FOLDER OPERATION END (SUCCESS) ===');
            
        } catch (error) {
            console.log('=== DELETE FOLDER OPERATION ERROR ===');
            console.error('Error deleting folder:', error);
            window.tabSwitchMonitor?.log(`Error occurred: ${error.message}`);
            
            window.toastManager?.show('error', 'Delete Failed', 'Failed to delete folder: ' + (error.message || 'Unknown error'));
            
            // Ensure we're on folders tab even after error
            this.ensureFoldersTab();
            
            // Try to refresh the folders list even on error
            try {
                await this.refresh();
            } catch (refreshError) {
                console.error('Error refreshing after delete error:', refreshError);
            }
            
            // Disable tab preservation even on error
            window.app?.stopPreservingTab();
            
            console.log('=== DELETE FOLDER OPERATION END (ERROR) ===');
        }
    }

    /**
     * Show custom confirmation dialog
     */
    showCustomConfirm(message) {
        return new Promise((resolve) => {
            // Create modal backdrop
            const backdrop = document.createElement('div');
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            // Create modal dialog
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;

            modal.innerHTML = `
                <h3 style="margin: 0 0 16px 0; color: #333;">Confirm Delete</h3>
                <p style="margin: 0 0 24px 0; color: #666;">${this.escapeHtml(message)}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-btn" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                    <button id="confirm-btn" style="
                        padding: 8px 16px;
                        border: none;
                        background: #ef4444;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Delete</button>
                </div>
            `;

            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);

            // Handle button clicks
            const cancelBtn = modal.querySelector('#cancel-btn');
            const confirmBtn = modal.querySelector('#confirm-btn');

            const cleanup = () => {
                document.body.removeChild(backdrop);
            };

            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cleanup();
                resolve(false);
            });

            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cleanup();
                resolve(true);
            });

            // Close on backdrop click
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    e.preventDefault();
                    e.stopPropagation();
                    cleanup();
                    resolve(false);
                }
            });
        });
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
                    <p><em>Go to the Upload tab to start adding pictures.</em></p>
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
    async refresh() {
        console.log('Refreshing folders...');
        // Reset the current state
        this.folders = {};
        this.isLoading = false;
        
        // Load folders again
        await this.loadFolders();
    }

    /**
     * Force refresh folders (for debugging)
     */
    forceRefresh() {
        console.log('Force refresh triggered');
        this.isLoading = false;
        this.folders = {};
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
    // Add page refresh detection
    console.log('=== PAGE LOADED/REFRESHED ===');
    console.log('Performance navigation type:', performance.navigation?.type);
    console.log('Document readyState:', document.readyState);
    
    // Monitor ALL tab changes globally
    const originalLog = console.log;
    window.tabSwitchMonitor = {
        log: (message) => {
            originalLog(`[TAB MONITOR] ${message}`);
        }
    };
    
    // Add a small delay to ensure all other scripts are loaded
    setTimeout(() => {
        window.foldersManager = new FoldersManager();
        console.log('Folders manager initialized');
        
        // Override the app's switchTab method to log all calls
        if (window.app && window.app.switchTab) {
            const originalSwitchTab = window.app.switchTab.bind(window.app);
            window.app.switchTab = function(tabName) {
                const stack = new Error().stack;
                window.tabSwitchMonitor.log(`switchTab called: ${window.app.currentTab} -> ${tabName}`);
                window.tabSwitchMonitor.log(`Call stack: ${stack}`);
                
                // If someone tries to switch to upload when we should be on folders, block it
                if (tabName === 'upload' && window.foldersManager && document.querySelector('.nav-btn[data-tab="folders"]')?.classList.contains('active')) {
                    window.tabSwitchMonitor.log('BLOCKING: Attempted switch to upload while folders tab is active');
                    console.warn('BLOCKED: Attempted to switch to upload while on folders tab');
                    return false;
                }
                
                return originalSwitchTab(tabName);
            };
        }
    }, 100);
});
