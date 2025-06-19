const API_BASE = 'http://localhost:8000/pictures';
let currentReplaceFilename = null;

// Show status message
function showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

// Show file preview before upload
function showFilePreview() {
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('filePreview');
    const files = fileInput.files;
    
    if (files.length === 0) {
        preview.innerHTML = '';
        return;
    }
    
    preview.innerHTML = `
        <h3>Selected Files (${files.length}):</h3>
        <div class="file-list">
            ${Array.from(files).map((file, index) => `
                <div class="file-item">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                    <button type="button" onclick="removeFile(${index})" class="btn-remove">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Remove file from selection
function removeFile(index) {
    const fileInput = document.getElementById('fileInput');
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    
    fileInput.files = dt.files;
    showFilePreview();
}

// Upload files with automatic numbering for duplicates
async function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showStatus('Please select files to upload', 'error');
        return;
    }
    
    // Show upload progress
    const uploadBtn = document.querySelector('button[onclick="uploadFiles()"]');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    const formData = new FormData();
    for (let file of files) {
        formData.append('files', file);
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            let message = `${result.uploaded.length} file(s) uploaded successfully!`;
            
            // Check for renamed files
            const renamedFiles = result.uploaded.filter(file => file.renamed);
            if (renamedFiles.length > 0) {
                const renamedList = renamedFiles.map(file => 
                    `${file.original_name} → ${file.filename}`
                ).join(', ');
                message += `\n📝 Renamed files: ${renamedList}`;
                showStatus(message, 'warning');
            } else {
                showStatus(message);
            }
            
            if (result.errors && result.errors.length > 0) {
                message += `\n⚠️ Errors: ${result.errors.join(', ')}`;
                showStatus(message, 'warning');
            }
            
            fileInput.value = '';
            document.getElementById('filePreview').innerHTML = '';
            loadPictures();
        } else {
            showStatus('Upload failed: ' + (result.detail || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Upload error: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
    }
}

// Enhanced download function with location chooser
async function downloadPicture(filename) {
    try {
        // Show downloading status
        showStatus(`Preparing download for ${filename}...`, 'info');
        
        // Check if the File System Access API is supported (Chrome/Edge)
        if ('showSaveFilePicker' in window) {
            await downloadWithSaveDialog(filename);
        } else {
            // Fallback to traditional download
            await downloadTraditional(filename);
        }
        
    } catch (error) {
        console.error('Download error:', error);
        if (error.name === 'AbortError') {
            showStatus('Download cancelled by user', 'info');
        } else {
            showStatus(`Download failed: ${error.message}`, 'error');
            // Try fallback method
            await downloadTraditional(filename);
        }
    }
}

// Download with save dialog (modern browsers)
async function downloadWithSaveDialog(filename) {
    try {
        // Get file extension
        const fileExtension = filename.split('.').pop().toLowerCase();
        
        // Define file type based on extension
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'svg': 'image/svg+xml'
        };
        
        const mimeType = mimeTypes[fileExtension] || 'image/*';
        
        // Show save dialog
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: 'Image files',
                accept: {
                    [mimeType]: [`.${fileExtension}`]
                }
            }]
        });
        
        // Fetch the file from server
        showStatus(`Downloading ${filename}...`, 'info');
        const response = await fetch(`${API_BASE}/${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        // Get the file data
        const arrayBuffer = await response.arrayBuffer();
        
        // Write to the chosen location
        const writable = await fileHandle.createWritable();
        await writable.write(arrayBuffer);
        await writable.close();
        
        showStatus(`${filename} saved successfully!`);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error; // Re-throw to handle in parent function
        }
        throw new Error(`Save dialog error: ${error.message}`);
    }
}

// Traditional download (fallback)
async function downloadTraditional(filename) {
    try {
        showStatus(`Downloading ${filename}...`, 'info');
        
        // Fetch the file
        const response = await fetch(`${API_BASE}/${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        // Get the blob data
        const blob = await response.blob();
        
        // Create download URL
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        
        showStatus(`${filename} downloaded to default location!`);
        
    } catch (error) {
        throw new Error(`Traditional download error: ${error.message}`);
    }
}

