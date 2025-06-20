// Toast Component

class ToastManager {
    constructor() {
        this.toasts = new Map();
        this.init();
    }

    init() {
        this.setupElements();
    }

    setupElements() {
        this.container = document.getElementById('toast-container');
    }

    /**
     * Show a toast notification
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-hide duration (0 = no auto-hide)
     * @returns {string} - Toast ID
     */
    show(type = 'info', title = '', message = '', duration = UI_CONFIG.TOAST_DURATION) {
        const id = generateId();
        const toast = this.createToast(id, type, title, message);
        
        this.container.appendChild(toast);
        this.toasts.set(id, { element: toast, timer: null });
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        // Auto-hide
        if (duration > 0) {
            const timer = setTimeout(() => {
                this.hide(id);
            }, duration);
            
            this.toasts.get(id).timer = timer;
        }
        
        return id;
    }

    /**
     * Create toast element
     * @param {string} id - Toast ID
     * @param {string} type - Toast type
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @returns {Element} - Toast element
     */
    createToast(id, type, title, message) {
        const toast = createElement('div', {
            className: `toast ${type}`,
            'data-toast-id': id
        });
        
        // Initial styles for animation
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-out';
        
        // Icon
        const icon = this.getIcon(type);
        const iconElement = createElement('div', {
            className: 'toast-icon',
            innerHTML: `<i class="${icon}"></i>`
        });
        
        // Content
        const content = createElement('div', { className: 'toast-content' });
        
        if (title) {
            content.appendChild(createElement('div', {
                className: 'toast-title',
                textContent: title
            }));
        }
        
        if (message) {
            content.appendChild(createElement('div', {
                className: 'toast-message',
                textContent: message
            }));
        }
        
        // Close button
        const closeBtn = createElement('button', {
            className: 'toast-close',
            innerHTML: '<i class="fas fa-times"></i>',
            title: 'Close'
        });
        
        closeBtn.addEventListener('click', () => {
            this.hide(id);
        });
        
        toast.appendChild(iconElement);
        toast.appendChild(content);
        toast.appendChild(closeBtn);
        
        return toast;
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} - Icon class
     */
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Hide toast
     * @param {string} id - Toast ID
     */
    hide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;
        
        const { element, timer } = toastData;
        
        // Clear timer
        if (timer) {
            clearTimeout(timer);
        }
        
        // Animate out
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
        }, 300);
    }

    /**
     * Hide all toasts
     */
    hideAll() {
        Array.from(this.toasts.keys()).forEach(id => {
            this.hide(id);
        });
    }

    /**
     * Show success toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-hide duration
     * @returns {string} - Toast ID
     */
    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    /**
     * Show error toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-hide duration (default: no auto-hide)
     * @returns {string} - Toast ID
     */
    error(title, message, duration = 0) {
        return this.show('error', title, message, duration);
    }

    /**
     * Show warning toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-hide duration
     * @returns {string} - Toast ID
     */
    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    /**
     * Show info toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-hide duration
     * @returns {string} - Toast ID
     */
    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }

    /**
     * Update existing toast
     * @param {string} id - Toast ID
     * @param {object} updates - Updates to apply
     */
    update(id, updates) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;
        
        const { element } = toastData;
        
        if (updates.title) {
            const titleElement = element.querySelector('.toast-title');
            if (titleElement) {
                titleElement.textContent = updates.title;
            }
        }
        
        if (updates.message) {
            const messageElement = element.querySelector('.toast-message');
            if (messageElement) {
                messageElement.textContent = updates.message;
            }
        }
        
        if (updates.type) {
            // Update toast class
            element.className = `toast ${updates.type}`;
            
            // Update icon
            const iconElement = element.querySelector('.toast-icon i');
            if (iconElement) {
                iconElement.className = this.getIcon(updates.type);
            }
        }
    }

    /**
     * Get count of active toasts
     * @returns {number} - Toast count
     */
    getCount() {
        return this.toasts.size;
    }

    /**
     * Check if toast exists
     * @param {string} id - Toast ID
     * @returns {boolean} - Exists
     */
    exists(id) {
        return this.toasts.has(id);
    }
}

// Initialize toast manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.toastManager = new ToastManager();
});
