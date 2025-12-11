// Upgrade Definitions
const UPGRADES = {
    // Processing Upgrades
    rubber_stamp_1: {
        id: 'rubber_stamp_1',
        name: 'Carimbo de Borracha I',
        category: 'processing',
        cost: { type: 'paperwork', amount: 50 },
        effect: { processingSpeedMultiplier: 1.15 },
        maxLevel: 10,
        description: 'Aumenta a velocidade de processamento em 15%'
    },
    rubber_stamp_2: {
        id: 'rubber_stamp_2',
        name: 'Carimbo de Borracha II',
        category: 'processing',
        cost: { type: 'paperwork', amount: 200 },
        effect: { processingSpeedMultiplier: 1.15 },
        maxLevel: 10,
        description: 'Aumenta a velocidade de processamento em 15%'
    },
    rubber_stamp_3: {
        id: 'rubber_stamp_3',
        name: 'Carimbo de Borracha III',
        category: 'processing',
        cost: { type: 'paperwork', amount: 500 },
        effect: { processingSpeedMultiplier: 1.15 },
        maxLevel: 10,
        description: 'Aumenta a velocidade de processamento em 15%'
    },
    rubber_stamp_4: {
        id: 'rubber_stamp_4',
        name: 'Carimbo de Borracha IV',
        category: 'processing',
        cost: { type: 'paperwork', amount: 1500 },
        effect: { processingSpeedMultiplier: 1.15 },
        maxLevel: 10,
        description: 'Aumenta a velocidade de processamento em 15%',
        requirement: { upgrade: 'rubber_stamp_3', level: 3 }
    },
    rubber_stamp_5: {
        id: 'rubber_stamp_5',
        name: 'Carimbo de Borracha V',
        category: 'processing',
        cost: { type: 'paperwork', amount: 3000 },
        effect: { processingSpeedMultiplier: 1.15 },
        maxLevel: 10,
        description: 'Aumenta a velocidade de processamento em 15%',
        requirement: { upgrade: 'rubber_stamp_4', level: 3 }
    },
    infinite_ink_pad: {
        id: 'infinite_ink_pad',
        name: 'Almofada de Tinta Infinita',
        category: 'processing',
        cost: { type: 'paperwork', amount: 75 },
        effect: { clickYield: 2 },
        maxLevel: 5,
        description: '+2 documentos por clique (acumula)'
    },
    turbo_stamp: {
        id: 'turbo_stamp',
        name: 'Carimbo Turbo',
        category: 'processing',
        cost: { type: 'paperwork', amount: 1000 },
        effect: { instantApprovalChance: 0.05 },
        maxLevel: 5,
        description: '5% de chance de aprovação instantânea'
    },
    
    // Automation Upgrades
    assistant_drone: {
        id: 'assistant_drone',
        name: 'Drone Assistente',
        category: 'automation',
        cost: { type: 'paperwork', amount: 150 },
        effect: { autoProcessInterval: 5000 },
        maxLevel: 20,
        description: 'Auto-aprova 1 alienígena a cada 5 segundos (mais rápido com níveis)',
        levelEffect: (level) => ({ autoProcessInterval: Math.max(500, 5000 - (level * 250)) })
    },
    tentacle_intern: {
        id: 'tentacle_intern',
        name: 'Estagiário Tentáculo',
        category: 'automation',
        cost: { type: 'paperwork', amount: 2000 },
        effect: { processingSpeedMultiplier: 1.2, errorChance: 0.10 },
        maxLevel: 5,
        description: 'Acelera processamento em 20%, mas 10% de chance de erro'
    },
    auto_sorting_system: {
        id: 'auto_sorting_system',
        name: 'Sistema de Classificação Automática',
        category: 'automation',
        cost: { type: 'paperwork', amount: 5000 },
        effect: { quirkPenaltyReduction: 0.25 },
        maxLevel: 4,
        description: 'Reduz penalidades de peculiaridades em 25%'
    },
    
    // Queue Upgrades
    extended_hallway: {
        id: 'extended_hallway',
        name: 'Corredor Estendido',
        category: 'queue',
        cost: { type: 'paperwork', amount: 300 },
        effect: { spawnRateMultiplier: 1.2 },
        maxLevel: 10,
        description: 'Aumenta a taxa de aparição de alienígenas em 20%'
    },
    anti_gravity_cones: {
        id: 'anti_gravity_cones',
        name: 'Cones Anti-Gravidade',
        category: 'queue',
        cost: { type: 'paperwork', amount: 1500 },
        effect: { floatAwayReduction: 0.5 },
        maxLevel: 3,
        description: 'Reduz eventos de "flutuar para longe" em 50%'
    },
    
    // Species Unlock Upgrades
    unlock_time_worms: {
        id: 'unlock_time_worms',
        name: 'Portal Temporal',
        category: 'queue',
        cost: { type: 'licenses', amount: 10 },
        effect: { unlockSpecies: 'time_loop_worm' },
        maxLevel: 1,
        description: 'Desbloqueia Vermes de Loop Temporal'
    },
    unlock_kraknids: {
        id: 'unlock_kraknids',
        name: 'Contenção de Explosão',
        category: 'queue',
        cost: { type: 'licenses', amount: 25 },
        effect: { unlockSpecies: 'exploding_kraknid' },
        maxLevel: 1,
        description: 'Desbloqueia Kraknids Explosivos'
    },
    unlock_overlords: {
        id: 'unlock_overlords',
        name: 'Salão de Recepção do Senhor Supremo',
        category: 'queue',
        cost: { type: 'licenses', amount: 50 },
        effect: { unlockSpecies: 'bureaucrat_overlord' },
        maxLevel: 1,
        description: 'Desbloqueia Senhores Supremos Burocratas'
    }
};

