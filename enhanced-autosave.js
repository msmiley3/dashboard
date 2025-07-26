// Enhanced Auto-Save Functionality
// Add this to your script.js or replace the existing auto-save functions

// Enhanced Auto-Save Configuration
const AUTO_SAVE_CONFIG = {
    debounceDelay: 500, // Save after 500ms of no typing
    maxRetries: 3,
    showSaveIndicator: true
};

// Auto-save state tracking
let autoSaveTimers = {};
let saveIndicators = {};

// Initialize enhanced auto-save
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedAutoSave();
    showAutoSaveStatus();
});

function initializeEnhancedAutoSave() {
    console.log('🔄 Initializing enhanced auto-save...');
    
    // Enhanced notes auto-save
    setupNotesAutoSave();
    
    // Auto-save for bookmarks
    setupBookmarksAutoSave();
    
    // Auto-save for todos
    setupTodosAutoSave();
    
    // Periodic backup
    setInterval(performPeriodicBackup, 30000); // Every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', performEmergencyBackup);
    
    console.log('✅ Enhanced auto-save initialized!');
}

// Enhanced Notes Auto-Save
function setupNotesAutoSave() {
    const notesTextarea = document.getElementById('quickNotes');
    if (!notesTextarea) return;
    
    // Load existing notes
    const savedNotes = localStorage.getItem('dashboardNotes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
        notes = savedNotes;
    }
    
    // Auto-save on input with debouncing
    notesTextarea.addEventListener('input', function() {
        clearTimeout(autoSaveTimers.notes);
        showSavingIndicator('notes');
        
        autoSaveTimers.notes = setTimeout(() => {
            autoSaveNotes();
        }, AUTO_SAVE_CONFIG.debounceDelay);
    });
    
    // Save on focus loss
    notesTextarea.addEventListener('blur', function() {
        autoSaveNotes();
    });
    
    // Save on Enter key
    notesTextarea.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            autoSaveNotes();
            showSaveSuccess('notes');
        }
    });
}

// Enhanced auto-save notes function
function autoSaveNotes() {
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

// Enhanced Bookmarks Auto-Save
function setupBookmarksAutoSave() {
    // Load existing bookmarks
    const savedBookmarks = localStorage.getItem('dashboardBookmarks');
    if (savedBookmarks) {
        try {
            bookmarks = JSON.parse(savedBookmarks);
            renderBookmarks();
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            bookmarks = [];
        }
    }
}

// Enhanced bookmark saving
function saveBookmarksWithBackup() {
    try {
        const bookmarksData = JSON.stringify(bookmarks);
        localStorage.setItem('dashboardBookmarks', bookmarksData);
        localStorage.setItem('dashboardBookmarksBackup', bookmarksData);
        localStorage.setItem('dashboardBookmarksTimestamp', Date.now().toString());
        
        console.log('🔖 Bookmarks auto-saved');
        showSaveSuccess('bookmarks');
        return true;
    } catch (error) {
        console.error('❌ Failed to save bookmarks:', error);
        showSaveError('bookmarks');
        return false;
    }
}

// Enhanced Todos Auto-Save
function setupTodosAutoSave() {
    // Load existing todos
    const savedTodos = localStorage.getItem('dashboardTodos');
    if (savedTodos) {
        try {
            todos = JSON.parse(savedTodos);
            renderTodos();
        } catch (error) {
            console.error('Failed to load todos:', error);
            todos = [];
        }
    }
}

// Enhanced todo saving
function saveTodosWithBackup() {
    try {
        const todosData = JSON.stringify(todos);
        localStorage.setItem('dashboardTodos', todosData);
        localStorage.setItem('dashboardTodosBackup', todosData);
        localStorage.setItem('dashboardTodosTimestamp', Date.now().toString());
        
        console.log('✅ Todos auto-saved');
        showSaveSuccess('todos');
        return true;
    } catch (error) {
        console.error('❌ Failed to save todos:', error);
        showSaveError('todos');
        return false;
    }
}

// Enhanced bookmark functions
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
        url: url.startsWith('http') ? url : `https://${url}`,
        created: new Date().toISOString()
    };
    
    bookmarks.push(bookmark);
    
    // Auto-save immediately
    if (saveBookmarksWithBackup()) {
        titleInput.value = '';
        urlInput.value = '';
        renderBookmarks();
        showNotification(`Bookmark "${title}" added and saved!`, 'success');
    }
}

