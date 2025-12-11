// Alien Species Definitions
const ALIEN_SPECIES = {
    // Beginner Species
    zorglax_blob: {
        id: 'zorglax_blob',
        name: 'Bolha Zorglax',
        emoji: '🟢',
        baseSpeed: 2500,
        basePaperwork: 15,
        quirk: 'split',
        quirkChance: 0.10,
        unlocked: true,
        quotes: [
            "Eu definitivamente não estava abduzindo ninguém. Eu juro.",
            "Este formulário requer o Anexo 17-B?",
            "Meu OVNI apenas balança levemente, está tudo bem?",
            "Sou apenas uma bolha tentando sobreviver neste universo."
        ],
        licenseNames: [
            "Permissão para Pairar Ameaçadoramente",
            "Certificado de Abdução Leve",
            "Licença Interestelar de Estacionamento Paralelo"
        ]
    },
    
    slimoid_tentacloid: {
        id: 'slimoid_tentacloid',
        name: 'Tentacloide Slimoide',
        emoji: '🐙',
        baseSpeed: 1800,
        basePaperwork: 12,
        quirk: 'smudge',
        quirkChance: 0.10,
        unlocked: true,
        quotes: [
            "Ops, eu borrei isso? Minhas tentáculos são tão escorregadias!",
            "Posso usar todos os oito tentáculos para preencher isso?",
            "Prometo que não vou apagar nada acidentalmente... de novo.",
            "Preencher formulários é difícil quando você não tem ossos!"
        ],
        licenseNames: [
            "Permissão de Operação Multi-Membros",
            "Certificado de Coordenação de Tentáculos",
            "Licença de Navegação em Superfície Escorregadia"
        ]
    },
    
    low_gravity_greegan: {
        id: 'low_gravity_greegan',
        name: 'Greegan de Baixa Gravidade',
        emoji: '👾',
        baseSpeed: 1200,
        basePaperwork: 10,
        quirk: 'float_away',
        quirkChance: 0.15,
        unlocked: true,
        quotes: [
            "Uau, estou flutuando de novo!",
            "Você pode me ancorar à mesa?",
            "A gravidade é apenas uma sugestão de onde eu venho.",
            "Ops, lá vou eu!"
        ],
        licenseNames: [
            "Permissão de Navegação Anti-Gravidade",
            "Certificado de Operação de Veículo Flutuante",
            "Licença de Manobra Zero-G"
        ]
    },
    
    four_eyed_bureaucrat: {
        id: 'four_eyed_bureaucrat',
        name: 'Burocrata de Quatro Olhos',
        emoji: '👓',
        baseSpeed: 3500,
        basePaperwork: 20,
        quirk: 'self_approval',
        quirkChance: 0.05,
        unlocked: true,
        quotes: [
            "Revisei minha própria aplicação. Está perfeita.",
            "Como burocrata, entendo o processo.",
            "Posso ver todos os quatro lados deste formulário simultaneamente.",
            "Auto-certificação deveria ser procedimento padrão."
        ],
        licenseNames: [
            "Permissão de Operação Auto-Aprovada",
            "Certificado de Excelência Burocrática",
            "Licença de Navegação Multi-Perspectiva"
        ]
    },
    
    // Mid-Game Species (unlocked via upgrades)
    time_loop_worm: {
        id: 'time_loop_worm',
        name: 'Verme de Loop Temporal',
        emoji: '🐛',
        baseSpeed: 2500,
        basePaperwork: 15,
        quirk: 'time_loop',
        quirkChance: 1.0,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_time_worms' },
        quotes: [
            "Vou voltar... Já voltei... Vou voltar...",
            "O tempo é apenas um círculo, como minha posição na fila.",
            "Já fiz isso antes, e vou fazer de novo!",
            "Eu do passado já preencheu isso, mas aqui estou eu!"
        ],
        licenseNames: [
            "Permissão de Navegação Temporal",
            "Certificado de Operação em Loop Temporal",
            "Licença de Paradoxo Cronológico"
        ]
    },
    
    exploding_kraknid: {
        id: 'exploding_kraknid',
        name: 'Kraknid Explosivo',
        emoji: '💥',
        baseSpeed: 5000,
        basePaperwork: 20,
        quirk: 'explode',
        quirkChance: 0.15,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_kraknids' },
        quotes: [
            "Estou me sentindo um pouco... volátil hoje.",
            "Não se preocupe, eu só explodo às vezes!",
            "Minha espécie tem um pavio curto, literalmente.",
            "BOOM! ...ah espera, ainda não."
        ],
        licenseNames: [
            "Permissão de Manobra Explosiva",
            "Certificado de Operação Volátil",
            "Licença de Navegação de Alta Energia"
        ]
    },
    
    bureaucrat_overlord: {
        id: 'bureaucrat_overlord',
        name: 'Senhor Supremo Burocrata',
        emoji: '👑',
        baseSpeed: 8000,
        basePaperwork: 50,
        quirk: 'license_multiplier',
        quirkChance: 1.0,
        unlocked: false,
        unlockRequirement: { type: 'upgrade', id: 'unlock_overlords' },
        quotes: [
            "EU SOU A BUROCRACIA!",
            "Seus formulários são aceitáveis... por pouco.",
            "Processei mais formulários do que estrelas no céu.",
            "Aprovo este processo de aprovação."
        ],
        licenseNames: [
            "Autoridade Burocrática Suprema",
            "Permissão de Navegação de Senhor Supremo",
            "Certificado Administrativo Definitivo"
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

