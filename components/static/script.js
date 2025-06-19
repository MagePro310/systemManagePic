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

// Check for existing files and show warnings
async function checkExistingFiles() {
    const fileInput = document.getElementById('fileInput');
    const replaceCheckbox = document.getElementById('replaceCheckbox');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) return;
    
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        const existingFiles = data.pictures || [];
        
        const duplicates = files.filter(file => 
            existingFiles.includes(file.name)
        );
        
        if (duplicates.length > 0 && !replaceCheckbox.checked) {
            const duplicateNames = duplicates.map(f => f.name).join(', ');
            showStatus(
                `Warning: Files already exist: ${duplicateNames}. New names will be generated unless you check "Replace existing files".`, 
                'warning'
            );
        }
    } catch (error) {
        console.error('Error checking existing files:', error);
    }
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

// Upload files with progress and replace option
async function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const replaceCheckbox = document.getElementById('replaceCheckbox');
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
    formData.append('replace', replaceCheckbox.checked);
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            let message = '';
            const uploadedCount = result.uploaded?.length || 0;
            const replacedCount = result.replaced?.length || 0;
            
            if (uploadedCount > 0) {
                message += `${uploadedCount} new file(s) uploaded. `;
            }
            if (replacedCount > 0) {
                message += `${replacedCount} file(s) replaced. `;
            }
            
            if (result.errors && result.errors.length > 0) {
                message += `\nWarnings: ${result.errors.join(', ')}`;
                showStatus(message, 'warning');
            } else {
                showStatus(message || 'Upload completed successfully!');
            }
            
            fileInput.value = '';
            replaceCheckbox.checked = false;
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
                        <button class="btn-download" onclick="downloadPicture('${filename}')">Download</button>
                        <button class="btn-replace" onclick="replacePicture('${filename}')">Replace</button>
                        <button class="btn-delete" onclick="deletePicture('${filename}')">Delete</button>
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

// Download picture
function downloadPicture(filename) {
    const link = document.createElement('a');
    link.href = `${API_BASE}/${filename}`;
    link.download = filename;
    link.click();
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
    const replaceCheckbox = document.getElementById('replaceCheckbox');
    const replaceFileInput = document.getElementById('replaceFileInput');
    
    fileInput.addEventListener('change', function() {
        showFilePreview();
        checkExistingFiles();
    });
    
    replaceCheckbox.addEventListener('change', checkExistingFiles);
    replaceFileInput.addEventListener('change', handleReplaceFile);
});