// API Configuration
const API_CONFIG = {
    // Automatically detect if we're running on Live Server or served from FastAPI
    BASE_URL: (() => {
        const currentHost = window.location.host;
        // If running on Live Server (usually port 5500) or other development server
        if (currentHost.includes(':5500') || currentHost.includes(':3000') || currentHost.includes('127.0.0.1:5500')) {
            return 'http://localhost:8000';  // Backend API server
        }
        // If served from FastAPI directly
        return window.location.origin;
    })(),
    ENDPOINTS: {
        UPLOAD: '/pictures',
        FOLDERS: '/folders',
        PICTURES: '/pictures'
    }
};

// File Configuration
const FILE_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
};

// UI Configuration
const UI_CONFIG = {
    TOAST_DURATION: 4000,
    LOADING_DELAY: 300,
    ANIMATION_DURATION: 200
};

// Status Messages
const MESSAGES = {
    SUCCESS: {
        UPLOAD: 'Files uploaded successfully!',
        DELETE: 'Item deleted successfully!',
        UPDATE: 'Item updated successfully!'
    },
    ERROR: {
        UPLOAD_FAILED: 'Failed to upload files. Please try again.',
        DELETE_FAILED: 'Failed to delete item. Please try again.',
        FETCH_FAILED: 'Failed to load data. Please refresh the page.',
        INVALID_FILE: 'Invalid file type or size.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        SERVER_ERROR: 'Server error. Please try again later.'
    },
    INFO: {
        DRAG_DROP: 'Drop files here to upload',
        NO_FILES: 'No files selected',
        LOADING: 'Loading...',
        PROCESSING: 'Processing...'
    }
};

// Event Names
const EVENTS = {
    FILE_SELECTED: 'fileSelected',
    UPLOAD_PROGRESS: 'uploadProgress',
    UPLOAD_COMPLETE: 'uploadComplete',
    GALLERY_UPDATED: 'galleryUpdated',
    FOLDER_SELECTED: 'folderSelected'
};
