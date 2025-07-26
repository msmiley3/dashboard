// Google Drive Sync for Academic Dashboard
class GoogleDriveSync {
    constructor() {
        this.clientId = 'YOUR_GOOGLE_CLIENT_ID'; // You'll get this from Google Cloud Console
        this.apiKey = 'YOUR_GOOGLE_API_KEY';
        this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
        this.scope = 'https://www.googleapis.com/auth/drive.file';
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.syncInterval = 30 * 60 * 1000; // 30 minutes
        this.syncTimer = null;
        this.isEnabled = false;
        this.fileId = null;
        this.fileName = 'dashboard-data.json';
    }

    // Initialize Google APIs
    async init() {
        try {
            // Load Google APIs
            await this.loadGoogleAPIs();
            
            // Check if user has enabled sync
            const syncEnabled = localStorage.getItem('google_drive_sync_enabled');
            if (syncEnabled === 'true') {
                this.isEnabled = true;
                await this.authenticate();
                this.startAutoSync();
            }
            
            return { success: true, message: 'Google Drive sync initialized' };
        } catch (error) {
            console.error('Google Drive init failed:', error);
            return { success: false, message: 'Failed to initialize Google Drive sync' };
        }
    }

    // Load Google APIs
    async loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            // Load GAPI
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.apiKey,
                            discoveryDocs: this.discoveryDocs,
                        });
                        this.gapiInited = true;
                        
                        // Load GIS
                        const gisScript = document.createElement('script');
                        gisScript.src = 'https://accounts.google.com/gsi/client';
                        gisScript.onload = () => {
                            this.tokenClient = google.accounts.oauth2.initTokenClient({
                                client_id: this.clientId,
                                scope: this.scope,
                                callback: (tokenResponse) => {
                                    this.gisInited = true;
                                    resolve();
                                },
                            });
                        };
                        document.head.appendChild(gisScript);
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            document.head.appendChild(gapiScript);
        });
    }

    // Authenticate user
    async authenticate() {
        if (!this.gapiInited || !this.gisInited) {
            throw new Error('Google APIs not initialized');
        }

        return new Promise((resolve, reject) => {
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
            
            // Set up callback
            this.tokenClient.callback = (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            };
        });
    }

    // Enable Google Drive sync
    async enableSync() {
        try {
            await this.authenticate();
            this.isEnabled = true;
            localStorage.setItem('google_drive_sync_enabled', 'true');
            this.startAutoSync();
            
            // Find or create the data file
            await this.findOrCreateFile();
            
            return { success: true, message: 'Google Drive sync enabled!' };
        } catch (error) {
            return { success: false, message: 'Failed to enable sync: ' + error.message };
        }
    }

    // Disable Google Drive sync
    disableSync() {
        this.isEnabled = false;
        localStorage.setItem('google_drive_sync_enabled', 'false');
        this.stopAutoSync();
    }

    // Start automatic sync
    startAutoSync() {
        if (this.syncTimer) clearInterval(this.syncTimer);
        
        this.syncTimer = setInterval(() => {
            this.autoSync();
        }, this.syncInterval);
    }

    // Stop automatic sync
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    // Automatic sync function
    async autoSync() {
        if (!this.isEnabled) return;
        
        try {
            await this.uploadData();
            console.log('Google Drive auto-sync completed');
        } catch (error) {
            console.error('Google Drive auto-sync failed:', error);
        }
    }

    // Manual sync
    async manualSync() {
        if (!this.isEnabled) {
            throw new Error('Google Drive sync not enabled');
        }
        
        try {
            await this.uploadData();
            return { success: true, message: 'Sync completed!' };
        } catch (error) {
            return { success: false, message: 'Sync failed: ' + error.message };
        }
    }

    // Find or create the data file
    async findOrCreateFile() {
        try {
            // Search for existing file
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name, modifiedTime)'
            });

            if (response.result.files.length > 0) {
                this.fileId = response.result.files[0].id;
                console.log('Found existing file:', this.fileId);
            } else {
                // Create new file
                const fileMetadata = {
                    name: this.fileName,
                    mimeType: 'application/json'
                };

                const createResponse = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: 'id'
                });

                this.fileId = createResponse.result.id;
                console.log('Created new file:', this.fileId);
            }
        } catch (error) {
            console.error('Error finding/creating file:', error);
            throw error;
        }
    }

    // Upload data to Google Drive
    async uploadData() {
        if (!this.fileId) {
            await this.findOrCreateFile();
        }

        const data = {
            bookmarks: JSON.parse(localStorage.getItem('dashboard_bookmarks') || '[]'),
            notes: JSON.parse(localStorage.getItem('dashboard_notes') || '[]'),
            settings: {
                theme: localStorage.getItem('dashboard_theme'),
                font: localStorage.getItem('dashboard_font')
            },
            lastSync: new Date().toISOString()
        };

        const fileContent = JSON.stringify(data, null, 2);

        try {
            await gapi.client.drive.files.update({
                fileId: this.fileId,
                media: {
                    mimeType: 'application/json',
                    body: fileContent
                }
            });

            console.log('Data uploaded to Google Drive');
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    // Download data from Google Drive
    async downloadData() {
        if (!this.fileId) {
            await this.findOrCreateFile();
        }

        try {
            const response = await gapi.client.drive.files.get({
                fileId: this.fileId,
                alt: 'media'
            });

            const data = JSON.parse(response.body);
            
            // Restore data
            if (data.bookmarks) {
                localStorage.setItem('dashboard_bookmarks', JSON.stringify(data.bookmarks));
            }
            if (data.notes) {
                localStorage.setItem('dashboard_notes', JSON.stringify(data.notes));
            }
            if (data.settings) {
                if (data.settings.theme) {
                    localStorage.setItem('dashboard_theme', data.settings.theme);
                }
                if (data.settings.font) {
                    localStorage.setItem('dashboard_font', data.settings.font);
                }
            }

            return { success: true, message: 'Data restored from Google Drive!' };
        } catch (error) {
            console.error('Download failed:', error);
            return { success: false, message: 'Failed to download data: ' + error.message };
        }
    }

    // Get sync status
    getStatus() {
        return {
            enabled: this.isEnabled,
            fileId: this.fileId,
            fileName: this.fileName,
            lastSync: localStorage.getItem('google_drive_last_sync'),
            nextSync: this.syncTimer ? Date.now() + this.syncInterval : null
        };
    }

    // Get file info
    async getFileInfo() {
        if (!this.fileId) return null;

        try {
            const response = await gapi.client.drive.files.get({
                fileId: this.fileId,
                fields: 'id,name,size,modifiedTime,createdTime'
            });

            return response.result;
        } catch (error) {
            console.error('Failed to get file info:', error);
            return null;
        }
    }
}

// Export for use in main script
window.GoogleDriveSync = GoogleDriveSync; 