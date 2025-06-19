let allPictures = [];
let currentSearchResults = [];

// Load search page data
async function loadSearchPage() {
    try {
        await loadAllPictures();
        await loadFolderFilter();
        showStatus('Search page loaded successfully!', 'info');
    } catch (error) {
        showStatus('Error loading search page: ' + error.message, 'error');
    }
}

// Load all pictures from all folders
async function loadAllPictures() {
    try {
        const response = await fetch(`${API_BASE}/folders`);
        const data = await response.json();
        
        allPictures = [];
        
        if (data.folders) {
            Object.values(data.folders).forEach(folder => {
                folder.pictures.forEach(picture => {
                    allPictures.push({
                        ...picture,
                        folder: folder.name,
                        extension: picture.filename.split('.').pop().toLowerCase()
                    });
                });
            });
        }
        
        return allPictures;
    } catch (error) {
        throw new Error('Failed to load pictures: ' + error.message);
    }
}

// Load folder names for filter dropdown
async function loadFolderFilter() {
    try {
        const response = await fetch(`${API_BASE}/folders`);
        const data = await response.json();
        
        const folderFilter = document.getElementById('folderFilter');
        folderFilter.innerHTML = '<option value="">All Folders</option>';
        
        if (data.folders) {
            Object.keys(data.folders).forEach(folderName => {
                const option = document.createElement('option');
                option.value = folderName;
                option.textContent = folderName;
                folderFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading folder filter:', error);
    }
}

// Search pictures based on filters
async function searchPictures() {
    const searchInput = document.getElementById('searchInput');
    const fileTypeFilter = document.getElementById('fileTypeFilter');
    const folderFilter = document.getElementById('folderFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const fileType = fileTypeFilter.value.toLowerCase();
    const folder = folderFilter.value;
    const sort = sortFilter.value;
    
    try {
        // Filter pictures
        let filteredPictures = allPictures.filter(picture => {
            // Search term filter
            const matchesSearch = !searchTerm || 
                picture.filename.toLowerCase().includes(searchTerm) ||
                picture.folder.toLowerCase().includes(searchTerm);
            
            // File type filter
            const matchesFileType = !fileType || 
                fileType.split(',').includes(picture.extension);
            
            // Folder filter
            const matchesFolder = !folder || picture.folder === folder;
            
            return matchesSearch && matchesFileType && matchesFolder;
        });
        
        // Sort pictures
        filteredPictures = sortPictures(filteredPictures, sort);
        
        currentSearchResults = filteredPictures;
        displaySearchResults(filteredPictures, searchTerm, fileType, folder);
        
    } catch (error) {
        showStatus('Search error: ' + error.message, 'error');
    }
}

// Sort pictures based on criteria
function sortPictures(pictures, sortBy) {
    const sorted = [...pictures];
    
    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.filename.localeCompare(b.filename));
        case 'name_desc':
            return sorted.sort((a, b) => b.filename.localeCompare(a.filename));
        case 'size':
            return sorted.sort((a, b) => a.size - b.size);
        case 'size_desc':
            return sorted.sort((a, b) => b.size - a.size);
        case 'folder':
            return sorted.sort((a, b) => a.folder.localeCompare(b.folder));
        default:
            return sorted;
    }
}

// Display search results
function displaySearchResults(results, searchTerm, fileType, folder) {
    const searchStats = document.getElementById('searchStats');
    const searchResults = document.getElementById('searchResults');
    
    // Update stats
    let statsText = `Found ${results.length} picture(s)`;
    if (searchTerm) statsText += ` matching "${searchTerm}"`;
    if (fileType) statsText += ` (${fileType.toUpperCase()} files)`;
    if (folder) statsText += ` in folder "${folder}"`;
    
    searchStats.innerHTML = statsText;
    
    // Display results
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="empty-search">No pictures found matching your criteria</div>';
        return;
    }
    
    searchResults.innerHTML = results.map(picture => `
        <div class="search-result-item">
            <img src="${API_BASE}/pictures/${picture.path}" alt="${picture.filename}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="search-result-info">
                <div class="search-result-filename">${picture.filename}</div>
                <div class="search-result-folder">📁 ${picture.folder}</div>
                <div class="search-result-size">${formatFileSize(picture.size)}</div>
            </div>
            <div class="search-result-actions">
                <button class="btn-download-small" onclick="downloadPicture('${picture.folder}', '${picture.filename}')" title="Download">📥</button>
                <button class="btn-replace-small" onclick="replacePicture('${picture.folder}', '${picture.filename}')" title="Replace">🔄</button>
                <button class="btn-delete-small" onclick="deletePicture('${picture.folder}', '${picture.filename}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Clear search and show all pictures
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('folderFilter').value = '';
    document.getElementById('sortFilter').value = 'name';
    
    showAllPictures();
}

// Quick action: Show all pictures
function showAllPictures() {
    currentSearchResults = allPictures;
    displaySearchResults(allPictures, '', '', '');
}

// Quick action: Show large pictures (>1MB)
function showLargePictures() {
    const largePictures = allPictures.filter(picture => picture.size > 1024 * 1024);
    currentSearchResults = largePictures;
    displaySearchResults(largePictures, '', '', '');
    document.getElementById('searchStats').innerHTML += ' (larger than 1MB)';
}

// Quick action: Show recent folders (placeholder - could be enhanced with timestamps)
function showRecentFolders() {
    // For now, just show folders sorted alphabetically
    const sortedByFolder = sortPictures(allPictures, 'folder');
    currentSearchResults = sortedByFolder;
    displaySearchResults(sortedByFolder, '', '', '');
    document.getElementById('searchStats').innerHTML += ' (sorted by folder)';
}

// Download all search results
async function downloadSearchResults() {
    if (currentSearchResults.length === 0) {
        showStatus('No search results to download', 'warning');
        return;
    }
    
    if (!confirm(`Download all ${currentSearchResults.length} search results?`)) {
        return;
    }
    
    try {
        if ('showDirectoryPicker' in window) {
            // Use directory picker for modern browsers
            const directoryHandle = await window.showDirectoryPicker();
            
            showStatus(`Downloading ${currentSearchResults.length} pictures...`, 'info');
            
            let successCount = 0;
            let errorCount = 0;
            
            for (const picture of currentSearchResults) {
                try {
                    const response = await fetch(`${API_BASE}/pictures/${picture.path}`);
                    if (!response.ok) throw new Error(`Failed to fetch ${picture.filename}`);
                    
                    const arrayBuffer = await response.arrayBuffer();
                    const fileHandle = await directoryHandle.getFileHandle(
                        `${picture.folder}_${picture.filename}`, 
                        { create: true }
                    );
                    const writable = await fileHandle.createWritable();
                    await writable.write(arrayBuffer);
                    await writable.close();
                    
                    successCount++;
                } catch (error) {
                    console.error(`Error downloading ${picture.filename}:`, error);
                    errorCount++;
                }
            }
            
            if (errorCount === 0) {
                showStatus(`All ${successCount} pictures downloaded successfully!`);
            } else {
                showStatus(`${successCount} pictures downloaded, ${errorCount} failed`, 'warning');
            }
        } else {
            // Fallback: download one by one
            showStatus(`Downloading ${currentSearchResults.length} pictures one by one...`, 'info');
            
            for (const picture of currentSearchResults) {
                await downloadTraditional(picture.folder, picture.filename);
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            showStatus(`All ${currentSearchResults.length} pictures downloaded!`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('Download cancelled by user', 'info');
        } else {
            showStatus(`Download error: ${error.message}`, 'error');
        }
    }
}

// Add event listeners for search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const fileTypeFilter = document.getElementById('fileTypeFilter');
    const folderFilter = document.getElementById('folderFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    // Enter key support for search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPictures();
        }
    });
    
    // Auto-search when filters change
    fileTypeFilter.addEventListener('change', searchPictures);
    folderFilter.addEventListener('change', searchPictures);
    sortFilter.addEventListener('change', searchPictures);
});