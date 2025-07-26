// App State
let currentSearchSource = 'google';
let calculatorExpression = '';
let todos = JSON.parse(localStorage.getItem('dashboardTodos')) || [];
let bookmarks = JSON.parse(localStorage.getItem('dashboardBookmarks')) || [];
let notes = localStorage.getItem('dashboardNotes') || '';

// PWA Installation
let deferredPrompt;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializePWA();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSavedData();
    setupEventListeners();
    
    // Load notes
    const notesTextarea = document.getElementById('quickNotes');
    if (notesTextarea) {
        notesTextarea.value = notes;
    }
    
    // Render todos and bookmarks
    renderTodos();
    renderBookmarks();
});

// App Initialization
function initializeApp() {
    // Add fade-in animation to widgets
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach((widget, index) => {
        setTimeout(() => {
            widget.classList.add('fade-in');
        }, index * 100);
    });
    
    // Set default search source
    const defaultSource = document.querySelector('.source-btn[data-source="google"]');
    if (defaultSource) {
        defaultSource.classList.add('active');
    }
}

// PWA Functionality
function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
    
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.addEventListener('click', installPWA);
        }
    });
    
    // Check if already installed
    window.addEventListener('appinstalled', (evt) => {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    });
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            document.getElementById('installBtn').style.display = 'none';
        });
    }
}

// Date and Time Functions
function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const sourceBtns = document.querySelectorAll('.source-btn');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    sourceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sourceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSearchSource = this.dataset.source;
        });
    });
    
    // Weather functionality
    const weatherLocationBtn = document.getElementById('weatherLocationBtn');
    if (weatherLocationBtn) {
        weatherLocationBtn.addEventListener('click', getWeather);
    }
    
    // Notes functionality
    const saveNotesBtn = document.getElementById('saveNotes');
    const clearNotesBtn = document.getElementById('clearNotes');
    const notesTextarea = document.getElementById('quickNotes');
    
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveNotes);
    }
    
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener('click', clearNotes);
    }
    
    if (notesTextarea) {
        notesTextarea.addEventListener('input', autoSaveNotes);
    }
    
    // Bookmark functionality
    const addBookmarkBtn = document.getElementById('addBookmark');
    const bookmarkTitle = document.getElementById('bookmarkTitle');
    const bookmarkUrl = document.getElementById('bookmarkUrl');
    
    if (addBookmarkBtn) {
        addBookmarkBtn.addEventListener('click', addBookmark);
    }
    
    if (bookmarkTitle) {
        bookmarkTitle.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addBookmark();
            }
        });
    }
    
    if (bookmarkUrl) {
        bookmarkUrl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addBookmark();
            }
        });
    }
    
    // Todo functionality
    const addTodoBtn = document.getElementById('addTodo');
    const todoInput = document.getElementById('todoInput');
    
    if (addTodoBtn) {
        addTodoBtn.addEventListener('click', addTodo);
    }
    
    if (todoInput) {
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
    }
}

// Search Functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        searchInput.classList.add('shake');
        setTimeout(() => searchInput.classList.remove('shake'), 500);
        return;
    }
    
    const searchUrls = {
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    };
    
    const url = searchUrls[currentSearchSource];
    if (url) {
        window.open(url, '_blank');
        searchInput.value = '';
    }
}

// Weather Functionality
async function getWeather() {
    const weatherContent = document.getElementById('weatherContent');
    const locationBtn = document.getElementById('weatherLocationBtn');
    
    weatherContent.innerHTML = `
        <div class="weather-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Getting your location...
        </div>
    `;
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        weatherContent.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-spinner fa-spin"></i>
                Fetching weather data...
            </div>
        `;
        
        // Fetch weather data (using a free API)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        displayWeather(data);
        
        locationBtn.style.display = 'none';
        
    } catch (error) {
        weatherContent.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-exclamation-triangle"></i>
                Unable to get weather data. Please enable location access.
            </div>
        `;
        console.error('Weather error:', error);
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
        });
    });
}

function displayWeather(data) {
    const current = data.current_weather;
    const temp = Math.round(current.temperature);
    const windSpeed = Math.round(current.windspeed);
    
    const weatherContent = document.getElementById('weatherContent');
    weatherContent.innerHTML = `
        <div class="weather-info">
            <div class="weather-main">
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">Current Weather</div>
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span>Wind</span>
                    <span>${windSpeed} km/h</span>
                </div>
                <div class="weather-detail">
                    <span>Wind Code</span>
                    <span>${current.weathercode}</span>
                </div>
            </div>
        </div>
    `;
}

