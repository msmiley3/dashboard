// Simplified Google Drive Sync for Dashboard
class GoogleDriveSyncSimple {
    constructor() {
        this.clientId = '791175486652-3u13nogr11nfp9k4t0o0cp4k9jev6hd4.apps.googleusercontent.com';
        this.apiKey = 'AIzaSyCBav64Zfasu1bMHumUvvLVZCjvuPjYu6s';
        this.isEnabled = false;
        this.fileId = null;
        this.fileName = 'dashboard-data.json';
    }

    // Initialize Google Drive sync
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
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                        });
                        
                        // Load GIS
                        const gisScript = document.createElement('script');
                        gisScript.src = 'https://accounts.google.com/gsi/client';
                        gisScript.onload = () => {
                            this.tokenClient = google.accounts.oauth2.initTokenClient({
                                client_id: this.clientId,
                                scope: 'https://www.googleapis.com/auth/drive.file',
                                callback: (tokenResponse) => {
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

    // Enable Google Drive sync
    async enableSync() {
        try {
            // Request access token
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
            
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

    // Start automatic sync (30 minutes)
    startAutoSync() {
        this.syncTimer = setInterval(() => {
            this.uploadData();
        }, 30 * 60 * 1000); // 30 minutes
    }

    // Stop automatic sync
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    // Find or create the data file
    async findOrCreateFile() {
        try {
            // Search for existing file
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name)'
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
            localStorage.setItem('google_drive_last_sync', new Date().toISOString());
        } catch (error) {
            console.error('Upload failed:', error);
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

    // Get sync status
    getStatus() {
        return {
            enabled: this.isEnabled,
            fileId: this.fileId,
            fileName: this.fileName,
            lastSync: localStorage.getItem('google_drive_last_sync')
        };
    }
}

// Export for use in main script
window.GoogleDriveSyncSimple = GoogleDriveSyncSimple;
