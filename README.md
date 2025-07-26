# Personal Dashboard App

A beautiful, mobile-friendly dashboard application that helps you organize bookmarks, take notes, search the web, and check local weather.

## Features

### 🔍 Multi-Platform Search
- Search on Google, YouTube, X (Twitter), and TikTok
- Quick access buttons for each platform
- Enter key support for instant Google search

### 📚 Bookmark Management
- Add, organize, and delete bookmarks
- Categorize bookmarks for better organization
- Import/Export bookmarks as JSON files
- Automatic grouping by category
- Sample bookmarks included to get you started

### 📝 Notes System
- Create, edit, and delete notes
- Rich text content support
- Automatic timestamp tracking
- Edit notes with a simple modal interface

### 🌤️ Local Weather
- Real-time weather information
- Uses your device's location (with permission)
- Beautiful weather icons
- Temperature display in Celsius

### 📱 Mobile-Friendly Design
- Responsive layout that works on all devices
- Touch-friendly interface
- Optimized for mobile browsers
- Beautiful glassmorphism design

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Allow location access when prompted (for weather)
3. Start adding your bookmarks and notes!

### Adding Bookmarks
1. Click the "Add Bookmark" button
2. Fill in the title, URL, and category
3. Click "Save Bookmark"
4. Your bookmark will appear organized by category

### Creating Notes
1. Click the "Add Note" button
2. Enter a title and content
3. Click "Save Note"
4. Edit or delete notes using the action buttons

### Searching the Web
1. Type your search query in the search bar
2. Click on your preferred search platform:
   - **Google** - General web search
   - **YouTube** - Video search
   - **X** - Social media search
   - **TikTok** - Short video search
3. Or press Enter for Google search

### Importing/Exporting Bookmarks
- **Import**: Click "Import" and select a JSON file with your bookmarks
- **Export**: Click "Export" to download your bookmarks as a JSON file

## Technical Details

### Storage
- All data is stored locally in your browser using localStorage
- No server required - everything works offline
- Data persists between browser sessions

### Weather API
- Uses the free Open-Meteo API
- No API key required
- Requires location permission from your browser

### Browser Compatibility
- Works on all modern browsers
- Requires JavaScript enabled
- Best experience on Chrome, Firefox, Safari, and Edge

## File Structure
```
Dashboard/
├── index.html      # Main HTML file
├── styles.css      # CSS styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Customization

### Adding New Search Engines
To add a new search engine, edit the `search()` function in `script.js`:

```javascript
case 'newengine':
    searchUrl = `https://newengine.com/search?q=${encodeURIComponent(query)}`;
    break;
```

Then add a button in `index.html`:

```html
<button onclick="search('newengine')" class="search-btn newengine-btn">
    <i class="fas fa-search"></i> New Engine
</button>
```

### Changing Colors
The app uses CSS custom properties for easy color customization. Edit the gradient values in `styles.css`:

```css
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## Troubleshooting

### Weather Not Loading
- Make sure you've allowed location access in your browser
- Check your internet connection
- The weather service may be temporarily unavailable

### Data Not Saving
- Ensure JavaScript is enabled in your browser
- Check if localStorage is available (most modern browsers support it)
- Try clearing browser cache and reloading

### Mobile Issues
- Make sure you're using a modern mobile browser
- The app is optimized for touch interactions
- Landscape mode works best on tablets

## Privacy

- All data is stored locally on your device
- No data is sent to external servers (except weather API)
- Location is only used for weather information
- No tracking or analytics

## Future Enhancements

Potential features that could be added:
- Dark mode toggle
- More search engines
- Bookmark folders
- Note categories
- Weather forecasts
- Custom themes
- Data backup to cloud storage

## Support

Since you have no programming experience, here are some tips:
- The code is well-commented and easy to understand
- All files are self-contained and don't require installation
- You can modify colors and text without breaking functionality
- The app works offline once loaded

Enjoy your new personal dashboard! 🎉 