// Notes Functionality
function saveNotes() {
    const notesTextarea = document.getElementById('quickNotes');
    const saveBtn = document.getElementById('saveNotes');
    
    notes = notesTextarea.value;
    localStorage.setItem('dashboardNotes', notes);
    
    // Visual feedback
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.classList.add('pulse');
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.classList.remove('pulse');
    }, 1500);
}

function clearNotes() {
    const notesTextarea = document.getElementById('quickNotes');
    notesTextarea.value = '';
    notes = '';
    localStorage.removeItem('dashboardNotes');
}

function autoSaveNotes() {
    const notesTextarea = document.getElementById('quickNotes');
    notes = notesTextarea.value;
    localStorage.setItem('dashboardNotes', notes);
}

// Bookmark Functionality
function addBookmark() {
    const titleInput = document.getElementById('bookmarkTitle');
    const urlInput = document.getElementById('bookmarkUrl');
    
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!title || !url) {
        const emptyInput = !title ? titleInput : urlInput;
        emptyInput.classList.add('shake');
        setTimeout(() => emptyInput.classList.remove('shake'), 500);
        return;
    }
    
    // Validate URL
    try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
        urlInput.classList.add('shake');
        setTimeout(() => urlInput.classList.remove('shake'), 500);
        return;
    }
    
    const bookmark = {
        id: Date.now(),
        title: title,
        url: url.startsWith('http') ? url : `https://${url}`
    };
    
    bookmarks.push(bookmark);
    
    // Auto-save with backup and feedback
    try {
        localStorage.setItem('dashboardBookmarks', JSON.stringify(bookmarks));
        localStorage.setItem('dashboardBookmarksBackup', JSON.stringify(bookmarks));
        localStorage.setItem('dashboardBookmarksTimestamp', Date.now().toString());
        
        titleInput.value = '';
        urlInput.value = '';
        renderBookmarks();
        showSaveSuccess('bookmarks');
        showNotification(`Bookmark "${title}" added and saved!`, 'success');
        console.log('🔖 Bookmark auto-saved');
    } catch (error) {
        console.error('❌ Failed to save bookmark:', error);
        showSaveError('bookmarks');
        showNotification('Failed to save bookmark', 'error');
    }
}

function deleteBookmark(id) {
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);
    if (bookmarkIndex > -1) {
        const deletedBookmark = bookmarks[bookmarkIndex];
        bookmarks.splice(bookmarkIndex, 1);
        
        // Auto-save with backup and feedback
        try {
            localStorage.setItem('dashboardBookmarks', JSON.stringify(bookmarks));
            localStorage.setItem('dashboardBookmarksBackup', JSON.stringify(bookmarks));
            localStorage.setItem('dashboardBookmarksTimestamp', Date.now().toString());
            
            renderBookmarks();
            showSaveSuccess('bookmarks');
            showNotification(`Bookmark "${deletedBookmark.title}" deleted!`, 'success');
            console.log('🔖 Bookmark deleted and saved');
        } catch (error) {
            console.error('❌ Failed to save after bookmark deletion:', error);
            showSaveError('bookmarks');
        }
    }
}

function renderBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                <i class="fas fa-bookmark"></i>
                <p>No bookmarks yet. Add your first bookmark above!</p>
            </div>
        `;
        return;
    }
    
    bookmarksList.innerHTML = bookmarks.map(bookmark => `
        <div class="bookmark-item fade-in">
            <a href="${bookmark.url}" target="_blank" class="bookmark-link">
                ${bookmark.title}
            </a>
            <button onclick="deleteBookmark(${bookmark.id})" class="bookmark-delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Todo Functionality
function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const text = todoInput.value.trim();
    
    if (!text) {
        todoInput.classList.add('shake');
        setTimeout(() => todoInput.classList.remove('shake'), 500);
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    todos.push(todo);
    
    // Auto-save with backup and feedback
    try {
        localStorage.setItem('dashboardTodos', JSON.stringify(todos));
        localStorage.setItem('dashboardTodosBackup', JSON.stringify(todos));
        localStorage.setItem('dashboardTodosTimestamp', Date.now().toString());
        
        todoInput.value = '';
        renderTodos();
        showSaveSuccess('todos');
        showNotification(`Task "${text}" added and saved!`, 'success');
        console.log('✅ Todo auto-saved');
    } catch (error) {
        console.error('❌ Failed to save todo:', error);
        showSaveError('todos');
        showNotification('Failed to save task', 'error');
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.modified = new Date().toISOString();
        
        // Auto-save with backup and feedback
        try {
            localStorage.setItem('dashboardTodos', JSON.stringify(todos));
            localStorage.setItem('dashboardTodosBackup', JSON.stringify(todos));
            localStorage.setItem('dashboardTodosTimestamp', Date.now().toString());
            
            renderTodos();
            showSaveSuccess('todos');
            showNotification(`Task ${todo.completed ? 'completed' : 'reopened'}!`, 'success');
            console.log('✅ Todo status auto-saved');
        } catch (error) {
            console.error('❌ Failed to save todo status:', error);
            showSaveError('todos');
        }
    }
}

