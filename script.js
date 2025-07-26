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
    localStorage.setItem('dashboardBookmarks', JSON.stringify(bookmarks));
    
    titleInput.value = '';
    urlInput.value = '';
    
    renderBookmarks();
}

function deleteBookmark(id) {
    bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    localStorage.setItem('dashboardBookmarks', JSON.stringify(bookmarks));
    renderBookmarks();
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
    localStorage.setItem('dashboardTodos', JSON.stringify(todos));
    
    todoInput.value = '';
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('dashboardTodos', JSON.stringify(todos));
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('dashboardTodos', JSON.stringify(todos));
    renderTodos();
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

// Replace the direct auto-save listener with debounced version
document.addEventListener('DOMContentLoaded', function() {
    const notesTextarea = document.getElementById('quickNotes');
    if (notesTextarea) {
        notesTextarea.addEventListener('input', debouncedAutoSave);
    }
});

// Export functions for global access
window.appendToCalculator = appendToCalculator;
window.clearCalculator = clearCalculator;
window.deleteLast = deleteLast;
window.calculateResult = calculateResult;
window.deleteBookmark = deleteBookmark;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;