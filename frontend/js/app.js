// Main Application Controller

class PictureManagerApp {
    constructor() {
        this.currentTab = 'upload';
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initializeApp();
    }

    setupElements() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
    }

    setupEventListeners() {
        // Navigation buttons
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    /**
     * Initialize the application
     */
    async initializeApp() {
        try {
            toggleLoading(true);
            
            // Check server health
            const health = await window.apiService.checkHealth();
            if (health.status !== 'healthy') {
                throw new Error('Server is not available');
            }

            // Load initial data for all components
            await this.loadInitialData();
            
            // Set default tab
            this.switchTab(this.currentTab);
            
            this.isInitialized = true;
            
            window.toastManager?.success('Welcome', 'Picture Manager is ready!');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showInitializationError(error);
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        const promises = [];
        
        // Load gallery data
        if (window.galleryManager) {
            promises.push(window.galleryManager.loadPictures());
        }
        
        // Load folders data
        if (window.foldersManager) {
            promises.push(window.foldersManager.loadFolders());
        }
        
        await Promise.allSettled(promises);
    }

    /**
     * Switch between tabs
     * @param {string} tabName - Tab name to switch to
     */
    switchTab(tabName) {
        // Update navigation buttons
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;

        // Trigger tab-specific actions
        this.handleTabSwitch(tabName);
    }

    /**
     * Handle tab switch actions
     * @param {string} tabName - Active tab name
     */
    handleTabSwitch(tabName) {
        switch (tabName) {
            case 'gallery':
                // Refresh gallery if needed
                if (window.galleryManager && !window.galleryManager.isLoading) {
                    // Only refresh if gallery is empty or outdated
                    const state = window.galleryManager.getState();
                    if (state.pictureCount === 0) {
                        window.galleryManager.refresh();
                    }
                }
                break;
                
            case 'folders':
                // Refresh folders if needed
                if (window.foldersManager && !window.foldersManager.isLoading) {
                    const state = window.foldersManager.getState();
                    if (state.folderCount === 0) {
                        window.foldersManager.refresh();
                    }
                }
                break;
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd key combinations
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.switchTab('upload');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchTab('gallery');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchTab('folders');
                    break;
                case 'r':
                    e.preventDefault();
                    this.refreshCurrentTab();
                    break;
            }
        }

        // Function keys
        switch (e.key) {
            case 'F5':
                e.preventDefault();
                this.refreshCurrentTab();
                break;
        }
    }

    /**
     * Refresh current tab
     */
    refreshCurrentTab() {
        switch (this.currentTab) {
            case 'gallery':
                window.galleryManager?.refresh();
                break;
            case 'folders':
                window.foldersManager?.refresh();
                break;
            case 'upload':
                window.uploadManager?.reset();
                break;
        }
    }

    /**
     * Handle before unload
     * @param {BeforeUnloadEvent} e - Before unload event
     */
    handleBeforeUnload(e) {
        // Check if upload is in progress
        if (window.uploadManager?.getState().isUploading) {
            e.preventDefault();
            e.returnValue = 'Upload is in progress. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Handle online/offline status
     * @param {boolean} isOnline - Online status
     */
    handleOnlineStatus(isOnline) {
        if (isOnline) {
            window.toastManager?.success('Connected', 'You are back online');
            // Retry failed operations if any
            this.retryFailedOperations();
        } else {
            window.toastManager?.warning('Offline', 'You are currently offline. Some features may not work.');
        }
    }

    /**
     * Retry failed operations
     */
    retryFailedOperations() {
        // Refresh current tab data
        this.refreshCurrentTab();
    }

    /**
     * Handle global errors
     * @param {ErrorEvent} e - Error event
     */
    handleGlobalError(e) {
        console.error('Global error:', e.error);
        
        if (!this.isInitialized) {
            this.showInitializationError(e.error);
        } else {
            window.toastManager?.error('Error', 'An unexpected error occurred');
        }
    }

    /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} e - Promise rejection event
     */
    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Don't show toast for network errors (they're handled elsewhere)
        if (!e.reason?.message?.includes('fetch')) {
            window.toastManager?.error('Error', 'An unexpected error occurred');
        }
    }

    /**
     * Show initialization error
     * @param {Error} error - Error object
     */
    showInitializationError(error) {
        const errorMessage = error.message || 'Failed to initialize application';
        
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1 style="color: #ef4444; margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                        Failed to Load
                    </h1>
                    <p style="color: #6b7280; margin-bottom: 2rem; max-width: 400px;">
                        ${escapeHtml(errorMessage)}
                    </p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-sync-alt"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get application status
     * @returns {object} - Application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentTab: this.currentTab,
            online: navigator.onLine,
            upload: window.uploadManager?.getState(),
            gallery: window.galleryManager?.getState(),
            folders: window.foldersManager?.getState()
        };
    }

    /**
     * Reset application to initial state
     */
    reset() {
        window.uploadManager?.reset();
        window.galleryManager?.refresh();
        window.foldersManager?.refresh();
        window.toastManager?.hideAll();
        this.switchTab('upload');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PictureManagerApp();
});

// Export for debugging
window.PictureManagerApp = PictureManagerApp;
