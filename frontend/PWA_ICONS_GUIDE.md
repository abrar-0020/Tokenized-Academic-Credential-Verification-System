# PWA Icon Guide

## Current Status
The app currently uses SVG icons which work in most modern browsers.

## To Convert SVG to PNG (Optional, for better compatibility):

### Option 1: Using Online Tool
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon-192.svg` and `icon-512.svg`
3. Convert to PNG
4. Download and replace the SVG files
5. Update `manifest.json` to change file extensions from `.svg` to `.png` and type from `image/svg+xml` to `image/png`

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then convert:
magick icon-192.svg -resize 192x192 icon-192.png
magick icon-512.svg -resize 512x512 icon-512.png
```

### Option 3: Custom Icons
You can replace the icons with your own custom design:
1. Create PNG images sized 192x192 and 512x512
2. Name them `icon-192.png` and `icon-512.png`
3. Place in `public/` folder
4. Update `manifest.json` icon paths if needed

## Testing PWA Installation

### Desktop (Chrome/Edge):
1. Open the website
2. Look for the install icon in the address bar
3. Or click the "Install App" button that appears

### Mobile (Android):
1. Open in Chrome mobile browser
2. Tap the "Install App" button
3. Or use browser menu → "Add to Home Screen"

### Mobile (iOS):
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

## What Users Will See
- An "Install App" button in the bottom-right corner
- Ability to install the app like a native app
- Works offline (basic functionality)
- Can be launched from home screen/desktop
