// Simplified Dashboard for S24 Direct File Access
// This version works without HTTPS but has limited features

// Global variables
let bookmarks = [];
let notes = [];
let editMode = false;
let selectedBookmarks = new Set();

// Theme and font configurations
const themes = {
    cyberpunk: {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#1a1a2e',
        '--bg-tertiary': '#16213e',
        '--bg-card': 'rgba(26, 26, 46, 0.8)',
        '--bg-modal': '#0a0a0f',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--text-muted': '#888',
        '--accent-primary': '#00d4ff',
        '--accent-secondary': '#0099cc',
        '--accent-success': '#00ff88',
        '--accent-warning': '#ffaa00',
        '--accent-danger': '#ff6b6b',
        '--accent-purple': '#8b5cf6',
        '--border-primary': 'rgba(100, 100, 255, 0.2)',
        '--border-secondary': 'rgba(0, 212, 255, 0.2)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.3)',
        '--shadow-accent': 'rgba(0, 212, 255, 0.1)'
    },
    matrix: {
        '--bg-primary': '#000000',
        '--bg-secondary': '#0a0a0a',
        '--bg-tertiary': '#1a1a1a',
        '--bg-card': 'rgba(10, 10, 10, 0.8)',
        '--bg-modal': '#000000',
        '--text-primary': '#00ff00',
        '--text-secondary': '#00cc00',
        '--text-muted': '#008800',
        '--accent-primary': '#00ff00',
        '--accent-secondary': '#00cc00',
        '--accent-success': '#00ff00',
        '--accent-warning': '#ffff00',
        '--accent-danger': '#ff0000',
        '--accent-purple': '#8000ff',
        '--border-primary': 'rgba(0, 255, 0, 0.2)',
        '--border-secondary': 'rgba(0, 255, 0, 0.1)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.5)',
        '--shadow-accent': 'rgba(0, 255, 0, 0.1)'
    },
    'neon-purple': {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#1a1a2e',
        '--bg-tertiary': '#16213e',
        '--bg-card': 'rgba(26, 26, 46, 0.8)',
        '--bg-modal': '#0a0a0f',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--text-muted': '#888',
        '--accent-primary': '#8b5cf6',
        '--accent-secondary': '#7c3aed',
        '--accent-success': '#10b981',
        '--accent-warning': '#f59e0b',
        '--accent-danger': '#ef4444',
        '--accent-purple': '#8b5cf6',
        '--border-primary': 'rgba(139, 92, 246, 0.2)',
        '--border-secondary': 'rgba(139, 92, 246, 0.1)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.3)',
        '--shadow-accent': 'rgba(139, 92, 246, 0.1)'
    },
    'cyber-orange': {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#1a1a2e',
        '--bg-tertiary': '#16213e',
        '--bg-card': 'rgba(26, 26, 46, 0.8)',
        '--bg-modal': '#0a0a0f',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--text-muted': '#888',
        '--accent-primary': '#ff6b35',
        '--accent-secondary': '#f7931e',
        '--accent-success': '#00ff88',
        '--accent-warning': '#ffaa00',
        '--accent-danger': '#ff6b6b',
        '--accent-purple': '#8b5cf6',
        '--border-primary': 'rgba(255, 107, 53, 0.2)',
        '--border-secondary': 'rgba(255, 107, 53, 0.1)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.3)',
        '--shadow-accent': 'rgba(255, 107, 53, 0.1)'
    },
    'deep-blue': {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#1a1a2e',
        '--bg-tertiary': '#16213e',
        '--bg-card': 'rgba(26, 26, 46, 0.8)',
        '--bg-modal': '#0a0a0f',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--text-muted': '#888',
        '--accent-primary': '#3b82f6',
        '--accent-secondary': '#1d4ed8',
        '--accent-success': '#10b981',
        '--accent-warning': '#f59e0b',
        '--accent-danger': '#ef4444',
        '--accent-purple': '#8b5cf6',
        '--border-primary': 'rgba(59, 130, 246, 0.2)',
        '--border-secondary': 'rgba(59, 130, 246, 0.1)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.3)',
        '--shadow-accent': 'rgba(59, 130, 246, 0.1)'
    },
    'dark-green': {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#1a1a2e',
        '--bg-tertiary': '#16213e',
        '--bg-card': 'rgba(26, 26, 46, 0.8)',
        '--bg-modal': '#0a0a0f',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--text-muted': '#888',
        '--accent-primary': '#10b981',
        '--accent-secondary': '#059669',
        '--accent-success': '#10b981',
        '--accent-warning': '#f59e0b',
        '--accent-danger': '#ef4444',
        '--accent-purple': '#8b5cf6',
        '--border-primary': 'rgba(16, 185, 129, 0.2)',
        '--border-secondary': 'rgba(16, 185, 129, 0.1)',
        '--shadow-primary': 'rgba(0, 0, 0, 0.3)',
        '--shadow-accent': 'rgba(16, 185, 129, 0.1)'
    }
};

const fonts = {
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    code: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    consolas: "'Consolas', 'JetBrains Mono', 'Fira Code', monospace",
    cascadia: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace",
    source: "'Source Code Pro', 'JetBrains Mono', 'Fira Code', monospace",
    roboto: "'Roboto', sans-serif",
    inter: "'Inter', sans-serif",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
};

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    loadThemeSettings();
    renderBookmarks();
    renderNotes();
});

// Theme and font management
function changeTheme(themeKey) {
    const root = document.documentElement;
    const theme = themes[themeKey];
    
    if (theme) {
        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
        localStorage.setItem('dashboard_theme', themeKey);
    }
}

function changeFont(fontKey) {
    const root = document.documentElement;
    const font = fonts[fontKey];
    
    if (font) {
        root.style.setProperty('--font-family', font);
        localStorage.setItem('dashboard_font', fontKey);
    }
}

function loadThemeSettings() {
    const savedTheme = localStorage.getItem('dashboard_theme') || 'cyberpunk';
    const savedFont = localStorage.getItem('dashboard_font') || 'mono';
    
    changeTheme(savedTheme);
    changeFont(savedFont);
    
    // Update select elements
    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('fontSelect').value = savedFont;
}

// Load data from localStorage
function loadData() {
    const savedBookmarks = localStorage.getItem('dashboard_bookmarks');
    const savedNotes = localStorage.getItem('dashboard_notes');
    
    if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
    }
    
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('dashboard_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('dashboard_notes', JSON.stringify(notes));
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search('google');
        }
    });

    // Modal forms
    document.getElementById('addBookmarkForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addBookmark();
    });

    document.getElementById('addNoteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNote();
    });

    document.getElementById('editNoteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateNote();
    });
}

// Tab switching
function showTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
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
    switch (engine) {
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
        default:
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.open(searchUrl, '_blank');
}

// Modal functions
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
    
    // Clear form fields
    if (modalId === 'addBookmarkModal') {
        document.getElementById('addBookmarkForm').reset();
    } else if (modalId === 'addNoteModal') {
        document.getElementById('addNoteForm').reset();
    } else if (modalId === 'editNoteModal') {
        document.getElementById('editNoteForm').reset();
    }
}

// Bookmark functions
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
        selectedBookmarks.clear();
    } else {
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
                        bookmarks = importedBookmarks;
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
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-bookmarks.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Note functions
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
                content: '• Use the search bar to quickly search Google, YouTube, X, or TikTok\n• Add bookmarks for sites you visit often\n• Take notes for important information\n• Customize themes and fonts to your liking\n• Export your data regularly for backup',
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