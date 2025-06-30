// DOM Utility Functions

/**
 * Create an element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {object} attributes - Element attributes
 * @param {string|Element} content - Element content
 * @returns {Element} - Created element
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Set content
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    } else if (Array.isArray(content)) {
        content.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Add multiple CSS classes to an element
 * @param {Element} element - Target element
 * @param {...string} classes - CSS classes to add
 */
function addClasses(element, ...classes) {
    element.classList.add(...classes);
}

/**
 * Remove multiple CSS classes from an element
 * @param {Element} element - Target element
 * @param {...string} classes - CSS classes to remove
 */
function removeClasses(element, ...classes) {
    element.classList.remove(...classes);
}

/**
 * Toggle multiple CSS classes on an element
 * @param {Element} element - Target element
 * @param {...string} classes - CSS classes to toggle
 */
function toggleClasses(element, ...classes) {
    classes.forEach(cls => element.classList.toggle(cls));
}

/**
 * Show an element by removing 'hidden' class and adding 'visible' class
 * @param {Element} element - Element to show
 */
function showElement(element) {
    removeClasses(element, 'hidden');
    addClasses(element, 'visible');
}

/**
 * Hide an element by removing 'visible' class and adding 'hidden' class
 * @param {Element} element - Element to hide
 */
function hideElement(element) {
    removeClasses(element, 'visible');
    addClasses(element, 'hidden');
}

/**
 * Clear all children from an element
 * @param {Element} element - Element to clear
 */
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Create a button element with common styling
 * @param {string} text - Button text
 * @param {string} variant - Button variant (primary, secondary, danger)
 * @param {object} attributes - Additional attributes
 * @returns {Element} - Button element
 */
function createButton(text, variant = 'primary', attributes = {}) {
    const classes = ['btn', `btn-${variant}`];
    if (attributes.className) {
        classes.push(attributes.className);
        delete attributes.className;
    }
    
    return createElement('button', {
        ...attributes,
        className: classes.join(' ')
    }, text);
}

/**
 * Create an icon element
 * @param {string} iconClass - Font Awesome icon class
 * @param {object} attributes - Additional attributes
 * @returns {Element} - Icon element
 */
function createIcon(iconClass, attributes = {}) {
    return createElement('i', {
        ...attributes,
        className: `fas ${iconClass} ${attributes.className || ''}`
    });
}
