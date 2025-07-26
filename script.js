// Global variables
let bookmarks = [];
let notes = [];
let editMode = false;
let selectedBookmarks = new Set();
let useServer = false;
let serverUrl = 'http://192.168.1.100:3000'; // Change this to your computer's IP
let googleDriveSync = null;

// Theme and font configurations
const themes = {
    cyberpunk: {
        name: 'Cyberpunk',
        dataTheme: 'cyberpunk'
    },
    matrix: {
        name: 'Matrix',
        dataTheme: 'matrix'
    },
    'neon-purple': {
        name: 'Neon Purple',
        dataTheme: 'neon-purple'
    },
    'cyber-orange': {
        name: 'Cyber Orange',
        dataTheme: 'cyber-orange'
    },
    'deep-blue': {
        name: 'Deep Blue',
        dataTheme: 'deep-blue'
    },
    'dark-green': {
        name: 'Dark Green',
        dataTheme: 'dark-green'
    }
};

const fonts = {
    mono: {
        name: 'JetBrains Mono',
        family: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
    },
    code: {
        name: 'Fira Code',
        family: "'Fira Code', 'Consolas', monospace"
    },
    consolas: {
        name: 'Consolas',
        family: "'Consolas', 'Courier New', monospace"
    },
    cascadia: {
        name: 'Cascadia Code',
        family: "'Cascadia Code', 'Consolas', monospace"
    },
    source: {
        name: 'Source Code Pro',
        family: "'Source Code Pro', 'Consolas', monospace"
    },
    roboto: {
        name: 'Roboto',
        family: "'Roboto', sans-serif"
    },
    inter: {
        name: 'Inter',
        family: "'Inter', sans-serif"
    },
    system: {
        name: 'System',
        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }
};

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    loadWeather();
    setupEventListeners();
    loadThemeSettings();
    renderBookmarks();
    renderNotes();
    
    // Check if server is available
    checkServerStatus();
    
    // Initialize Google Drive sync
    initGoogleDriveSync();
});

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch(`${serverUrl}/api/status`);
        if (response.ok) {
            const status = await response.json();
            console.log('Server status:', status);
            // You could show a status indicator here
        }
    } catch (error) {
        console.log('Server not available');
    }
}

// Initialize Google Drive sync
async function initGoogleDriveSync() {
    try {
        googleDriveSync = new GoogleDriveSync();
        const result = await googleDriveSync.init();
        console.log('Google Drive sync:', result.message);
    } catch (error) {
        console.log('Google Drive sync not available:', error);
    }
}

// Enable Google Drive sync
async function enableGoogleDriveSync() {
    if (!googleDriveSync) {
        alert('Google Drive sync not initialized. Please check your API credentials.');
        return;
    }
    
    try {
        const result = await googleDriveSync.enableSync();
        if (result.success) {
            alert('Google Drive sync enabled! Your data will now be automatically backed up.');
        } else {
            alert('Failed to enable Google Drive sync: ' + result.message);
        }
    } catch (error) {
        alert('Error enabling Google Drive sync: ' + error.message);
    }
}

// Disable Google Drive sync
function disableGoogleDriveSync() {
    if (googleDriveSync) {
        googleDriveSync.disableSync();
        alert('Google Drive sync disabled.');
    }
}

// Manual Google Drive sync
async function manualGoogleDriveSync() {
    if (!googleDriveSync || !googleDriveSync.isEnabled) {
        alert('Google Drive sync not enabled.');
        return;
    }
    
    try {
        const result = await googleDriveSync.manualSync();
        if (result.success) {
            alert('Manual sync completed!');
        } else {
            alert('Manual sync failed: ' + result.message);
        }
    } catch (error) {
        alert('Error during manual sync: ' + error.message);
    }
}

// Restore data from Google Drive
async function restoreFromGoogleDrive() {
    if (!googleDriveSync) {
        alert('Google Drive sync not initialized.');
        return;
    }
    
    if (confirm('This will overwrite your current data with the version from Google Drive. Continue?')) {
        try {
            const result = await googleDriveSync.downloadData();
            if (result.success) {
                // Reload data
                loadFromLocalStorage();
                renderBookmarks();
                renderNotes();
                loadThemeSettings();
                alert('Data restored from Google Drive!');
            } else {
                alert('Failed to restore data: ' + result.message);
            }
        } catch (error) {
            alert('Error restoring data: ' + error.message);
        }
    }
}

// Toggle between server and localStorage
function toggleStorageMode() {
    useServer = !useServer;
    localStorage.setItem('use_server', useServer.toString());
    
    if (useServer) {
        console.log('Switched to server storage');
        // Reload data from server
        loadData().then(() => {
            renderBookmarks();
            renderNotes();
        });
    } else {
        console.log('Switched to localStorage');
        // Reload data from localStorage
        loadFromLocalStorage();
        renderBookmarks();
        renderNotes();
    }
}