function deleteBookmark(id) {
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);
    if (bookmarkIndex > -1) {
        const deletedBookmark = bookmarks[bookmarkIndex];
        bookmarks.splice(bookmarkIndex, 1);
        
        // Auto-save immediately
        if (saveBookmarksWithBackup()) {
            renderBookmarks();
            showNotification(`Bookmark "${deletedBookmark.title}" deleted!`, 'success');
        }
    }
}

// Enhanced todo functions
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
        completed: false,
        created: new Date().toISOString()
    };
    
    todos.push(todo);
    
    // Auto-save immediately
    if (saveTodosWithBackup()) {
        todoInput.value = '';
        renderTodos();
        showNotification(`Task "${text}" added and saved!`, 'success');
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.modified = new Date().toISOString();
        
        // Auto-save immediately
        if (saveTodosWithBackup()) {
            renderTodos();
            showNotification(`Task ${todo.completed ? 'completed' : 'reopened'}!`, 'success');
        }
    }
}

function deleteTodo(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex > -1) {
        const deletedTodo = todos[todoIndex];
        todos.splice(todoIndex, 1);
        
        // Auto-save immediately
        if (saveTodosWithBackup()) {
            renderTodos();
            showNotification(`Task "${deletedTodo.text}" deleted!`, 'success');
        }
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
        } else {
            document.body.appendChild(indicator);
        }
        
        saveIndicators[type] = indicator;
    }
    
    return saveIndicators[type];
}

// Periodic backup
function performPeriodicBackup() {
    try {
        // Create complete backup
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
        // Quick save all data
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
    // Add auto-save status to header
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'autosave-status';
        statusDiv.innerHTML = '<i class="fas fa-save"></i> Auto-save: ON';
        statusDiv.style.cssText = `
            font-size: 12px;
            color: var(--success-color);
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        headerInfo.appendChild(statusDiv);
    }
}

// Data recovery functions
function recoverFromBackup() {
    try {
        const backup = localStorage.getItem('dashboardFullBackup');
        if (backup) {
            const data = JSON.parse(backup);
            
            // Restore notes
            if (data.notes) {
                const notesTextarea = document.getElementById('quickNotes');
                if (notesTextarea) {
                    notesTextarea.value = data.notes;
                    notes = data.notes;
                }
            }
            
            // Restore bookmarks
            if (data.bookmarks) {
                bookmarks = data.bookmarks;
                renderBookmarks();
            }
            
            // Restore todos
            if (data.todos) {
                todos = data.todos;
                renderTodos();
            }
            
            showNotification('Data recovered from backup!', 'success');
            return true;
        }
    } catch (error) {
        console.error('❌ Failed to recover from backup:', error);
    }
    return false;
}

// Export data function
function exportAllData() {
    const data = {
        notes: notes,
        bookmarks: bookmarks,
        todos: todos,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

// Add CSS for save indicators
const saveIndicatorStyles = `
<style>
.save-indicator.saving {
    background: var(--warning-color);
    color: white;
}

.save-indicator.success {
    background: var(--success-color);
    color: white;
}

.save-indicator.error {
    background: var(--error-color);
    color: white;
}

.autosave-status {
    animation: pulse 2s infinite;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', saveIndicatorStyles);

// Export functions for global access
window.addBookmark = addBookmark;
window.deleteBookmark = deleteBookmark;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.exportAllData = exportAllData;
window.recoverFromBackup = recoverFromBackup;