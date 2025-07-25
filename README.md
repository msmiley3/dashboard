# Personal Dashboard App

A comprehensive, mobile-optimized dashboard application designed specifically for your Samsung Galaxy S24. This Progressive Web App (PWA) provides an all-in-one solution for productivity and quick access to essential tools.

## 🚀 Features

### Core Functionality
- **Multi-Source Search**: Search across Google, DuckDuckGo, Wikipedia, and YouTube
- **Note Taking**: Quick notes with auto-save functionality
- **Bookmark Manager**: Save and organize your favorite websites
- **To-Do List**: Task management with completion tracking
- **Calculator**: Full-featured calculator with standard operations
- **Weather Widget**: Location-based weather information
- **Quick Links**: One-click access to popular services

### Mobile Optimized
- **Progressive Web App**: Install on your home screen like a native app
- **Touch-Friendly**: Optimized for mobile interaction
- **Responsive Design**: Works perfectly on your Samsung Galaxy S24
- **Offline Support**: Core functionality available without internet
- **Dark Theme**: Easy on the eyes, perfect for any time of day

### Additional Features
- **Real-time Clock & Date**: Always stay informed of the current time
- **Local Storage**: All your data stays on your device
- **Keyboard Shortcuts**: Quick navigation for power users
- **Smooth Animations**: Polished, modern interface

## 📱 Installation on Samsung Galaxy S24

### Method 1: Browser Installation
1. Open Samsung Internet or Chrome on your Galaxy S24
2. Navigate to your dashboard URL
3. Tap the menu (three dots) → "Add to Home screen"
4. Tap "Install" when prompted
5. The app will appear on your home screen

### Method 2: PWA Installation
1. Open the dashboard in your browser
2. Look for the "Install App" button (floating button)
3. Tap "Install" to add it to your home screen
4. Access it like any other app

## 🎯 How to Use

### Search Functionality
- Type your query in the search bar
- Select your preferred search engine (Google, DuckDuckGo, Wikipedia, YouTube)
- Press Enter or tap the search button
- Results open in a new tab

### Notes
- Click in the notes area and start typing
- Notes auto-save as you type
- Use "Save" for immediate save or "Clear" to delete all notes

### Bookmarks
- Enter a title and URL in the bookmark section
- Tap "Add" to save the bookmark
- Click bookmarks to visit, or delete unwanted ones

### To-Do List
- Type a task and press Enter or tap "+"
- Check tasks as complete
- Delete tasks you no longer need

### Calculator
- Tap numbers and operators to build expressions
- Use "=" to calculate results
- "C" clears everything, "⌫" deletes the last character

### Weather
- Tap "Get Location" to fetch weather for your current location
- Requires location permission
- Shows current temperature and wind information

## ⌨️ Keyboard Shortcuts

- `Alt + S`: Focus search input
- `Alt + N`: Focus notes area
- `Alt + T`: Focus todo input
- `Alt + B`: Focus bookmark title input

## 🔧 Setup & Development

### Local Development
```bash
# Clone or download the files
# Serve with any HTTP server

# Python
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Files Structure
```
├── index.html          # Main app interface
├── styles.css          # Responsive styling
├── script.js           # App functionality
├── manifest.json       # PWA configuration
├── sw.js              # Service worker
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # This file
```

## 🌟 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... other variables */
}
```

### Adding Quick Links
Modify the quick links section in `index.html`:
```html
<a href="https://your-site.com" class="quick-link" target="_blank">
    <i class="fas fa-your-icon"></i>
    <span>Your Site</span>
</a>
```

### Weather API
The app uses Open-Meteo (free, no API key required). To use a different service:
1. Get an API key from your preferred weather service
2. Update the weather fetch URL in `script.js`
3. Modify the `displayWeather()` function to handle the new data format

## 📱 Samsung Galaxy S24 Specific Features

- **Edge Panel Integration**: Add the PWA to your edge panel for quick access
- **Bixby Routines**: Set up routines to open the dashboard
- **Samsung Internet**: Optimized for Samsung's browser
- **One UI Integration**: Follows Samsung's design principles

## 🔒 Privacy & Security

- **Local Storage**: All data stays on your device
- **No Tracking**: No analytics or user tracking
- **Offline First**: Core features work without internet
- **Secure**: HTTPS recommended for PWA features

## 🐛 Troubleshooting

### PWA Not Installing
- Ensure you're using HTTPS (required for PWA)
- Try clearing browser cache
- Check if "Add to Home Screen" option is available

### Weather Not Working
- Grant location permission to your browser
- Check if you're connected to the internet
- Try refreshing the page

### Data Not Saving
- Ensure browser allows local storage
- Check if you're in incognito/private mode
- Try clearing browser data and starting fresh

## 🚀 Future Enhancements

- [ ] Widget customization and reordering
- [ ] Data sync across devices
- [ ] More search engine options
- [ ] Advanced calculator functions
- [ ] Calendar integration
- [ ] News feed widget
- [ ] Pomodoro timer
- [ ] Password generator

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and improve this dashboard for your needs!

---

**Enjoy your new personal dashboard on your Samsung Galaxy S24!** 🎉