# Gemini AI Sprite Sheet Generation Prompt

Copy and paste this prompt into Gemini AI to generate the complete sprite sheet:

---

**PROMPT:**

Create a single, organized sprite sheet image for a browser-based idle game called "ALIEN DMV". The sprite sheet should be a grid layout with all sprites arranged in rows. Each sprite should be exactly 64×64 pixels. Use a transparent background (PNG format).

**SPRITE SHEET LAYOUT (Grid Format):**

**ROW 0 - Zorglax Blob (Green Blob Alien):**
- Column 0-2: Idle animation (3 frames) - blob gently pulsing/breathing
- Column 3-4: Processing animation (2 frames) - blob being stamped/processed
- Column 5-7: Split quirk animation (3 frames) - blob dividing into two identical blobs

**ROW 1 - Slimoid Tentacloid (Octopus-like Alien):**
- Column 0-2: Idle animation (3 frames) - tentacles gently waving
- Column 3-4: Processing animation (2 frames) - tentacles holding form
- Column 5-6: Smudge quirk animation (2 frames) - ink splatter effect on form

**ROW 2 - Low-Gravity Greegan (Floating Alien):**
- Column 0-2: Idle animation (3 frames) - slight up/down floating motion
- Column 3-4: Processing animation (2 frames) - being processed while floating
- Column 5-8: Float away quirk animation (4 frames) - drifting upward and fading out

**ROW 3 - Four-Eyed Bureaucrat (Alien with Glasses):**
- Column 0-2: Idle animation (3 frames) - adjusting glasses, looking official
- Column 3-4: Processing animation (2 frames) - reviewing documents
- Column 5-7: Self-approval quirk animation (3 frames) - stamping own document with approval

**ROW 4 - Time-Loop Worm (Worm-like Alien):**
- Column 0-2: Idle animation (3 frames) - wiggling/writhing motion
- Column 3-4: Processing animation (2 frames) - being processed
- Column 5-8: Reenter quirk animation (4 frames) - accelerating out of frame then reappearing from opposite side

**ROW 5 - Exploding Kraknid (Volatile Alien):**
- Column 0-2: Idle animation (3 frames) - slightly shaking/unstable
- Column 3-4: Processing animation (2 frames) - being carefully processed
- Column 5-9: Explode quirk animation (5 frames) - comedic explosion with smoke cloud, expanding then fading

**ROW 6 - Bureaucrat Overlord (Royal/God-like Alien):**
- Column 0-3: Idle animation (4 frames) - floating majestically, radiating authority
- Column 4-5: Processing animation (2 frames) - processing with divine presence
- Column 6-9: Glow quirk animation (4 frames) - radiating golden energy/light

**VISUAL STYLE:**
- Pixel art style (or clean vector-style if preferred)
- Sci-fi/comedy theme - absurd and humorous
- Bright, vibrant colors
- Each alien should be clearly distinct and recognizable
- Animations should be smooth and loopable where indicated
- Quirk animations should be dramatic and eye-catching

**TECHNICAL REQUIREMENTS:**
- Total size: Calculate based on widest row (10 columns) × 7 rows = 640×448 pixels minimum
- Each sprite: Exactly 64×64 pixels
- Background: Transparent (alpha channel)
- Format: PNG
- Grid alignment: Perfect alignment, no gaps between sprites (or 1px gap if preferred for clarity)
- Color depth: 32-bit RGBA

**ADDITIONAL NOTES:**
- The sprite sheet will be used in a web browser game
- Sprites should face the camera/viewer
- Keep animations simple but expressive
- Consider the comedic/bureaucratic theme - make it fun and absurd
- Ensure good contrast so sprites are visible on dark backgrounds

Generate this as a single PNG image file with all sprites arranged in the exact grid layout described above.

---

**ALTERNATIVE PROMPT (More Detailed):**

Create a comprehensive sprite sheet for "ALIEN DMV" - an idle browser game about processing aliens at an intergalactic DMV. 

**SPECIFICATIONS:**
- Sprite size: 64×64 pixels each
- Layout: 7 rows × 10 columns maximum
- Style: Pixel art or clean cartoon style
- Theme: Comedic sci-fi bureaucracy

**DETAILED SPRITE DESCRIPTIONS:**

**ROW 0: Zorglax Blob (🟢)**
- Frames 0-2: Green gelatinous blob, pulsing gently (idle)
- Frames 3-4: Blob being flattened/stamped (processing)
- Frames 5-7: Blob splitting into two identical blobs (split quirk)

**ROW 1: Slimoid Tentacloid (🐙)**
- Frames 0-2: Purple octopus-like creature, tentacles waving (idle)
- Frames 3-4: Tentacles holding paperwork (processing)
- Frames 5-6: Ink splatter effect, form getting smudged (smudge quirk)

**ROW 2: Low-Gravity Greegan (👾)**
- Frames 0-2: Blue floating creature, bobbing up and down (idle)
- Frames 3-4: Being processed while floating (processing)
- Frames 5-8: Drifting upward and fading away (float away quirk)

**ROW 3: Four-Eyed Bureaucrat (👓)**
- Frames 0-2: Alien with four eyes and glasses, looking official (idle)
- Frames 3-4: Reviewing documents with all four eyes (processing)
- Frames 5-7: Stamping own document with "APPROVED" (self-approval quirk)

**ROW 4: Time-Loop Worm (🐛)**
- Frames 0-2: Worm-like creature wiggling (idle)
- Frames 3-4: Being processed (processing)
- Frames 5-8: Accelerating to the right, disappearing, then reappearing from left (time loop quirk)

**ROW 5: Exploding Kraknid (💥)**
- Frames 0-2: Red/orange creature, slightly shaking (idle)
- Frames 3-4: Being carefully processed (processing)
- Frames 5-9: Explosion sequence - expanding, smoke cloud, comedic "BOOM" effect (explode quirk)

**ROW 6: Bureaucrat Overlord (👑)**
- Frames 0-3: Majestic floating alien with crown/aura (idle)
- Frames 4-5: Processing with divine presence (processing)
- Frames 6-9: Radiating golden energy/light, glowing effect (glow quirk)

**OUTPUT:**
Single PNG image, 640×448 pixels (or larger if you add padding), transparent background, all sprites perfectly aligned in a grid.

---

**USAGE:**
1. Copy one of the prompts above
2. Paste into Gemini AI (or similar image generation AI)
3. Download the generated sprite sheet
4. Save as `sprites/aliens_sheet.png` in your game folder
5. The JavaScript will automatically detect and use the sprites!