// Helper function to get upgrades by category
function getUpgradesByCategory(category) {
    return Object.values(UPGRADES).filter(upgrade => upgrade.category === category);
}

// Helper function to check if upgrade can be purchased
function canPurchaseUpgrade(upgrade, gameState) {
    // Check if max level reached
    const ownedUpgrade = gameState.upgrades.find(u => u.id === upgrade.id);
    if (ownedUpgrade && ownedUpgrade.level >= upgrade.maxLevel) {
        return false;
    }
    
    // Check requirements
    if (upgrade.requirement) {
        const reqUpgrade = gameState.upgrades.find(u => u.id === upgrade.requirement.upgrade);
        if (!reqUpgrade || reqUpgrade.level < upgrade.requirement.level) {
            return false;
        }
    }
    
    // Check cost
    const cost = getUpgradeCost(upgrade, ownedUpgrade);
    if (cost.type === 'paperwork' && gameState.paperwork < cost.amount) {
        return false;
    }
    if (cost.type === 'licenses' && gameState.licenses < cost.amount) {
        return false;
    }
    
    return true;
}

// Calculate upgrade cost (can increase with level)
function getUpgradeCost(upgrade, ownedUpgrade) {
    const level = ownedUpgrade ? ownedUpgrade.level : 0;
    const baseCost = upgrade.cost.amount;
    // Exponential cost scaling
    const cost = Math.floor(baseCost * Math.pow(1.5, level));
    return {
        type: upgrade.cost.type,
        amount: cost
    };
}

// Apply upgrade effects to game state
function applyUpgradeEffects(gameState) {
    let processingSpeedMultiplier = 1;
    let clickYield = 0;
    let instantApprovalChance = 0;
    let autoProcessInterval = null;
    let errorChance = 0;
    let quirkPenaltyReduction = 0;
    let spawnRateMultiplier = 1;
    let floatAwayReduction = 0;
    
    gameState.upgrades.forEach(owned => {
        const upgrade = UPGRADES[owned.id];
        if (!upgrade) return;
        
        const level = owned.level;
        
        // Processing speed multipliers stack
        if (upgrade.effect.processingSpeedMultiplier) {
            processingSpeedMultiplier *= Math.pow(upgrade.effect.processingSpeedMultiplier, level);
        }
        
        // Click yield stacks
        if (upgrade.effect.clickYield) {
            clickYield += upgrade.effect.clickYield * level;
        }
        
        // Instant approval chance stacks (multiplicative)
        if (upgrade.effect.instantApprovalChance) {
            instantApprovalChance = 1 - Math.pow(1 - upgrade.effect.instantApprovalChance, level);
        }
        
        // Auto process interval (use best one)
        if (upgrade.effect.autoProcessInterval) {
            const interval = upgrade.levelEffect ? upgrade.levelEffect(level).autoProcessInterval : upgrade.effect.autoProcessInterval;
            if (!autoProcessInterval || interval < autoProcessInterval) {
                autoProcessInterval = interval;
            }
        }
        
        // Error chance (use worst one)
        if (upgrade.effect.errorChance) {
            errorChance = Math.max(errorChance, upgrade.effect.errorChance);
        }
        
        // Quirk penalty reduction stacks (additive)
        if (upgrade.effect.quirkPenaltyReduction) {
            quirkPenaltyReduction += upgrade.effect.quirkPenaltyReduction * level;
        }
        
        // Spawn rate multiplier stacks (multiplicative)
        if (upgrade.effect.spawnRateMultiplier) {
            spawnRateMultiplier *= Math.pow(upgrade.effect.spawnRateMultiplier, level);
        }
        
        // Float away reduction stacks (additive)
        if (upgrade.effect.floatAwayReduction) {
            floatAwayReduction += upgrade.effect.floatAwayReduction * level;
        }
    });
    
    return {
        processingSpeedMultiplier: Math.max(0.1, processingSpeedMultiplier),
        clickYield,
        instantApprovalChance,
        autoProcessInterval,
        errorChance,
        quirkPenaltyReduction: Math.min(1, quirkPenaltyReduction),
        spawnRateMultiplier: Math.max(0.1, spawnRateMultiplier),
        floatAwayReduction: Math.min(1, floatAwayReduction)
    };
}

