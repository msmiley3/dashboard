// AI Integration Functions - Add to your script.js

// AI State Management
let geminiApiKey = localStorage.getItem('geminiApiKey') || '';
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// Initialize AI functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAI();
    setupAIEventListeners();
    loadChatHistory();
    setupProductivityTabs();
});

function initializeAI() {
    // Load saved API key
    const apiKeyInput = document.getElementById('geminiApiKey');
    if (apiKeyInput && geminiApiKey) {
        apiKeyInput.value = geminiApiKey;
    }
    
    // Setup tab functionality
    setupProductivityTabs();
}

function setupAIEventListeners() {
    // Chat functionality
    const sendChatBtn = document.getElementById('sendChatBtn');
    const aiChatInput = document.getElementById('aiChatInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    
    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', saveGeminiApiKey);
    }
    
    // Code analysis buttons
    const analyzeCodeBtn = document.getElementById('analyzeCode');
    const improveCodeBtn = document.getElementById('improveCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const openInCursorBtn = document.getElementById('openInCursor');
    
    if (analyzeCodeBtn) {
        analyzeCodeBtn.addEventListener('click', analyzeCode);
    }
    
    if (improveCodeBtn) {
        improveCodeBtn.addEventListener('click', improveCode);
    }
    
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyCode);
    }
    
    if (openInCursorBtn) {
        openInCursorBtn.addEventListener('click', openInCursor);
    }
    
    // Productivity features
    const summarizeBtn = document.getElementById('summarizeText');
    const translateBtn = document.getElementById('translateText');
    const generateBtn = document.getElementById('generateContent');
    const codeHelpBtn = document.getElementById('getCodeHelp');
    
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', summarizeText);
    }
    
    if (translateBtn) {
        translateBtn.addEventListener('click', translateText);
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateContent);
    }
    
    if (codeHelpBtn) {
        codeHelpBtn.addEventListener('click', getCodeHelp);
    }
}

// Gemini API Integration
function saveGeminiApiKey() {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const saveBtn = document.getElementById('saveApiKey');
    
    geminiApiKey = apiKeyInput.value.trim();
    localStorage.setItem('geminiApiKey', geminiApiKey);
    
    // Visual feedback
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.classList.add('pulse');
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.classList.remove('pulse');
    }, 1500);
    
    showNotification('API key saved successfully!', 'success');
}

async function callGeminiAPI(prompt, context = '') {
    if (!geminiApiKey) {
        return 'Please enter your Gemini API key first. Get one free from Google AI Studio.';
    }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context ? `${context}\n\n${prompt}` : prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || 'No response generated.';
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        return `Error: ${error.message}. Please check your API key and try again.`;
    }
}

// Chat Functions
async function sendChatMessage() {
    const chatInput = document.getElementById('aiChatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendChatBtn');
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Show loading
    const loadingId = 'loading-' + Date.now();
    addChatMessage('<div class="ai-loading"><i class="fas fa-spinner fa-spin"></i> Thinking...</div>', 'ai', loadingId);
    
    // Disable send button
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await callGeminiAPI(message);
        
        // Remove loading message
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Add AI response
        addChatMessage(response, 'ai');
        
    } catch (error) {
        // Remove loading and show error
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
        addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
    
    // Re-enable send button
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
}

function addChatMessage(message, sender, id = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    if (id) messageDiv.id = id;
    
    const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    if (sender === 'user' || sender === 'ai') {
        chatHistory.push({ message, sender, timestamp: Date.now() });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory.slice(-50))); // Keep last 50 messages
    }
}

function loadChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Clear existing messages except welcome
    const welcomeMessage = chatMessages.querySelector('.ai-message');
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // Load last 10 messages
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(entry => {
        addChatMessage(entry.message, entry.sender);
    });
}

// Cursor Integration
function openCursorProject() {
    // Try to open Cursor with a project
    const cursorUrl = 'cursor://';
    window.open(cursorUrl, '_blank');
    showNotification('Opening Cursor... Make sure Cursor is installed on your system.', 'info');
}

function createNewFile() {
    // Create a new file dialog
    const fileName = prompt('Enter file name (with extension):');
    if (fileName) {
        const cursorUrl = `cursor://file/${encodeURIComponent(fileName)}`;
        window.open(cursorUrl, '_blank');
        showNotification(`Creating new file: ${fileName}`, 'success');
    }
}

function runCursorCommand() {
    // Open Cursor command palette
    showNotification('Use Ctrl+Shift+P (or Cmd+Shift+P on Mac) to open Cursor command palette', 'info');
}

function openCursorDocs() {
    window.open('https://cursor.sh/docs', '_blank');
}

async function analyzeCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter some code to analyze', 'warning');
        return;
    }
    
    const prompt = `Please analyze this code and provide insights about:
1. What it does
2. Potential issues or bugs
3. Performance considerations
4. Best practices suggestions

Code:
\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showAIResult(result, 'Code Analysis');
}

async function improveCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter some code to improve', 'warning');
        return;
    }
    
    const prompt = `Please improve this code by:
1. Fixing any bugs or issues
2. Optimizing performance
3. Adding proper error handling
4. Following best practices
5. Adding helpful comments

