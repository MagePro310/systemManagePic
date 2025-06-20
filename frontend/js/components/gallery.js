// Gallery Component

class GalleryManager {
    constructor() {
        this.pictures = [];
        this.filteredPictures = [];
        this.currentFilter = '';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.galleryGrid = document.getElementById('gallery-grid');
        this.folderFilter = document.getElementById('folder-filter');
        this.refreshBtn = document.getElementById('refresh-gallery');
    }

    setupEventListeners() {
        // Refresh button
        this.refreshBtn.addEventListener('click', () => {
            this.refresh();
        });

        // Folder filter change
        this.folderFilter.addEventListener('change', (e) => {
            this.filterByFolder(e.target.value);
        });

        // Listen for upload completion
        window.eventBus.on(EVENTS.UPLOAD_COMPLETE, () => {
            this.refresh();
        });
    }

    /**
     * Load all pictures from server
     */
    async loadPictures() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const response = await window.apiService.getAllPictures();
            this.pictures = response.pictures || [];
            this.updateFolderFilter();
            this.filterByFolder(this.currentFilter);
        } catch (error) {
            handleError(error, 'gallery load');
            this.showError('Failed to load gallery');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update folder filter dropdown
     */
    updateFolderFilter() {
        const folders = [...new Set(this.pictures.map(pic => pic.folderName))].sort();
        
        this.folderFilter.innerHTML = '<option value="">All Folders</option>';
        
        folders.forEach(folder => {
            const option = createElement('option', {
                value: folder,
                textContent: folder
            });
            this.folderFilter.appendChild(option);
        });
    }

    /**
     * Filter pictures by folder
     * @param {string} folderName - Folder to filter by
     */
    filterByFolder(folderName) {
        this.currentFilter = folderName;
        
        if (folderName) {
            this.filteredPictures = this.pictures.filter(pic => pic.folderName === folderName);
        } else {
            this.filteredPictures = [...this.pictures];
        }
        
        this.renderPictures();
    }

    /**
     * Render pictures in the gallery
     */
    renderPictures() {
        this.galleryGrid.innerHTML = '';

        if (this.filteredPictures.length === 0) {
            this.showEmptyState();
            return;
        }

        this.filteredPictures.forEach(picture => {
            const pictureElement = this.createPictureElement(picture);
            this.galleryGrid.appendChild(pictureElement);
        });
    }

    /**
     * Create picture element
     * @param {object} picture - Picture data
     * @returns {Element} - Picture element
     */
    createPictureElement(picture) {
        const item = createElement('div', { className: 'gallery-item' });
        
        // Picture image
        const img = createElement('img', {
            className: 'gallery-image',
            src: picture.url,
            alt: picture.filename,
            loading: 'lazy'
        });

        // Handle image load error
        img.addEventListener('error', () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        });

        // Picture info
        const info = createElement('div', { className: 'gallery-info' });
        info.appendChild(createElement('h4', {}, escapeHtml(picture.filename)));
        info.appendChild(createElement('p', {}, `${escapeHtml(picture.folderName)} • ${formatFileSize(picture.size)}`));

        // Actions
        const actions = createElement('div', { className: 'gallery-actions' });
        
        const viewBtn = createElement('button', {
            className: 'btn btn-primary',
            innerHTML: '<i class="fas fa-eye"></i> View'
        });
        
        const downloadBtn = createElement('button', {
            className: 'btn btn-secondary',
            innerHTML: '<i class="fas fa-download"></i> Download'
        });
        
        const deleteBtn = createElement('button', {
            className: 'btn btn-danger',
            innerHTML: '<i class="fas fa-trash"></i> Delete'
        });

        // Event listeners
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewPicture(picture);
        });

        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadPicture(picture);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deletePicture(picture);
        });

        // Click to view
        item.addEventListener('click', () => {
            this.viewPicture(picture);
        });

        actions.appendChild(viewBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(deleteBtn);
        
        info.appendChild(actions);

        item.appendChild(img);
        item.appendChild(info);

        return item;
    }

    /**
     * View picture in modal
     * @param {object} picture - Picture data
     */
    viewPicture(picture) {
        window.modalManager?.showImage(picture.url, picture.filename, {
            download: () => this.downloadPicture(picture),
            delete: () => this.deletePicture(picture)
        });
    }

    /**
     * Download picture
     * @param {object} picture - Picture data
     */
    async downloadPicture(picture) {
        try {
            toggleLoading(true);
            await window.apiService.downloadPicture(picture.folderName, picture.filename);
            window.toastManager?.show('success', 'Download', `Downloaded ${picture.filename}`);
        } catch (error) {
            handleError(error, 'download');
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Delete picture
     * @param {object} picture - Picture data
     */
    async deletePicture(picture) {
        const confirmed = confirm(`Are you sure you want to delete "${picture.filename}"?`);
        if (!confirmed) return;

        try {
            toggleLoading(true);
            await window.apiService.deletePicture(picture.folderName, picture.filename);
            
            window.toastManager?.show('success', 'Deleted', `Deleted ${picture.filename}`);
            
            // Remove from local arrays
            this.pictures = this.pictures.filter(p => 
                !(p.folderName === picture.folderName && p.filename === picture.filename)
            );
            this.filterByFolder(this.currentFilter);
            
            // Update other components
            window.foldersManager?.refresh();
            
        } catch (error) {
            handleError(error, 'delete picture');
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Loading Gallery...</h3>
                <p>Please wait while we load your pictures.</p>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const message = this.currentFilter 
            ? `No pictures found in "${this.currentFilter}" folder`
            : 'No pictures uploaded yet';
            
        const actionText = this.currentFilter
            ? 'Try selecting a different folder or upload some pictures to this folder.'
            : 'Upload some pictures to get started!';

        this.galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>${message}</h3>
                <p>${actionText}</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Gallery</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="window.galleryManager.refresh()">
                    <i class="fas fa-retry"></i> Try Again
                </button>
            </div>
        `;
    }

    /**
     * Refresh gallery
     */
    refresh() {
        this.loadPictures();
    }

    /**
     * Get current state
     * @returns {object} - Current state
     */
    getState() {
        return {
            pictureCount: this.pictures.length,
            filteredCount: this.filteredPictures.length,
            currentFilter: this.currentFilter,
            isLoading: this.isLoading
        };
    }
}

// Initialize gallery manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.galleryManager = new GalleryManager();
});
