const API_BASE = 'http://localhost:8000';
let currentReplaceFilename = null;
let currentReplaceFolder = null;

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

// Create new folder
async function createFolder() {
    const folderNameInput = document.getElementById('newFolderInput');
    const folderName = folderNameInput.value.trim();
    
    if (!folderName) {
        showStatus('Please enter a folder name', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('folder_name', folderName);
        
        const response = await fetch(`${API_BASE}/folders`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showStatus(`Folder "${result.folder_name}" created successfully!`);
            folderNameInput.value = '';
            loadFolders();
        } else {
            showStatus('Failed to create folder: ' + (result.detail || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Error creating folder: ' + error.message, 'error');
    }
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

// Upload files to folder
async function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const folderNameInput = document.getElementById('folderNameInput');
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
    
    const folderName = folderNameInput.value.trim();
    if (folderName) {
        formData.append('folder_name', folderName);
    }
    
    try {
        const response = await fetch(`${API_BASE}/pictures`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            let message = `${result.total_files} file(s) uploaded to folder "${result.folder}"!`;
            
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
            folderNameInput.value = '';
            document.getElementById('filePreview').innerHTML = '';
            loadFolders();
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

// Load and display folders
async function loadFolders() {
    const foldersList = document.getElementById('foldersList');
    foldersList.innerHTML = '<div class="loading">Loading folders...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/folders`);
        const data = await response.json();
        
        if (data.folders && Object.keys(data.folders).length > 0) {
            foldersList.innerHTML = Object.values(data.folders).map(folder => `
                <div class="folder-item">
                    <div class="folder-header">
                        <h3>📁 ${folder.name}</h3>
                        <div class="folder-info">
                            <span class="picture-count">${folder.count} picture(s)</span>
                            <button class="btn-delete-folder" onclick="deleteFolder('${folder.name}')" title="Delete folder">
                                🗑️ Delete Folder
                            </button>
                        </div>
                    </div>
                    <div class="folder-pictures">
                        ${folder.pictures.length > 0 ? folder.pictures.map(picture => `
                            <div class="picture-item-small">
                                <img src="${API_BASE}/pictures/${picture.path}" alt="${picture.filename}" 
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='"
                                     title="${picture.filename} (${formatFileSize(picture.size)})">
                                <div class="picture-actions-small">
                                    <button class="btn-download-small" onclick="downloadPicture('${folder.name}', '${picture.filename}')" title="Download">📥</button>
                                    <button class="btn-replace-small" onclick="replacePicture('${folder.name}', '${picture.filename}')" title="Replace">🔄</button>
                                    <button class="btn-delete-small" onclick="deletePicture('${folder.name}', '${picture.filename}')" title="Delete">🗑️</button>
                                </div>
                                <div class="picture-name">${picture.filename}</div>
                            </div>
                        `).join('') : '<div class="empty-folder">Empty folder</div>'}
                    </div>
                </div>
            `).join('');
        } else {
            foldersList.innerHTML = '<div class="loading">No folders found. Create one or upload pictures!</div>';
        }
    } catch (error) {
        foldersList.innerHTML = '<div class="loading">Error loading folders</div>';
        showStatus('Error loading folders: ' + error.message, 'error');
    }
}

// Download picture from specific folder
async function downloadPicture(folderName, filename) {
    try {
        showStatus(`Preparing download for ${filename}...`, 'info');
        
        if ('showSaveFilePicker' in window) {
            await downloadWithSaveDialog(folderName, filename);
        } else {
            await downloadTraditional(folderName, filename);
        }
        
    } catch (error) {
        console.error('Download error:', error);
        if (error.name === 'AbortError') {
            showStatus('Download cancelled by user', 'info');
        } else {
            showStatus(`Download failed: ${error.message}`, 'error');
            await downloadTraditional(folderName, filename);
        }
    }
}

// Download with save dialog
async function downloadWithSaveDialog(folderName, filename) {
    try {
        const fileExtension = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'webp': 'image/webp', 'bmp': 'image/bmp', 'svg': 'image/svg+xml'
        };
        const mimeType = mimeTypes[fileExtension] || 'image/*';
        
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: 'Image files',
                accept: { [mimeType]: [`.${fileExtension}`] }
            }]
        });
        
        showStatus(`Downloading ${filename}...`, 'info');
        const response = await fetch(`${API_BASE}/pictures/${folderName}/${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const writable = await fileHandle.createWritable();
        await writable.write(arrayBuffer);
        await writable.close();
        
        showStatus(`${filename} saved successfully!`);
        
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error(`Save dialog error: ${error.message}`);
    }
}

// Traditional download
async function downloadTraditional(folderName, filename) {
    try {
        showStatus(`Downloading ${filename}...`, 'info');
        const response = await fetch(`${API_BASE}/pictures/${folderName}/${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showStatus(`${filename} downloaded!`);
        
    } catch (error) {
        throw new Error(`Download error: ${error.message}`);
    }
}

// Replace picture
function replacePicture(folderName, filename) {
    currentReplaceFilename = filename;
    currentReplaceFolder = folderName;
    const replaceFileInput = document.getElementById('replaceFileInput');
    replaceFileInput.click();
}

// Handle replace file selection
async function handleReplaceFile(event) {
    const file = event.target.files[0];
    if (!file || !currentReplaceFilename || !currentReplaceFolder) return;
    
    if (!file.type.startsWith('image/')) {
        showStatus('Please select an image file', 'error');
        return;
    }
    
    if (!confirm(`Replace "${currentReplaceFilename}" in folder "${currentReplaceFolder}" with "${file.name}"?`)) {
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/pictures/${currentReplaceFolder}/${currentReplaceFilename}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            showStatus(`${currentReplaceFilename} replaced successfully!`);
            loadFolders();
        } else {
            const result = await response.json();
            showStatus('Replace failed: ' + (result.detail || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Replace error: ' + error.message, 'error');
    } finally {
        event.target.value = '';
        currentReplaceFilename = null;
        currentReplaceFolder = null;
    }
}

// Delete picture
async function deletePicture(folderName, filename) {
    if (!confirm(`Delete "${filename}" from folder "${folderName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/pictures/${folderName}/${filename}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showStatus(`${filename} deleted successfully!`);
            loadFolders();
        } else {
            showStatus('Delete failed', 'error');
        }
    } catch (error) {
        showStatus('Delete error: ' + error.message, 'error');
    }
}

// Delete entire folder
async function deleteFolder(folderName) {
    if (!confirm(`Delete entire folder "${folderName}" and all its pictures? This cannot be undone!`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/folders/${folderName}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showStatus(`Folder "${folderName}" and ${result.files_deleted} file(s) deleted successfully!`);
            loadFolders();
        } else {
            showStatus('Delete folder failed: ' + (result.detail || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Delete folder error: ' + error.message, 'error');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadFolders();
    
    const fileInput = document.getElementById('fileInput');
    const replaceFileInput = document.getElementById('replaceFileInput');
    const newFolderInput = document.getElementById('newFolderInput');
    
    fileInput.addEventListener('change', showFilePreview);
    replaceFileInput.addEventListener('change', handleReplaceFile);
    
    // Enter key support for folder creation
    newFolderInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createFolder();
        }
    });
});