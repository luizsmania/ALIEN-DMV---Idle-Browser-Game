// Alien Species Definitions
const ALIEN_SPECIES = {
    // Beginner Species
    zorglax_blob: {
        id: 'zorglax_blob',
        name: 'Zorglax Blob',
        emoji: '🟢',
        baseSpeed: 3000,
        basePaperwork: 10,
        quirk: 'split',
        quirkChance: 0.10,
        unlocked: true,
        quotes: [
            "I definitely wasn't abducting anyone. I swear.",
            "Does this form require Form 17-B attached?",
            "My UFO only wobbles slightly, is that fine?",
            "I'm just a blob trying to get by in this universe."
        ],
        licenseNames: [
            "Permit to Hover Menacingly",
            "Certificate of Mild Abduction",
            "Interstellar Parallel Parking License"
        ]
    },
    
    slimoid_tentacloid: {
        id: 'slimoid_tentacloid',
        name: 'Slimoid Tentacloid',
        emoji: '🐙',
        baseSpeed: 2000,
        basePaperwork: 8,
        quirk: 'smudge',
        quirkChance: 0.10,
        unlocked: true,
        quotes: [
            "Oops, did I smudge that? My tentacles are so slippery!",
            "Can I use all eight tentacles to fill this out?",
            "I promise I won't accidentally erase anything... again.",
            "Form-filling is hard when you have no bones!"
        ],
        licenseNames: [
            "Multi-Limbed Operation Permit",
            "Tentacle Coordination Certificate",
            "Slippery Surface Navigation License"
        ]
    },
    
    low_gravity_greegan: {
        id: 'low_gravity_greegan',
        name: 'Low-Gravity Greegan',
        emoji: '👾',
        baseSpeed: 1500,
        basePaperwork: 5,
        quirk: 'float_away',
        quirkChance: 0.15,
        unlocked: true,
        quotes: [
            "Whoa, I'm floating again!",
            "Can you anchor me to the desk?",
            "Gravity is just a suggestion where I'm from.",
            "Oops, there I go!"
        ],
        licenseNames: [
            "Anti-Gravity Navigation Permit",
            "Floating Vehicle Operation Certificate",
            "Zero-G Maneuvering License"
        ]
    },
    
    four_eyed_bureaucrat: {
        id: 'four_eyed_bureaucrat',
        name: 'Four-Eyed Bureaucrat',
        emoji: '👓',
        baseSpeed: 4000,
        basePaperwork: 12,
        quirk: 'self_approval',
        quirkChance: 0.05,
        unlocked: true,
        quotes: [
            "I've reviewed my own application. It's perfect.",
            "As a fellow bureaucrat, I understand the process.",
            "I can see all four sides of this form simultaneously.",
            "Self-certification should be standard procedure."
        ],
        licenseNames: [
            "Self-Approved Operation Permit",
            "Bureaucratic Excellence Certificate",
            "Multi-Perspective Navigation License"
        ]
    },
    
    // Mid-Game Species (unlocked via upgrades)
    time_loop_worm: {
        id: 'time_loop_worm',
        name: 'Time-Loop Worm',
        emoji: '🐛',
        baseSpeed: 2500,
        basePaperwork: 15,
        quirk: 'time_loop',
        quirkChance: 1.0,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_time_worms' },
        quotes: [
            "I'll be back... I already was... I will be...",
            "Time is just a circle, like my queue position.",
            "I've done this before, and I'll do it again!",
            "Past me already filled this out, but here I am!"
        ],
        licenseNames: [
            "Temporal Navigation Permit",
            "Loop-Time Operation Certificate",
            "Chronological Paradox License"
        ]
    },
    
    exploding_kraknid: {
        id: 'exploding_kraknid',
        name: 'Exploding Kraknid',
        emoji: '💥',
        baseSpeed: 5000,
        basePaperwork: 20,
        quirk: 'explode',
        quirkChance: 0.15,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_kraknids' },
        quotes: [
            "I'm feeling a bit... volatile today.",
            "Don't worry, I only explode sometimes!",
            "My species has a short fuse, literally.",
            "BOOM! ...oh wait, not yet."
        ],
        licenseNames: [
            "Explosive Maneuver Permit",
            "Volatile Operation Certificate",
            "High-Energy Navigation License"
        ]
    },
    
    bureaucrat_overlord: {
        id: 'bureaucrat_overlord',
        name: 'Bureaucrat Overlord',
        emoji: '👑',
        baseSpeed: 8000,
        basePaperwork: 50,
        quirk: 'license_multiplier',
        quirkChance: 1.0,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_overlords' },
        quotes: [
            "I AM THE BUREAUCRACY!",
            "Your forms are acceptable... barely.",
            "I've processed more forms than stars in the sky.",
            "I approve of this approval process."
        ],
        licenseNames: [
            "Supreme Bureaucratic Authority",
            "Overlord Navigation Permit",
            "Ultimate Administrative Certificate"
        ]
    }
};

// Helper function to get random quote
function getRandomQuote(species) {
    const quotes = ALIEN_SPECIES[species].quotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Helper function to get random license name
function getRandomLicenseName(species) {
    const licenses = ALIEN_SPECIES[species].licenseNames;
    return licenses[Math.floor(Math.random() * licenses.length)];
}

// Helper function to create an alien instance
function createAlien(speciesId) {
    const species = ALIEN_SPECIES[speciesId];
    if (!species || !species.unlocked) {
        return null;
    }
    
    return {
        id: Date.now() + Math.random(),
        speciesId: speciesId,
        name: generateAlienName(speciesId),
        species: species.name,
        emoji: species.emoji,
        processingTime: species.baseSpeed,
        paperworkYield: species.basePaperwork,
        quirk: species.quirk,
        quirkChance: species.quirkChance,
        quote: getRandomQuote(speciesId),
        licenseName: getRandomLicenseName(speciesId),
        startTime: Date.now(),
        progress: 0
    };
}

// Generate random alien names
function generateAlienName(speciesId) {
    const prefixes = ['X', 'Z', 'Q', 'G', 'K', 'V', 'N', 'R'];
    const suffixes = ['ax', 'or', 'ix', 'ul', 'ek', 'on', 'ar', 'um'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${prefix}${suffix}-${num}`;
}

// Get all unlocked species
function getUnlockedSpecies() {
    return Object.keys(ALIEN_SPECIES).filter(id => ALIEN_SPECIES[id].unlocked);
}

// Check if species should be unlocked
function checkSpeciesUnlocks(gameState) {
    Object.keys(ALIEN_SPECIES).forEach(speciesId => {
        const species = ALIEN_SPECIES[speciesId];
        if (!species.unlocked && species.unlockRequirement) {
            if (species.unlockRequirement.type === 'upgrade') {
                const upgrade = gameState.upgrades.find(u => u.id === species.unlockRequirement.id);
                if (upgrade && upgrade.owned) {
                    species.unlocked = true;
                }
            }
        }
    });
}

