# Google Drive Sync Setup Guide

## 🎯 **Perfect for S24 Homepage - Permanent Cloud Backup**

This guide will set up automatic Google Drive backup for your dashboard. Your data will be permanently stored in the cloud and sync across all devices.

## 📋 **Prerequisites**

- Google account
- 5 minutes of setup time
- Basic computer knowledge

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a new project:**
   - Click "Select a project" → "New Project"
   - Name it: `Dashboard`
   - Click "Create"

3. **Enable Google Drive API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

### **Step 2: Create Credentials**

1. **Go to Credentials:**
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"

2. **Configure OAuth consent screen:**
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Dashboard`
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip scopes section, click "Save and Continue"
   - Add your email as test user
   - Click "Save and Continue"

3. **Create OAuth 2.0 Client ID:**
   - Application type: "Web application"
   - Name: `Dashboard Web Client`
   - Authorized JavaScript origins: Add your URLs:
     - `http://localhost:3000` (for testing)
     - `http://YOUR_COMPUTER_IP:3000` (for phone access)
     - `file://` (for local file access)
   - Click "Create"

4. **Save your credentials:**
   - Copy the **Client ID** (you'll need this)
   - Copy the **Client Secret** (you'll need this)

### **Step 3: Get API Key**

1. **Create API Key:**
   - In Credentials page, click "Create Credentials" → "API Key"
   - Copy the API Key

2. **Restrict the API Key (Optional but recommended):**
   - Click on the API Key
   - Under "Application restrictions" select "HTTP referrers"
   - Add your domains: `localhost:3000`, `YOUR_COMPUTER_IP:3000`
   - Under "API restrictions" select "Restrict key"
   - Select "Google Drive API"
   - Click "Save"

### **Step 4: Update Dashboard Code**

1. **Edit `google-drive-sync.js`:**
   ```javascript
   // Replace these lines in the constructor:
   this.clientId = 'YOUR_CLIENT_ID_HERE'; // Paste your Client ID
   this.apiKey = 'YOUR_API_KEY_HERE';     // Paste your API Key
   ```

2. **Example:**
   ```javascript
   this.clientId = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
   this.apiKey = 'AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz';
   ```

### **Step 5: Test the Setup**

1. **Open your dashboard:**
   - Load the dashboard in your browser
   - Open browser console (F12)

2. **Enable Google Drive sync:**
   - Click the "Sync" button in the bookmarks section
   - Authorize the app when prompted
   - Check console for success messages

3. **Test functionality:**
   - Add a bookmark
   - Add a note
   - Wait 30 minutes for auto-sync
   - Check Google Drive for the file: `dashboard-data.json`

## 📱 **S24 Homepage Setup**

### **Access from your phone:**
1. **Find your computer's IP:**
   - Windows: `ipconfig` in CMD
   - Mac/Linux: `ifconfig` in terminal
   - Look for local IP (192.168.x.x)

2. **Update authorized origins:**
   - Go back to Google Cloud Console
   - Add your computer's IP to authorized origins
   - Example: `http://192.168.1.100:3000`

3. **Access from S24:**
   - Open browser on your phone
   - Go to: `http://YOUR_COMPUTER_IP:3000`
   - Set as homepage

## 🔄 **How It Works**

### **Automatic Sync:**
- **Every 30 minutes** - data automatically uploads to Google Drive
- **File location** - `dashboard-data.json` in your Google Drive
- **Cross-device** - access from any device with internet

### **Data Safety:**
- ✅ **Permanent storage** - survives phone resets
- ✅ **Automatic backup** - no manual intervention needed
- ✅ **Version history** - Google Drive keeps file versions
- ✅ **Offline fallback** - works even without internet

### **Sync Features:**
- **Bookmarks** - all your academic links
- **Notes** - research notes and workflows
- **Settings** - themes and font preferences
- **Timestamps** - track when data was last synced

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"Google Drive sync not initialized"**
   - Check that API credentials are correct
   - Ensure Google Drive API is enabled
   - Check browser console for errors

2. **"Failed to enable sync"**
   - Verify authorized origins include your domain
   - Check that you're using HTTPS or localhost
   - Ensure you're signed into correct Google account

3. **"Upload failed"**
   - Check internet connection
   - Verify API quotas haven't been exceeded
   - Check browser console for detailed errors

### **Debug Steps:**
1. **Open browser console** (F12)
2. **Look for error messages**
3. **Check network tab** for failed requests
4. **Verify credentials** are correctly set

## 🔒 **Security Notes**

- **API Key** - Keep this private, but it's safe to use in client-side code
- **Client ID** - This is public and safe to share
- **OAuth tokens** - Automatically managed by Google
- **Data privacy** - Only you can access your data file

## 📊 **Monitoring**

### **Check sync status:**
- Open browser console
- Type: `googleDriveSync.getStatus()`
- This shows sync status and file info

### **Manual operations:**
- **Manual sync**: `manualGoogleDriveSync()`
- **Restore data**: `restoreFromGoogleDrive()`
- **Disable sync**: `disableGoogleDriveSync()`

## 🎯 **Perfect for Academic Use**

### **Benefits:**
- **Never lose data** - permanent cloud backup
- **Cross-device access** - phone, tablet, computer
- **Automatic sync** - no manual backup needed
- **Version control** - Google Drive keeps history
- **Free storage** - uses minimal Google Drive space

### **Dashboard Workflow:**
1. **Browse** - add your favorite bookmarks
2. **Take notes** - capture important information
3. **Auto-sync** - data backed up every 30 minutes
4. **Access anywhere** - continue on any device

Your dashboard now has enterprise-level data protection with Google Drive sync! 