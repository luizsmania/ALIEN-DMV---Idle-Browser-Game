# Sprite Sheet Setup - Quick Guide

## ✅ What's Done

The JavaScript code has been updated to **automatically read sprite positions** from a grid layout. You no longer need to manually configure positions!

## 📋 Steps to Add Sprites

### 1. Generate the Sprite Sheet

**Option A: Use the concise prompt**
- Open `GEMINI_PROMPT.txt`
- Copy the entire contents
- Paste into Gemini AI (or similar AI image generator)
- Download the generated PNG

**Option B: Use the detailed prompt**
- Open `GEMINI_SPRITE_PROMPT.md`
- Copy one of the prompts
- Use with your preferred AI image generator

### 2. Save the Sprite Sheet

1. Create a `sprites` folder in your game directory (if it doesn't exist)
2. Save the generated image as: `sprites/aliens_sheet.png`

### 3. That's It!

The JavaScript will automatically:
- ✅ Load the sprite sheet
- ✅ Calculate all sprite positions from the grid
- ✅ Set up animations
- ✅ Use sprites instead of emojis

## 🔧 How It Works

The sprite system uses a **layout definition** in `sprites.js`:

```javascript
spriteLayout: {
    row0: { species: 'blob', animations: [
        { name: 'idle', frames: 3, startCol: 0 },
        { name: 'process', frames: 2, startCol: 3 },
        { name: 'split', frames: 3, startCol: 5 }
    ]},
    // ... more rows
}
```

The code automatically calculates positions like:
- `blob_idle_1` = Row 0, Column 0
- `blob_idle_2` = Row 0, Column 1
- `blob_process_1` = Row 0, Column 3
- etc.

## 🎮 Current Status

- ✅ Sprite system enabled (`useSprites = true`)
- ✅ Automatic position calculation
- ✅ All animations configured
- ✅ Quirk animations ready
- ⏳ Waiting for sprite sheet image

## 🐛 Troubleshooting

**Sprites not showing?**
1. Check browser console for errors
2. Verify file path: `sprites/aliens_sheet.png`
3. Ensure image is PNG with transparency
4. Check that sprite size is exactly 64×64px per frame

**Wrong sprites displaying?**
- Verify your sprite sheet matches the exact layout described in the prompt
- Check that sprites are aligned to a perfect grid
- Ensure no gaps or misalignment

**Still using emojis?**
- The system falls back to emojis if sprites fail to load
- Check browser console for loading errors
- Verify the file exists and path is correct

## 📊 Sprite Sheet Requirements

- **Format**: PNG with transparency
- **Sprite Size**: 64×64 pixels each
- **Layout**: 7 rows × 10 columns (640×448px minimum)
- **Grid**: Perfect alignment, no gaps
- **Style**: Pixel art or clean cartoon

## 🎨 Layout Reference

```
Row 0: [idle×3] [process×2] [split×3]
Row 1: [idle×3] [process×2] [smudge×2]
Row 2: [idle×3] [process×2] [float×4]
Row 3: [idle×3] [process×2] [stamp_self×3]
Row 4: [idle×3] [process×2] [reenter×4]
Row 5: [idle×3] [process×2] [explode×5]
Row 6: [idle×4] [process×2] [glow×4]
```

## ✨ Features

- **Automatic**: No manual position configuration needed
- **Flexible**: Easy to add new animations
- **Fallback**: Uses emojis if sprites fail
- **Optimized**: CSS animations for performance
- **Debugging**: Console logs show loading status

## 🚀 Next Steps

1. Generate sprite sheet using the prompt
2. Save to `sprites/aliens_sheet.png`
3. Refresh the game
4. Enjoy animated sprites!

The code is ready - just add the image file!

