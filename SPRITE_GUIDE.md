# Sprite Sheet Integration Guide - ALIEN DMV

This guide explains how to integrate sprite sheets into the ALIEN DMV game.

## Current Status

The game currently uses **emoji fallbacks** for all alien sprites. The sprite system is fully implemented and ready to use once sprite sheets are available.

## Sprite System Architecture

### Files
- `sprites.js` - Sprite manager and animation system
- `styles.css` - CSS animations for sprite effects
- `game.js` - Integrated sprite system calls

### How It Works

1. **Sprite Manager** (`SpriteManager` class) handles loading and displaying sprites
2. **Fallback System** - Uses emojis when sprites aren't available
3. **Animation System** - CSS keyframes for sprite sheet animations
4. **Quirk Animations** - Special animations for alien quirks

## Setting Up Sprite Sheets

### Step 1: Create Sprite Sheets

Create sprite sheets according to the specification in the sprite list. Recommended:
- **Size**: 64×64 or 96×96 pixels per frame
- **Format**: PNG with transparency
- **Layout**: Grid-based (see `spritePositions` in `sprites.js`)

### Step 2: Organize Files

Place sprite sheets in a `sprites/` folder:
```
sprites/
  ├── aliens_sheet.png
  ├── ui_sheet.png
  ├── effects_sheet.png
  └── background_sheet.png
```

### Step 3: Enable Sprites

In `sprites.js`, change:
```javascript
this.useSprites = false; // Set to true when sprite sheets are available
```
to:
```javascript
this.useSprites = true;
```

### Step 4: Update Sprite Sheet Paths

Update the paths in `SPRITE_CONFIG.sheets` if your files are in a different location:
```javascript
sheets: {
    aliens: 'sprites/aliens_sheet.png',
    ui: 'sprites/ui_sheet.png',
    effects: 'sprites/effects_sheet.png',
    background: 'sprites/background_sheet.png'
}
```

## Sprite Sheet Layout

The system expects a grid layout. Each sprite position is defined in `SPRITE_CONFIG.spritePositions`:

- **Row 0**: Zorglax Blob (idle, process, split)
- **Row 1**: Slimoid Tentacloid (idle, process, smudge)
- **Row 2**: Low-Gravity Greegan (idle, process, float)
- **Row 3**: Four-Eyed Bureaucrat (idle, process, stamp_self)
- **Row 4**: Time-Loop Worm (idle, process, reenter)
- **Row 5**: Exploding Kraknid (idle, process, explode)
- **Row 6**: Bureaucrat Overlord (idle, process, glow)

## Animation States

Each alien has three animation states:

1. **Idle** - Looping animation when waiting
2. **Process** - Looping animation during processing
3. **Quirk** - One-time animation when quirk triggers

## Customizing Animations

### Adding New Animations

1. Add animation config to `SPRITE_CONFIG.animations`:
```javascript
new_animation: { frames: 4, duration: 1000, loop: true }
```

2. Add sprite positions:
```javascript
new_animation_1: { x: 0, y: 7 },
new_animation_2: { x: 1, y: 7 },
// etc.
```

3. Update CSS if needed (for special effects)

### Adjusting Animation Speed

Modify the `duration` in `SPRITE_CONFIG.animations`:
- Lower duration = faster animation
- Higher duration = slower animation

## Testing Sprites

1. Enable `useSprites = true`
2. Load the game
3. Check browser console for loading errors
4. If sprites fail to load, the system automatically falls back to emojis

## Sprite Sheet Generator Tips

When creating sprite sheets:

1. **Consistency**: Keep all sprites the same size
2. **Spacing**: Leave 1-2px padding between sprites to avoid bleeding
3. **Transparency**: Use PNG with alpha channel
4. **Grid Alignment**: Ensure sprites align to a perfect grid
5. **Frame Order**: Follow the order specified in `spritePositions`

## Performance Considerations

- Sprite sheets are loaded once and cached
- CSS animations are hardware-accelerated
- Multiple aliens can share the same sprite sheet
- Consider sprite sheet size (keep under 2MB for web)

## Troubleshooting

### Sprites Not Showing
- Check browser console for 404 errors
- Verify file paths are correct
- Ensure `useSprites = true`
- Check that sprite sheet dimensions match `spriteSize` config

### Animations Not Playing
- Verify animation names match in `SPRITE_CONFIG`
- Check that sprite positions are correct
- Ensure CSS keyframes are generated (check browser DevTools)

### Wrong Sprites Displaying
- Verify `spritePositions` coordinates match your sprite sheet layout
- Check that row/column calculations are correct
- Test with a simple sprite first

## Future Enhancements

Potential improvements:
- Multiple sprite sheets per species
- Dynamic sprite loading
- Sprite caching optimization
- Particle effects integration
- Background parallax layers

