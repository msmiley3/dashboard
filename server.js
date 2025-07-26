const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'dashboard-data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve the dashboard files

// Ensure data file exists
async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({
            bookmarks: [],
            notes: [],
            settings: {},
            lastUpdated: new Date().toISOString()
        }));
    }
}

// Load data
async function loadData() {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Save data
async function saveData(data) {
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/data', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { bookmarks, notes, settings } = req.body;
        const data = {
            bookmarks: bookmarks || [],
            notes: notes || [],
            settings: settings || {},
            lastUpdated: new Date().toISOString()
        };
        
        await saveData(data);
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const data = await loadData();
        res.json({
            status: 'online',
            lastUpdated: data.lastUpdated,
            bookmarksCount: data.bookmarks.length,
            notesCount: data.notes.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Dashboard server running on http://localhost:${PORT}`);
    console.log(`Access your dashboard at: http://YOUR_PHONE_IP:${PORT}`);
});

module.exports = app; 