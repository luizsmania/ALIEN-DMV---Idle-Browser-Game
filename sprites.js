// Sprite System for ALIEN DMV
// This file manages sprite animations and provides fallbacks

const SPRITE_CONFIG = {
    // Sprite sheet paths (update these when you have actual sprite sheets)
    sheets: {
        aliens: 'sprites/aliens_sheet.png',
        ui: 'sprites/ui_sheet.png',
        effects: 'sprites/effects_sheet.png',
        background: 'sprites/background_sheet.png'
    },
    
    // Sprite size (64x64 or 96x96 recommended)
    spriteSize: 64,
    
    // Frame data for each animation
    animations: {
        // Zorglax Blob
        blob_idle: { frames: 3, duration: 1000, loop: true },
        blob_process: { frames: 2, duration: 500, loop: true },
        blob_split: { frames: 3, duration: 600, loop: false },
        
        // Slimoid Tentacloid
        tent_idle: { frames: 3, duration: 1000, loop: true },
        tent_process: { frames: 2, duration: 500, loop: true },
        tent_smudge: { frames: 2, duration: 400, loop: false },
        
        // Low-Gravity Greegan
        greegan_idle: { frames: 3, duration: 1200, loop: true },
        greegan_process: { frames: 2, duration: 500, loop: true },
        greegan_float: { frames: 4, duration: 800, loop: false },
        
        // Four-Eyed Bureaucrat
        four_idle: { frames: 3, duration: 1000, loop: true },
        four_process: { frames: 2, duration: 500, loop: true },
        four_stamp_self: { frames: 3, duration: 600, loop: false },
        
        // Time-Loop Worm
        worm_idle: { frames: 3, duration: 1000, loop: true },
        worm_process: { frames: 2, duration: 500, loop: true },
        worm_reenter: { frames: 4, duration: 1000, loop: false },
        
        // Exploding Kraknid
        krak_idle: { frames: 3, duration: 1000, loop: true },
        krak_process: { frames: 2, duration: 500, loop: true },
        krak_explode: { frames: 5, duration: 800, loop: false },
        
        // Bureaucrat Overlord
        overlord_idle: { frames: 4, duration: 1500, loop: true },
        overlord_process: { frames: 2, duration: 500, loop: true },
        overlord_glow: { frames: 4, duration: 1000, loop: false },
        
        // UI Effects
        stamp_effect: { frames: 3, duration: 500, loop: false },
        particle_stars: { frames: 3, duration: 1000, loop: true },
        particle_smoke: { frames: 3, duration: 800, loop: true },
        particle_spark: { frames: 3, duration: 600, loop: true },
        
        // Prestige
        prestige_portal_idle: { frames: 4, duration: 2000, loop: true },
        prestige_portal_open: { frames: 4, duration: 1500, loop: false }
    },
    
    // Sprite sheet layout definition
    // This defines the grid layout - positions are calculated automatically
    spriteLayout: {
        // Row 0: Zorglax Blob
        row0: { species: 'blob', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'split', frames: 3, startCol: 5 }
        ]},
        // Row 1: Slimoid Tentacloid
        row1: { species: 'tent', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'smudge', frames: 2, startCol: 5 }
        ]},
        // Row 2: Low-Gravity Greegan
        row2: { species: 'greegan', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'float', frames: 4, startCol: 5 }
        ]},
        // Row 3: Four-Eyed Bureaucrat
        row3: { species: 'four', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'stamp_self', frames: 3, startCol: 5 }
        ]},
        // Row 4: Time-Loop Worm
        row4: { species: 'worm', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'reenter', frames: 4, startCol: 5 }
        ]},
        // Row 5: Exploding Kraknid
        row5: { species: 'krak', animations: [
            { name: 'idle', frames: 3, startCol: 0 },
            { name: 'process', frames: 2, startCol: 3 },
            { name: 'explode', frames: 5, startCol: 5 }
        ]},
        // Row 6: Bureaucrat Overlord
        row6: { species: 'overlord', animations: [
            { name: 'idle', frames: 4, startCol: 0 },
            { name: 'process', frames: 2, startCol: 4 },
            { name: 'glow', frames: 4, startCol: 6 }
        ]}
    },
    
    // Emoji fallbacks for each species
    emojiFallbacks: {
        zorglax_blob: '🟢',
        slimoid_tentacloid: '🐙',
        low_gravity_greegan: '👾',
        four_eyed_bureaucrat: '👓',
        time_loop_worm: '🐛',
        exploding_kraknid: '💥',
        bureaucrat_overlord: '👑'
    }
};

// Sprite Manager Class
class SpriteManager {
    constructor() {
        this.sheetsLoaded = false;
        this.sheets = {};
        this.useSprites = true; // Set to true when sprite sheets are available
        this.spritePositions = {}; // Auto-calculated positions
        this.calculateSpritePositions();
    }
    
