// Utility Functions

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @returns {object} - Validation result
 */
function validateFile(file) {
    const errors = [];
    
    // Check file type
    if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
            errors.push(`Invalid file type: ${file.type || 'unknown'}`);
        }
    }
    
    // Check file size
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
        errors.push(`File too large: ${formatFileSize(file.size)} (max: ${formatFileSize(FILE_CONFIG.MAX_FILE_SIZE)})`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Create a preview URL for an image file
 * @param {File} file - Image file
 * @returns {Promise<string>} - Preview URL
 */
function createPreviewUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize filename for display
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
}

/**
 * Format date to human readable format
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 */
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension
 */
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is an image
 * @param {string} filename - Filename
 * @returns {boolean} - Is image file
 */
function isImageFile(filename) {
    const extension = getFileExtension(filename);
    return FILE_CONFIG.ALLOWED_EXTENSIONS.includes('.' + extension);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag
 * @param {object} attributes - Element attributes
 * @param {string|Element} content - Element content
 * @returns {Element} - Created element
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * Show/hide loading state
 * @param {boolean} show - Show or hide loading
 */
function toggleLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

/**
 * Handle errors gracefully
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let message = MESSAGES.ERROR.SERVER_ERROR;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = MESSAGES.ERROR.NETWORK_ERROR;
    } else if (error.response) {
        // HTTP error
        switch (error.response.status) {
            case 404:
                message = 'Item not found';
                break;
            case 413:
                message = 'File too large';
                break;
            case 422:
                message = 'Invalid file format';
                break;
            case 500:
                message = MESSAGES.ERROR.SERVER_ERROR;
                break;
            default:
                message = `Server error: ${error.response.status}`;
        }
    }
    
    window.toastManager?.show('error', 'Error', message);
}

/**
 * Custom event emitter
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Global event emitter instance
window.eventBus = new EventEmitter();