Original code:
\`\`\`
${codeSnippet}
\`\`\`

Please provide the improved version:`;
    
    const result = await callGeminiAPI(prompt);
    showAIResult(result, 'Code Improvement');
}

function copyCode() {
    const codeSnippet = document.getElementById('codeSnippet').value;
    navigator.clipboard.writeText(codeSnippet).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function openInCursor() {
    const codeSnippet = document.getElementById('codeSnippet').value;
    if (!codeSnippet) {
        showNotification('No code to open in Cursor', 'warning');
        return;
    }
    
    // Create a data URL with the code
    const blob = new Blob([codeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Try to download as a file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-snippet.txt';
    a.click();
    
    showNotification('Code downloaded. Open the file in Cursor.', 'info');
}

// Productivity Features
function setupProductivityTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

async function summarizeText() {
    const textToSummarize = document.getElementById('textToSummarize').value.trim();
    if (!textToSummarize) {
        showNotification('Please enter text to summarize', 'warning');
        return;
    }
    
    const prompt = `Please provide a concise summary of the following text:

${textToSummarize}`;
    
    const result = await callGeminiAPI(prompt);
    document.getElementById('summaryResult').textContent = result;
}

async function translateText() {
    const textToTranslate = document.getElementById('textToTranslate').value.trim();
    const fromLang = document.getElementById('translateFrom').value;
    const toLang = document.getElementById('translateTo').value;
    
    if (!textToTranslate) {
        showNotification('Please enter text to translate', 'warning');
        return;
    }
    
    const prompt = `Please translate the following text from ${fromLang === 'auto' ? 'auto-detected language' : fromLang} to ${toLang}:

${textToTranslate}`;
    
    const result = await callGeminiAPI(prompt);
    document.getElementById('translationResult').textContent = result;
}

async function generateContent() {
    const generateType = document.getElementById('generateType').value;
    const generatePrompt = document.getElementById('generatePrompt').value.trim();
    
    if (!generatePrompt) {
        showNotification('Please enter a description of what to generate', 'warning');
        return;
    }
    
    const prompt = `Please generate a ${generateType} based on this description:

${generatePrompt}

Make it professional, well-structured, and appropriate for the requested type.`;
    
    const result = await callGeminiAPI(prompt);
    document.getElementById('generateResult').textContent = result;
}

async function getCodeHelp() {
    const codeLanguage = document.getElementById('codeLanguage').value;
    const codeQuestion = document.getElementById('codeQuestion').value.trim();
    
    if (!codeQuestion) {
        showNotification('Please enter a coding question or paste code', 'warning');
        return;
    }
    
    const prompt = `As a ${codeLanguage} expert, please help with this question or code:

${codeQuestion}

Please provide:
1. A clear explanation
2. Working code examples if applicable
3. Best practices
4. Any relevant tips or warnings`;
    
    const result = await callGeminiAPI(prompt);
    document.getElementById('codeHelpResult').textContent = result;
}

// Quick AI Actions
async function explainCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const prompt = `Please explain what this code does in simple terms:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showQuickAIResult(result);
}

async function debugCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const prompt = `Please help debug this code. Identify any bugs, issues, or potential problems:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showQuickAIResult(result);
}

async function optimizeCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const prompt = `Please optimize this code for better performance and readability:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showQuickAIResult(result);
}

async function generateTests() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const prompt = `Please generate unit tests for this code:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showQuickAIResult(result);
}

async function addComments() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const prompt = `Please add helpful comments to this code to explain what it does:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(prompt);
    showQuickAIResult(result);
}

async function convertCode() {
    const codeSnippet = document.getElementById('codeSnippet').value.trim();
    if (!codeSnippet) {
        showNotification('Please enter code in the Cursor widget first', 'warning');
        return;
    }
    
    const targetLanguage = prompt('Convert to which language? (e.g., Python, JavaScript, Java, C++):');
    if (!targetLanguage) return;
    
    const promptText = `Please convert this code to ${targetLanguage}:

\`\`\`
${codeSnippet}
\`\`\``;
    
    const result = await callGeminiAPI(promptText);
    showQuickAIResult(result);
}

// Utility Functions
function showAIResult(result, title) {
    // Create a modal or overlay to show the result
    const modal = document.createElement('div');
    modal.className = 'ai-result-modal';
    modal.innerHTML = `
        <div class="ai-result-content">
            <h3>${title}</h3>
            <div class="ai-result-text">${result}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles for the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = modal.querySelector('.ai-result-content');
    content.style.cssText = `
        background: var(--secondary-bg);
        padding: 2rem;
        border-radius: var(--radius-lg);
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        color: var(--text-primary);
    `;
}

function showQuickAIResult(result) {
    const outputDiv = document.getElementById('quickAiOutput');
    outputDiv.innerHTML = `<pre class="code-highlight">${result}</pre>`;
}

// Export functions for global access
window.explainCode = explainCode;
window.debugCode = debugCode;
window.optimizeCode = optimizeCode;
window.generateTests = generateTests;
window.addComments = addComments;
window.convertCode = convertCode;
window.openCursorProject = openCursorProject;
window.createNewFile = createNewFile;
window.runCursorCommand = runCursorCommand;
window.openCursorDocs = openCursorDocs;