    // Automatically calculate sprite positions from layout
    calculateSpritePositions() {
        this.spritePositions = {};
        
        Object.keys(SPRITE_CONFIG.spriteLayout).forEach((rowKey, rowIndex) => {
            const row = SPRITE_CONFIG.spriteLayout[rowKey];
            const species = row.species;
            
            row.animations.forEach(anim => {
                for (let frame = 1; frame <= anim.frames; frame++) {
                    const frameName = `${species}_${anim.name}_${frame}`;
                    const col = anim.startCol + (frame - 1);
                    this.spritePositions[frameName] = { x: col, y: rowIndex };
                }
            });
        });
    }
    
    // Get sprite position for a frame
    getSpritePosition(frameName) {
        return this.spritePositions[frameName] || null;
    }
    
    // Load sprite sheets
    async loadSheets() {
        if (!this.useSprites) {
            return; // Skip loading if sprites aren't enabled
        }
        
        const loadPromises = Object.entries(SPRITE_CONFIG.sheets).map(([name, path]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sheets[name] = img;
                    console.log(`✓ Loaded sprite sheet: ${name} (${img.width}×${img.height}px)`);
                    
                    // Validate sprite sheet dimensions for aliens sheet
                    if (name === 'aliens') {
                        const expectedWidth = 10 * SPRITE_CONFIG.spriteSize; // 10 columns max
                        const expectedHeight = 7 * SPRITE_CONFIG.spriteSize; // 7 rows
                        if (img.width < expectedWidth || img.height < expectedHeight) {
                            console.warn(`⚠️ Sprite sheet dimensions may be incorrect. Expected at least ${expectedWidth}×${expectedHeight}px, got ${img.width}×${img.height}px`);
                        } else {
                            console.log(`✓ Sprite sheet dimensions validated`);
                        }
                    }
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`✗ Failed to load sprite sheet: ${path}`);
                    console.warn(`  Make sure the file exists at: ${path}`);
                    if (name === 'aliens') {
                        console.warn(`  Falling back to emoji sprites`);
                        this.useSprites = false; // Fallback to emojis
                    }
                    resolve();
                };
                img.src = path;
            });
        });
        
        await Promise.all(loadPromises);
        this.sheetsLoaded = true;
        
        if (this.useSprites) {
            console.log('Sprite system ready! Calculated positions for', Object.keys(this.spritePositions).length, 'frames');
        }
    }
    
    // Debug: Print sprite layout info
    printSpriteLayout() {
        console.log('=== Sprite Sheet Layout ===');
        console.log('Sprite Size:', SPRITE_CONFIG.spriteSize, 'px');
        console.log('Total Frames:', Object.keys(this.spritePositions).length);
        console.log('\nLayout by Row:');
        Object.keys(SPRITE_CONFIG.spriteLayout).forEach((rowKey, rowIndex) => {
            const row = SPRITE_CONFIG.spriteLayout[rowKey];
            console.log(`Row ${rowIndex} (${row.species}):`);
            row.animations.forEach(anim => {
                console.log(`  - ${anim.name}: ${anim.frames} frames starting at column ${anim.startCol}`);
            });
        });
    }
    
    // Get sprite element for an animation
    getSpriteElement(animationName, speciesId = null, _recursionDepth = 0) {
        // Prevent infinite recursion
        if (_recursionDepth > 2) {
            console.error(`Recursion limit reached for animation: ${animationName}`);
            const emoji = speciesId ? SPRITE_CONFIG.emojiFallbacks[speciesId] || '👽' : '👽';
            const element = document.createElement('div');
            element.className = 'sprite-emoji-fallback';
            element.textContent = emoji;
            return element;
        }
        
        if (!this.useSprites || !this.sheetsLoaded) {
            // Return emoji fallback
            const emoji = speciesId ? SPRITE_CONFIG.emojiFallbacks[speciesId] || '👽' : '👽';
            const element = document.createElement('div');
            element.className = 'sprite-emoji-fallback';
            element.textContent = emoji;
            return element;
        }
        
        const animation = SPRITE_CONFIG.animations[animationName];
        if (!animation) {
            console.warn(`Animation not found: ${animationName}`);
            // Try to get proper idle animation based on species, or fallback to emoji
            if (speciesId) {
                const prefix = this.getSpeciesPrefix(speciesId);
                const idleAnimation = `${prefix}_idle`;
                if (SPRITE_CONFIG.animations[idleAnimation]) {
                    return this.getSpriteElement(idleAnimation, speciesId, _recursionDepth + 1);
                }
            }
            // Final fallback: return emoji
            const emoji = speciesId ? SPRITE_CONFIG.emojiFallbacks[speciesId] || '👽' : '👽';
            const element = document.createElement('div');
            element.className = 'sprite-emoji-fallback';
            element.textContent = emoji;
            return element;
        }
        
        const element = document.createElement('div');
        element.className = `sprite-animation sprite-${animationName}`;
        element.style.width = SPRITE_CONFIG.spriteSize + 'px';
        element.style.height = SPRITE_CONFIG.spriteSize + 'px';
        
        // Set up CSS animation
        this.setupSpriteAnimation(element, animationName, animation);
        
        return element;
    }
    
    // Set up CSS sprite animation
    setupSpriteAnimation(element, animationName, animation) {
        const frames = animation.frames;
        const duration = animation.duration;
        const loop = animation.loop ? 'infinite' : '1';
        
        // Create keyframes for sprite sheet animation
        const keyframes = [];
        for (let i = 0; i < frames; i++) {
            const frameName = `${animationName}_${i + 1}`;
            const pos = this.getSpritePosition(frameName);
            if (pos) {
                const x = -pos.x * SPRITE_CONFIG.spriteSize;
                const y = -pos.y * SPRITE_CONFIG.spriteSize;
                keyframes.push({
                    backgroundPosition: `${x}px ${y}px`
                });
            }
        }
        
        // Add to stylesheet dynamically
        const styleId = `sprite-${animationName}`;
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            
            let keyframeCSS = `@keyframes ${animationName}Anim {`;
            keyframes.forEach((frame, index) => {
                const percent = (index / (frames - 1)) * 100;
                keyframeCSS += `${percent}% { background-position: ${frame.backgroundPosition}; }`;
            });
            keyframeCSS += '}';
            
            style.textContent = `
                ${keyframeCSS}
                .sprite-${animationName} {
                    background-image: url(${SPRITE_CONFIG.sheets.aliens});
                    background-size: auto;
                    animation: ${animationName}Anim ${duration}ms ${loop};
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // Play a quirk animation
    playQuirkAnimation(speciesId, quirkType, element) {
        const quirkAnimations = {
            zorglax_blob: { split: 'blob_split' },
            slimoid_tentacloid: { smudge: 'tent_smudge' },
            low_gravity_greegan: { float_away: 'greegan_float' },
            four_eyed_bureaucrat: { self_approval: 'four_stamp_self' },
            time_loop_worm: { time_loop: 'worm_reenter' },
            exploding_kraknid: { explode: 'krak_explode' },
            bureaucrat_overlord: { license_multiplier: 'overlord_glow' }
        };
        
        const speciesQuirks = quirkAnimations[speciesId];
        if (speciesQuirks && speciesQuirks[quirkType]) {
            const animationName = speciesQuirks[quirkType];
            const sprite = this.getSpriteElement(animationName, speciesId);
            
            // Replace current sprite temporarily
            if (element && element.parentNode) {
                const parent = element.parentNode;
                try {
                    parent.replaceChild(sprite, element);
                    
                    // Restore after animation
                    const animation = SPRITE_CONFIG.animations[animationName];
                    if (animation && !animation.loop) {
                        setTimeout(() => {
                            const prefix = this.getSpeciesPrefix(speciesId);
                            const idleSprite = this.getSpriteElement(`${prefix}_idle`, speciesId);
                            if (sprite.parentNode) {
                                sprite.parentNode.replaceChild(idleSprite, sprite);
                            }
                        }, animation.duration);
                    }
                } catch (e) {
                    console.warn('Failed to play quirk animation:', e);
                }
            }
        }
    }
    
    // Get species prefix for animation names
    getSpeciesPrefix(speciesId) {
        const prefixMap = {
            zorglax_blob: 'blob',
            slimoid_tentacloid: 'tent',
            low_gravity_greegan: 'greegan',
            four_eyed_bureaucrat: 'four',
            time_loop_worm: 'worm',
            exploding_kraknid: 'krak',
            bureaucrat_overlord: 'overlord'
        };
        return prefixMap[speciesId] || 'blob';
    }
    
    // Get animation name for species and state
    getAnimationName(speciesId, state = 'idle') {
        const prefix = this.getSpeciesPrefix(speciesId);
        return `${prefix}_${state}`;
    }
}

// Global sprite manager instance
const spriteManager = new SpriteManager();

// Initialize sprite system
if (spriteManager.useSprites) {
    spriteManager.loadSheets().then(() => {
        if (spriteManager.useSprites && spriteManager.sheetsLoaded) {
            console.log('🎨 Sprite system initialized successfully!');
            console.log('📊 Sprite positions calculated:', Object.keys(spriteManager.spritePositions).length, 'frames');
            // Uncomment to see detailed layout info:
            // spriteManager.printSpriteLayout();
        } else {
            console.warn('⚠️ Sprite system using emoji fallbacks');
        }
    }).catch(err => {
        console.error('❌ Error loading sprites:', err);
    });
}