// Download all pictures with location chooser
async function downloadAllPictures() {
    try {
        // Get list of pictures
        const response = await fetch(API_BASE);
        const data = await response.json();
        const pictures = data.pictures || [];
        
        if (pictures.length === 0) {
            showStatus('No pictures to download', 'warning');
            return;
        }
        
        if (!confirm(`Download all ${pictures.length} pictures?`)) {
            return;
        }
        
        // Check if directory picker is supported
        if ('showDirectoryPicker' in window) {
            await downloadAllToDirectory(pictures);
        } else {
            // Download one by one with traditional method
            showStatus(`Downloading ${pictures.length} pictures...`, 'info');
            for (const picture of pictures) {
                await downloadTraditional(picture);
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            showStatus(`All ${pictures.length} pictures downloaded!`);
        }
        
    } catch (error) {
        console.error('Download all error:', error);
        if (error.name === 'AbortError') {
            showStatus('Download cancelled by user', 'info');
        } else {
            showStatus(`Download all failed: ${error.message}`, 'error');
        }
    }
}

// Download all pictures to a chosen directory
async function downloadAllToDirectory(pictures) {
    try {
        // Show directory picker
        const directoryHandle = await window.showDirectoryPicker();
        
        showStatus(`Downloading ${pictures.length} pictures to selected folder...`, 'info');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const filename of pictures) {
            try {
                // Fetch the file
                const response = await fetch(`${API_BASE}/${filename}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filename}`);
                }
                
                // Get file data
                const arrayBuffer = await response.arrayBuffer();
                
                // Create file in chosen directory
                const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(arrayBuffer);
                await writable.close();
                
                successCount++;
                
            } catch (error) {
                console.error(`Error downloading ${filename}:`, error);
                errorCount++;
            }
        }
        
        if (errorCount === 0) {
            showStatus(`All ${successCount} pictures downloaded successfully!`);
        } else {
            showStatus(`${successCount} pictures downloaded, ${errorCount} failed`, 'warning');
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error; // Re-throw to handle in parent function
        }
        throw new Error(`Directory download error: ${error.message}`);
    }
}

// Trigger replace file selection
function replacePicture(filename) {
    currentReplaceFilename = filename;
    const replaceFileInput = document.getElementById('replaceFileInput');
    replaceFileInput.click();
}

// Handle replace file selection
async function handleReplaceFile(event) {
    const file = event.target.files[0];
    if (!file || !currentReplaceFilename) return;
    
    if (!file.type.startsWith('image/')) {
        showStatus('Please select an image file', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to replace "${currentReplaceFilename}" with "${file.name}"?`)) {
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/${currentReplaceFilename}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            showStatus(`${currentReplaceFilename} replaced successfully!`);
            loadPictures();
        } else {
            const result = await response.json();
            showStatus('Replace failed: ' + (result.detail || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Replace error: ' + error.message, 'error');
    } finally {
        // Clear the file input
        event.target.value = '';
        currentReplaceFilename = null;
    }
}

// Load and display pictures
async function loadPictures() {
    const pictureList = document.getElementById('pictureList');
    pictureList.innerHTML = '<div class="loading">Loading pictures...</div>';
    
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        
        if (data.pictures && data.pictures.length > 0) {
            pictureList.innerHTML = data.pictures.map(filename => `
                <div class="picture-item">
                    <img src="${API_BASE}/${filename}" alt="${filename}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='">
                    <h3>${filename}</h3>
                    <div class="picture-actions">
                        <button class="btn-download" onclick="downloadPicture('${filename}')" title="Choose location and download ${filename}">
                            📥 Download
                        </button>
                        <button class="btn-replace" onclick="replacePicture('${filename}')" title="Replace ${filename}">
                            🔄 Replace
                        </button>
                        <button class="btn-delete" onclick="deletePicture('${filename}')" title="Delete ${filename}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            pictureList.innerHTML = '<div class="loading">No pictures found</div>';
        }
    } catch (error) {
        pictureList.innerHTML = '<div class="loading">Error loading pictures</div>';
        showStatus('Error loading pictures: ' + error.message, 'error');
    }
}

// Delete picture
async function deletePicture(filename) {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([filename])
        });
        
        if (response.ok) {
            showStatus(`${filename} deleted successfully!`);
            loadPictures();
        } else {
            showStatus('Delete failed', 'error');
        }
    } catch (error) {
        showStatus('Delete error: ' + error.message, 'error');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadPictures();
    
    const fileInput = document.getElementById('fileInput');
    const replaceFileInput = document.getElementById('replaceFileInput');
    
    fileInput.addEventListener('change', showFilePreview);
    replaceFileInput.addEventListener('change', handleReplaceFile);
});