function deleteTodo(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex > -1) {
        const deletedTodo = todos[todoIndex];
        todos.splice(todoIndex, 1);
        
        // Auto-save with backup and feedback
        try {
            localStorage.setItem('dashboardTodos', JSON.stringify(todos));
            localStorage.setItem('dashboardTodosBackup', JSON.stringify(todos));
            localStorage.setItem('dashboardTodosTimestamp', Date.now().toString());
            
            renderTodos();
            showSaveSuccess('todos');
            showNotification(`Task "${deletedTodo.text}" deleted!`, 'success');
            console.log('✅ Todo deleted and saved');
        } catch (error) {
            console.error('❌ Failed to save after todo deletion:', error);
            showSaveError('todos');
        }
    }
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    
    if (todos.length === 0) {
        todoList.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                <i class="fas fa-tasks"></i>
                <p>No tasks yet. Add your first task above!</p>
            </div>
        `;
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''} fade-in">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})" class="todo-checkbox">
            <span class="todo-text">${todo.text}</span>
            <button onclick="deleteTodo(${todo.id})" class="todo-delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Calculator Functionality
function appendToCalculator(value) {
    const display = document.getElementById('calculatorDisplay');
    
    if (calculatorExpression === '0' && !isNaN(value)) {
        calculatorExpression = value;
    } else {
        calculatorExpression += value;
    }
    
    display.value = calculatorExpression;
}

function clearCalculator() {
    calculatorExpression = '';
    document.getElementById('calculatorDisplay').value = '';
}

function deleteLast() {
    calculatorExpression = calculatorExpression.slice(0, -1);
    document.getElementById('calculatorDisplay').value = calculatorExpression;
}

function calculateResult() {
    const display = document.getElementById('calculatorDisplay');
    
    try {
        // Replace display symbols with valid operators
        let expression = calculatorExpression
            .replace(/×/g, '*')
            .replace(/−/g, '-');
        
        // Evaluate the expression safely
        const result = Function('"use strict"; return (' + expression + ')')();
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid calculation');
        }
        
        calculatorExpression = result.toString();
        display.value = calculatorExpression;
        
    } catch (error) {
        display.value = 'Error';
        display.classList.add('shake');
        setTimeout(() => {
            display.classList.remove('shake');
            clearCalculator();
        }, 1000);
    }
}

// Load Saved Data
function loadSavedData() {
    // Load saved notes
    const savedNotes = localStorage.getItem('dashboardNotes');
    if (savedNotes) {
        notes = savedNotes;
        const notesTextarea = document.getElementById('quickNotes');
        if (notesTextarea) {
            notesTextarea.value = notes;
        }
    }
    
    // Load saved todos
    const savedTodos = localStorage.getItem('dashboardTodos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
    
    // Load saved bookmarks
    const savedBookmarks = localStorage.getItem('dashboardBookmarks');
    if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-in');
    }, 100);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Touch and Mobile Optimizations
if ('ontouchstart' in window) {
    // Add touch-specific optimizations
    document.body.classList.add('touch-device');
    
    // Prevent zoom on double tap for buttons
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + S = Focus search
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Alt + N = Focus notes
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('quickNotes').focus();
    }
    
    // Alt + T = Focus todo input
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('todoInput').focus();
    }
    
    // Alt + B = Focus bookmark title
    if (e.altKey && e.key === 'b') {
        e.preventDefault();
        document.getElementById('bookmarkTitle').focus();
    }
});

// Performance Optimizations
// Debounce function for auto-save
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

// Debounced auto-save for notes
const debouncedAutoSave = debounce(autoSaveNotes, 1000);

// Enhanced Auto-Save Configuration
const AUTO_SAVE_CONFIG = {
    debounceDelay: 500, // Save after 500ms of no typing
    showSaveIndicator: true
};

let autoSaveTimers = {};
let saveIndicators = {};

// Replace the direct auto-save listener with enhanced version
document.addEventListener('DOMContentLoaded', function() {
    setupEnhancedAutoSave();
    showAutoSaveStatus();
});

function setupEnhancedAutoSave() {
    console.log('🔄 Initializing enhanced auto-save...');
    
    // Enhanced notes auto-save
    const notesTextarea = document.getElementById('quickNotes');
    if (notesTextarea) {
        // Auto-save on input with debouncing and visual feedback
        notesTextarea.addEventListener('input', function() {
            clearTimeout(autoSaveTimers.notes);
            showSavingIndicator('notes');
            
            autoSaveTimers.notes = setTimeout(() => {
                autoSaveNotesEnhanced();
            }, AUTO_SAVE_CONFIG.debounceDelay);
        });
        
        // Save on focus loss
        notesTextarea.addEventListener('blur', function() {
            autoSaveNotesEnhanced();
        });
        
        // Save on Ctrl+S
        notesTextarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                autoSaveNotesEnhanced();
                showSaveSuccess('notes');
            }
        });
    }
    
    // Periodic backup every 30 seconds
    setInterval(performPeriodicBackup, 30000);
    
    // Emergency backup on page unload
    window.addEventListener('beforeunload', performEmergencyBackup);
    
    console.log('✅ Enhanced auto-save initialized!');
}

function autoSaveNotesEnhanced() {
    const notesTextarea = document.getElementById('quickNotes');
    if (!notesTextarea) return;
    
    try {
        const currentNotes = notesTextarea.value;
        
        // Only save if content changed
        if (currentNotes !== notes) {
            notes = currentNotes;
            localStorage.setItem('dashboardNotes', notes);
            localStorage.setItem('dashboardNotesBackup', notes);
            localStorage.setItem('dashboardNotesTimestamp', Date.now().toString());
            
            showSaveSuccess('notes');
            console.log('📝 Notes auto-saved');
        }
    } catch (error) {
        console.error('❌ Failed to save notes:', error);
        showSaveError('notes');
    }
}

// Save indicators
function showSavingIndicator(type) {
    if (!AUTO_SAVE_CONFIG.showSaveIndicator) return;
    
    const indicator = getSaveIndicator(type);
    indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    indicator.className = 'save-indicator saving';
    indicator.style.opacity = '1';
}

function showSaveSuccess(type) {
    if (!AUTO_SAVE_CONFIG.showSaveIndicator) return;
    
    const indicator = getSaveIndicator(type);
    indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
    indicator.className = 'save-indicator success';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

function showSaveError(type) {
    if (!AUTO_SAVE_CONFIG.showSaveIndicator) return;
    
    const indicator = getSaveIndicator(type);
    indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Save Failed';
    indicator.className = 'save-indicator error';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 3000);
}

function getSaveIndicator(type) {
    if (!saveIndicators[type]) {
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
            pointer-events: none;
            background: var(--success-color);
            color: white;
        `;
        
        // Find the appropriate widget
        let widget;
        switch(type) {
            case 'notes':
                widget = document.querySelector('.notes-widget');
                break;
            case 'bookmarks':
                widget = document.querySelector('.bookmarks-widget');
                break;
            case 'todos':
                widget = document.querySelector('.todo-widget');
                break;
        }
        
        if (widget) {
            widget.style.position = 'relative';
            widget.appendChild(indicator);
        }
        
        saveIndicators[type] = indicator;
    }
    
    return saveIndicators[type];
}