// Theme and font management
function changeTheme(themeKey) {
    const theme = themes[themeKey];
    if (theme) {
        document.documentElement.setAttribute('data-theme', theme.dataTheme);
        localStorage.setItem('dashboard_theme', themeKey);
    }
}

function changeFont(fontKey) {
    const font = fonts[fontKey];
    if (font) {
        document.documentElement.style.setProperty('--font-family', font.family);
        localStorage.setItem('dashboard_font', fontKey);
    }
}

function loadThemeSettings() {
    // Load saved theme
    const savedTheme = localStorage.getItem('dashboard_theme') || 'cyberpunk';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
        changeTheme(savedTheme);
    }
    
    // Load saved font
    const savedFont = localStorage.getItem('dashboard_font') || 'mono';
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = savedFont;
        changeFont(savedFont);
    }
}

// Load data from localStorage or server
async function loadData() {
    if (useServer) {
        try {
            const response = await fetch(`${serverUrl}/api/data`);
            if (response.ok) {
                const data = await response.json();
                bookmarks = data.bookmarks || [];
                notes = data.notes || [];
                
                // Load settings
                if (data.settings) {
                    if (data.settings.theme) {
                        changeTheme(data.settings.theme);
                    }
                    if (data.settings.font) {
                        changeFont(data.settings.font);
                    }
                }
            } else {
                console.warn('Server not available, using localStorage');
                loadFromLocalStorage();
            }
        } catch (error) {
            console.warn('Server connection failed, using localStorage:', error);
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedBookmarks = localStorage.getItem('dashboard_bookmarks');
    const savedNotes = localStorage.getItem('dashboard_notes');
    
    if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
    }
    
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

// Save data to localStorage or server
async function saveData() {
    const data = {
        bookmarks: bookmarks,
        notes: notes,
        settings: {
            theme: localStorage.getItem('dashboard_theme'),
            font: localStorage.getItem('dashboard_font')
        }
    };
    
    if (useServer) {
        try {
            const response = await fetch(`${serverUrl}/api/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Server save failed');
            }
        } catch (error) {
            console.warn('Server save failed, using localStorage:', error);
            saveToLocalStorage();
        }
    } else {
        saveToLocalStorage();
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('dashboard_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('dashboard_notes', JSON.stringify(notes));
}

// Setup event listeners
function setupEventListeners() {
    // Search form submission
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search('google');
        }
    });
    
    // Bookmark form submission
    document.getElementById('addBookmarkForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addBookmark();
    });
    
    // Note form submission
    document.getElementById('addNoteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNote();
    });
    
    // Edit note form submission
    document.getElementById('editNoteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateNote();
    });
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Search functionality
function search(engine) {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    let searchUrl = '';
    switch(engine) {
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'youtube':
            searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            break;
        case 'twitter':
            searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'tiktok':
            searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
            break;
    }
    
    if (searchUrl) {
        window.open(searchUrl, '_blank');
    }
}

// Weather functionality
async function loadWeather() {
    const weatherWidget = document.getElementById('weatherWidget');
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get weather data (using a free weather API)
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        
        // Get weather icon based on weather code
        const weatherIcon = getWeatherIcon(weatherCode);
        
        weatherWidget.innerHTML = `
            <i class="${weatherIcon}"></i>
            ${temp}°C
        `;
        
    } catch (error) {
        console.error('Error loading weather:', error);
        weatherWidget.innerHTML = '<i class="fas fa-cloud"></i> Weather unavailable';
    }
}

// Get current position with timeout
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Geolocation timeout'));
        }, 10000);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve(position);
            },
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            }
        );
    });
}

// Get weather icon based on weather code
function getWeatherIcon(code) {
    if (code >= 0 && code <= 3) return 'fas fa-sun';
    if (code >= 45 && code <= 48) return 'fas fa-cloud-fog';
    if (code >= 51 && code <= 55) return 'fas fa-cloud-drizzle';
    if (code >= 56 && code <= 57) return 'fas fa-cloud-rain';
    if (code >= 61 && code <= 65) return 'fas fa-cloud-rain';
    if (code >= 66 && code <= 67) return 'fas fa-cloud-showers-heavy';
    if (code >= 71 && code <= 75) return 'fas fa-snowflake';
    if (code >= 77 && code <= 77) return 'fas fa-snowflake';
    if (code >= 80 && code <= 82) return 'fas fa-cloud';
    if (code >= 85 && code <= 86) return 'fas fa-cloud-snow';
    if (code >= 95 && code <= 95) return 'fas fa-bolt';
    if (code >= 96 && code <= 99) return 'fas fa-cloud-showers-heavy';
    return 'fas fa-cloud';
}

// Modal functionality
function showAddBookmarkModal() {
    document.getElementById('addBookmarkModal').style.display = 'block';
    document.getElementById('bookmarkTitle').focus();
}

function showAddNoteModal() {
    document.getElementById('addNoteModal').style.display = 'block';
    document.getElementById('noteTitle').focus();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear form
    if (modalId === 'addBookmarkModal') {
        document.getElementById('addBookmarkForm').reset();
    } else if (modalId === 'addNoteModal') {
        document.getElementById('addNoteForm').reset();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Bookmark functionality
function addBookmark() {
    const title = document.getElementById('bookmarkTitle').value.trim();
    const url = document.getElementById('bookmarkUrl').value.trim();
    
    if (!title || !url) return;
    
    const bookmark = {
        id: Date.now(),
        title: title,
        url: url,
        createdAt: new Date().toISOString()
    };
    
    bookmarks.push(bookmark);
    saveData();
    renderBookmarks();
    closeModal('addBookmarkModal');
}

// Edit mode functionality
function toggleEditMode() {
    editMode = !editMode;
    selectedBookmarks.clear();
    
    const editBtn = document.getElementById('editModeBtn');
    const editControls = document.getElementById('editModeControls');
    
    if (editMode) {
        editBtn.innerHTML = '<i class="fas fa-check"></i> Done';
        editBtn.classList.remove('btn-secondary');
        editBtn.classList.add('btn-primary');
        editControls.classList.add('active');
    } else {
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.classList.remove('btn-primary');
        editBtn.classList.add('btn-secondary');
        editControls.classList.remove('active');
    }
    
    renderBookmarks();
}

function toggleBookmarkSelection(id) {
    if (selectedBookmarks.has(id)) {
        selectedBookmarks.delete(id);
    } else {
        selectedBookmarks.add(id);
    }
    updateSelectedCount();
}

function selectAllBookmarks() {
    if (selectedBookmarks.size === bookmarks.length) {
        // If all are selected, deselect all
        selectedBookmarks.clear();
    } else {
        // Select all
        bookmarks.forEach(bookmark => selectedBookmarks.add(bookmark.id));
    }
    renderBookmarks();
}

function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    countElement.textContent = `${selectedBookmarks.size} selected`;
}

function bulkDeleteBookmarks() {
    if (selectedBookmarks.size === 0) {
        alert('Please select bookmarks to delete');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedBookmarks.size} bookmark(s)?`)) {
        bookmarks = bookmarks.filter(bookmark => !selectedBookmarks.has(bookmark.id));
        selectedBookmarks.clear();
        saveData();
        renderBookmarks();
        toggleEditMode(); // Exit edit mode
    }
}

function openBookmark(url) {
    window.open(url, '_blank');
}

function deleteBookmark(id) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
        saveData();
        renderBookmarks();
    }
}

function renderBookmarks() {
    const container = document.getElementById('bookmarksContainer');
    
    if (bookmarks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>No bookmarks yet</h3>
                <p>Add your first bookmark to get started!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    bookmarks.forEach(bookmark => {
        const isSelected = selectedBookmarks.has(bookmark.id);
        const editModeClass = editMode ? 'edit-mode' : '';
        const checkboxHtml = editMode ? `<input type="checkbox" class="bookmark-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleBookmarkSelection(${bookmark.id})">` : '';
        
        html += `
            <div class="bookmark-card ${editModeClass}" onclick="${editMode ? '' : `openBookmark('${bookmark.url}')`}">
                ${checkboxHtml}
                <div class="bookmark-title">${bookmark.title}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateSelectedCount();
}

// Import/Export functionality
function importBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedBookmarks = JSON.parse(e.target.result);
                    if (Array.isArray(importedBookmarks)) {
                        bookmarks = [...bookmarks, ...importedBookmarks];
                        saveData();
                        renderBookmarks();
                        alert('Bookmarks imported successfully!');
                    } else {
                        alert('Invalid file format');
                    }
                } catch (error) {
                    alert('Error reading file');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function exportBookmarks() {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'bookmarks.json';
    link.click();
}

// Notes functionality
function addNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) return;
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.push(note);
    saveData();
    renderNotes();
    closeModal('addNoteModal');
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteTitle').value = note.title;
    document.getElementById('editNoteContent').value = note.content;
    
    document.getElementById('editNoteModal').style.display = 'block';
}

function updateNote() {
    const id = parseInt(document.getElementById('editNoteId').value);
    const title = document.getElementById('editNoteTitle').value.trim();
    const content = document.getElementById('editNoteContent').value.trim();
    
    if (!title || !content) return;
    
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return;
    
    notes[noteIndex].title = title;
    notes[noteIndex].content = content;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveData();
    renderNotes();
    closeModal('editNoteModal');
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveData();
        renderNotes();
    }
}

function renderNotes() {
    const container = document.getElementById('notesContainer');
    
    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>No notes yet</h3>
                <p>Add your first note to get started!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    notes.forEach(note => {
        const date = new Date(note.updatedAt || note.createdAt).toLocaleDateString();
        html += `
            <div class="note-card">
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.content}</div>
                <div class="note-date">Last updated: ${date}</div>
                <div class="note-actions">
                    <button onclick="editNote(${note.id})" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteNote(${note.id})" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Add some sample data for demonstration
function addSampleData() {
    if (bookmarks.length === 0) {
        bookmarks = [
            // Popular Sites
            { id: 1, title: 'Google', url: 'https://google.com', createdAt: new Date().toISOString() },
            { id: 2, title: 'YouTube', url: 'https://youtube.com', createdAt: new Date().toISOString() },
            { id: 3, title: 'GitHub', url: 'https://github.com', createdAt: new Date().toISOString() },
            { id: 4, title: 'Stack Overflow', url: 'https://stackoverflow.com', createdAt: new Date().toISOString() },
            { id: 5, title: 'Reddit', url: 'https://reddit.com', createdAt: new Date().toISOString() },
            
            // Social Media
            { id: 6, title: 'Twitter', url: 'https://twitter.com', createdAt: new Date().toISOString() },
            { id: 7, title: 'LinkedIn', url: 'https://linkedin.com', createdAt: new Date().toISOString() },
            { id: 8, title: 'Instagram', url: 'https://instagram.com', createdAt: new Date().toISOString() },
            { id: 9, title: 'Facebook', url: 'https://facebook.com', createdAt: new Date().toISOString() },
            { id: 10, title: 'TikTok', url: 'https://tiktok.com', createdAt: new Date().toISOString() },
            
            // Productivity
            { id: 11, title: 'Gmail', url: 'https://gmail.com', createdAt: new Date().toISOString() },
            { id: 12, title: 'Google Drive', url: 'https://drive.google.com', createdAt: new Date().toISOString() },
            { id: 13, title: 'Google Docs', url: 'https://docs.google.com', createdAt: new Date().toISOString() },
            { id: 14, title: 'Notion', url: 'https://notion.so', createdAt: new Date().toISOString() },
            { id: 15, title: 'Trello', url: 'https://trello.com', createdAt: new Date().toISOString() },
            
            // Shopping
            { id: 16, title: 'Amazon', url: 'https://amazon.com', createdAt: new Date().toISOString() },
            { id: 17, title: 'eBay', url: 'https://ebay.com', createdAt: new Date().toISOString() },
            { id: 18, title: 'Etsy', url: 'https://etsy.com', createdAt: new Date().toISOString() },
            { id: 19, title: 'Target', url: 'https://target.com', createdAt: new Date().toISOString() },
            { id: 20, title: 'Walmart', url: 'https://walmart.com', createdAt: new Date().toISOString() },
            
            // News & Information
            { id: 21, title: 'Wikipedia', url: 'https://wikipedia.org', createdAt: new Date().toISOString() },
            { id: 22, title: 'CNN', url: 'https://cnn.com', createdAt: new Date().toISOString() },
            { id: 23, title: 'BBC News', url: 'https://bbc.com/news', createdAt: new Date().toISOString() },
            { id: 24, title: 'The New York Times', url: 'https://nytimes.com', createdAt: new Date().toISOString() },
            { id: 25, title: 'TechCrunch', url: 'https://techcrunch.com', createdAt: new Date().toISOString() },
            
            // Entertainment
            { id: 26, title: 'Netflix', url: 'https://netflix.com', createdAt: new Date().toISOString() },
            { id: 27, title: 'Spotify', url: 'https://spotify.com', createdAt: new Date().toISOString() },
            { id: 28, title: 'Twitch', url: 'https://twitch.tv', createdAt: new Date().toISOString() },
            { id: 29, title: 'Discord', url: 'https://discord.com', createdAt: new Date().toISOString() },
            { id: 30, title: 'Steam', url: 'https://steampowered.com', createdAt: new Date().toISOString() }
        ];
    }
    
    if (notes.length === 0) {
        notes = [
            {
                id: 1,
                title: 'Welcome',
                content: 'Welcome to your Dashboard! This is your central hub for bookmarks, notes, and productivity. Add your most-used websites as bookmarks and keep important notes here for quick access.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Quick Tips',
                content: '• Use the search bar to quickly search Google, YouTube, X, or TikTok\n• Add bookmarks for sites you visit often\n• Take notes for important information\n• Customize themes and fonts to your liking\n• Enable Google Drive sync for automatic backup',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
    
    saveData();
    renderBookmarks();
    renderNotes();
}

// Add sample data on first load if no data exists
if (localStorage.getItem('dashboard_bookmarks') === null) {
    addSampleData();
} 