// API Service for Picture Management System

class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * Make HTTP request with error handling
     * @param {string} url - Request URL
     * @param {object} options - Fetch options
     * @returns {Promise} - Response data
     */
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.response = response;
                throw error;
            }

            // Check if response has content
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return response;
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - please check your connection');
            }
            throw error;
        }
    }

    /**
     * Upload pictures to the server
     * @param {FileList|Array} files - Files to upload
     * @param {string} folderName - Optional folder name
     * @param {Function} onProgress - Progress callback
     * @returns {Promise} - Upload result
     */
    async uploadPictures(files, folderName = '', onProgress = null) {
        const formData = new FormData();
        
        // Add files to form data
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });
        
        // Add folder name if provided
        if (folderName.trim()) {
            formData.append('folder_name', folderName.trim());
        }

        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed: Network error'));
            });

            xhr.open('POST', `${this.baseUrl}${API_CONFIG.ENDPOINTS.UPLOAD}`);
            xhr.send(formData);
        });
    }

    /**
     * Get list of all folders
     * @returns {Promise} - Folders data
     */
    async getFolders() {
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}`;
        return await this.makeRequest(url);
    }

    /**
     * Get contents of a specific folder
     * @param {string} folderName - Folder name
     * @returns {Promise} - Folder contents
     */
    async getFolderContents(folderName) {
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}/${encodeURIComponent(folderName)}`;
        return await this.makeRequest(url);
    }

    /**
     * Get picture from server
     * @param {string} folderName - Folder name
     * @param {string} filename - Picture filename
     * @returns {Promise} - Picture blob
     */
    async getPicture(folderName, filename) {
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PICTURES}/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
        const response = await this.makeRequest(url);
        return response.blob();
    }

    /**
     * Get picture URL for display
     * @param {string} folderName - Folder name
     * @param {string} filename - Picture filename
     * @returns {string} - Picture URL
     */
    getPictureUrl(folderName, filename) {
        return `${this.baseUrl}${API_CONFIG.ENDPOINTS.PICTURES}/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
    }

    /**
     * Update/replace a picture
     * @param {string} folderName - Folder name
     * @param {string} filename - Picture filename
     * @param {File} file - New file
     * @returns {Promise} - Update result
     */
    async updatePicture(folderName, filename, file) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PICTURES}/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
        
        return await this.makeRequest(url, {
            method: 'PUT',
            body: formData
        });
    }

    /**
     * Delete a picture
     * @param {string} folderName - Folder name
     * @param {string} filename - Picture filename
     * @returns {Promise} - Delete result
     */
    async deletePicture(folderName, filename) {
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PICTURES}/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
        
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * Delete an entire folder
     * @param {string} folderName - Folder name
     * @returns {Promise} - Delete result
     */
    async deleteFolder(folderName) {
        console.log('=== API DELETE FOLDER START ===');
        console.log('Folder name:', folderName);
        
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}/${encodeURIComponent(folderName)}`;
        console.log('Delete URL:', url);
        
        try {
            const result = await this.makeRequest(url, {
                method: 'DELETE'
            });
            
            console.log('=== API DELETE FOLDER SUCCESS ===');
            console.log('Result:', result);
            return result;
            
        } catch (error) {
            console.log('=== API DELETE FOLDER ERROR ===');
            console.error('Delete folder error:', error);
            console.log('Error details:', {
                name: error.name,
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            // Re-throw the error so it can be handled by the caller
            throw error;
        }
    }

    /**
     * Download a picture
     * @param {string} folderName - Folder name
     * @param {string} filename - Picture filename
     */
    async downloadPicture(folderName, filename) {
        try {
            const url = this.getPictureUrl(folderName, filename);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            window.URL.revokeObjectURL(downloadUrl);
            
            return { success: true, filename };
        } catch (error) {
            throw new Error(`Failed to download ${filename}: ${error.message}`);
        }
    }

    /**
     * Check server health
     * @returns {Promise} - Health status
     */
    async checkHealth() {
        try {
            const response = await this.makeRequest(this.baseUrl);
            return { status: 'healthy', data: response };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Get all pictures from all folders (for gallery view)
     * @returns {Promise} - All pictures data
     */
    async getAllPictures() {
        try {
            const foldersResponse = await this.getFolders();
            const allPictures = [];
            
            if (foldersResponse.folders) {
                for (const [folderName, folderData] of Object.entries(foldersResponse.folders)) {
                    if (folderData.pictures && folderData.pictures.length > 0) {
                        folderData.pictures.forEach(picture => {
                            allPictures.push({
                                ...picture,
                                folderName,
                                url: this.getPictureUrl(folderName, picture.filename)
                            });
                        });
                    }
                }
            }
            
            return { pictures: allPictures };
        } catch (error) {
            throw new Error(`Failed to get all pictures: ${error.message}`);
        }
    }

    /**
     * Rename a folder
     * @param {string} folderName - Current folder name
     * @param {string} newName - New folder name
     * @returns {Promise} - Rename result
     */
    async renameFolder(folderName, newName) {
        const formData = new FormData();
        formData.append('new_name', newName);

        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}/${encodeURIComponent(folderName)}/rename`;
        
        return await this.makeRequest(url, {
            method: 'PUT',
            body: formData
        });
    }

    /**
     * Copy a folder
     * @param {string} folderName - Source folder name
     * @param {string} newName - New folder name
     * @returns {Promise} - Copy result
     */
    async copyFolder(folderName, newName) {
        const formData = new FormData();
        formData.append('new_name', newName);

        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}/${encodeURIComponent(folderName)}/copy`;
        
        return await this.makeRequest(url, {
            method: 'POST',
            body: formData
        });
    }

    /**
     * Get detailed folder information
     * @param {string} folderName - Folder name
     * @returns {Promise} - Folder information
     */
    async getFolderInfo(folderName) {
        const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FOLDERS}/${encodeURIComponent(folderName)}/info`;
        return await this.makeRequest(url);
    }
}

// Create global API service instance
window.apiService = new ApiService();