// Periodic backup
function performPeriodicBackup() {
    try {
        const backup = {
            notes: notes,
            bookmarks: bookmarks,
            todos: todos,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem('dashboardFullBackup', JSON.stringify(backup));
        console.log('💾 Periodic backup completed');
    } catch (error) {
        console.error('❌ Periodic backup failed:', error);
    }
}

// Emergency backup on page unload
function performEmergencyBackup() {
    try {
        const notesTextarea = document.getElementById('quickNotes');
        if (notesTextarea) {
            localStorage.setItem('dashboardNotes', notesTextarea.value);
        }
        
        localStorage.setItem('dashboardBookmarks', JSON.stringify(bookmarks));
        localStorage.setItem('dashboardTodos', JSON.stringify(todos));
        
        console.log('🚨 Emergency backup completed');
    } catch (error) {
        console.error('❌ Emergency backup failed:', error);
    }
}

// Auto-save status indicator
function showAutoSaveStatus() {
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'autosave-status';
        statusDiv.innerHTML = '<i class="fas fa-save"></i> Auto-save: ON';
        statusDiv.style.cssText = `
            font-size: 11px;
            color: var(--success-color);
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: pulse 2s infinite;
        `;
        headerInfo.appendChild(statusDiv);
    }
}

// Export functions for global access
window.appendToCalculator = appendToCalculator;
window.clearCalculator = clearCalculator;
window.deleteLast = deleteLast;
window.calculateResult = calculateResult;
window.deleteBookmark = deleteBookmark;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;