// Error Handling Utilities

/**
 * Standard error handler for async operations
 * @param {Error} error - The error object
 * @param {string} operation - Description of the operation that failed
 * @param {boolean} showToast - Whether to show a toast notification
 */
function handleAsyncError(error, operation = 'Operation', showToast = true) {
    console.error(`${operation} failed:`, error);
    
    if (showToast && window.toastManager) {
        const message = error.message || 'An unexpected error occurred';
        window.toastManager.error('Error', `${operation} failed: ${message}`);
    }
    
    // Hide loading if it's showing
    if (typeof toggleLoading === 'function') {
        toggleLoading(false);
    }
}

/**
 * Wrapper for async operations with consistent error handling
 * @param {Function} operation - Async operation to execute
 * @param {string} operationName - Name of the operation for error messages
 * @param {boolean} showLoading - Whether to show loading indicator
 * @returns {Promise} - Promise that resolves with operation result or handles error
 */
async function executeWithErrorHandling(operation, operationName = 'Operation', showLoading = true) {
    try {
        if (showLoading && typeof toggleLoading === 'function') {
            toggleLoading(true);
        }
        
        const result = await operation();
        return result;
        
    } catch (error) {
        handleAsyncError(error, operationName);
        throw error; // Re-throw for caller to handle if needed
    } finally {
        if (showLoading && typeof toggleLoading === 'function') {
            toggleLoading(false);
        }
    }
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with operation result
 */
async function retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            }
        }
    }
    
    throw lastError;
}

/**
 * Validate required fields in an object
 * @param {object} data - Data to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} - Validation result with isValid and errors
 */
function validateRequiredFields(data, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            errors.push(`${field} is required`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Debounce function to limit the rate of function calls
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
 * Throttle function to limit the rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
