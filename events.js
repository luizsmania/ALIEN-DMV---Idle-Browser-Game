// Random Events System
const RANDOM_EVENTS = {
    galactic_inspection: {
        id: 'galactic_inspection',
        name: 'Inspeção Galáctica',
        description: 'Inspetores estão observando! Todas as aprovações rendem recompensas dobradas por 10 segundos.',
        duration: 10000,
        effect: {
            paperworkMultiplier: 2.0,
            licenseMultiplier: 2.0
        },
        minInterval: 30000,
        maxInterval: 120000
    },
    
    black_hole_near_miss: {
        id: 'black_hole_near_miss',
        name: 'Quase Colisão com Buraco Negro',
        description: 'Um buraco negro está perturbando as operações! Pague 100 Documentos para estabilizar, ou tudo fica mais lento.',
        duration: 30000,
        effect: {
            processingSpeedMultiplier: 0.5
        },
        cost: {
            type: 'paperwork',
            amount: 100
        },
        minInterval: 45000,
        maxInterval: 150000
    },
    
    cosmic_riot: {
        id: 'cosmic_riot',
        name: 'Revolta Cósmica',
        description: 'Alienígenas exigem serviço mais rápido! Taxa de aparição temporariamente aumentada em 50%.',
        duration: 20000,
        effect: {
            spawnRateMultiplier: 1.5
        },
        minInterval: 40000,
        maxInterval: 180000
    }
};

// Event Manager
class EventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeEvents = [];
        this.nextEventTime = Date.now() + this.getRandomEventInterval();
        this.eventHistory = [];
    }
    
    getRandomEventInterval() {
        // Get average interval from all events
        const intervals = Object.values(RANDOM_EVENTS).map(e => 
            (e.minInterval + e.maxInterval) / 2
        );
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return avgInterval + (Math.random() * avgInterval * 0.5 - avgInterval * 0.25);
    }
    
    update() {
        const now = Date.now();
        
        // Check if it's time for a new event
        if (now >= this.nextEventTime && this.activeEvents.length === 0) {
            this.triggerRandomEvent();
        }
        
        // Update active events
        this.activeEvents = this.activeEvents.filter(event => {
            if (now >= event.endTime) {
                this.endEvent(event);
                return false;
            }
            return true;
        });
    }
    
    triggerRandomEvent() {
        const availableEvents = Object.values(RANDOM_EVENTS);
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        
        const eventInstance = {
            id: event.id,
            name: event.name,
            description: event.description,
            startTime: Date.now(),
            endTime: Date.now() + event.duration,
            effect: { ...event.effect },
            cost: event.cost ? { ...event.cost } : null
        };
        
        this.activeEvents.push(eventInstance);
        this.eventHistory.push({
            id: event.id,
            time: Date.now()
        });
        
        // Schedule next event
        this.nextEventTime = Date.now() + this.getRandomEventInterval();
        
        // Special handling for black hole event
        if (event.id === 'black_hole_near_miss') {
            // Auto-apply negative effect if not paid
            setTimeout(() => {
                if (this.activeEvents.find(e => e.id === 'black_hole_near_miss' && !e.paid)) {
                    this.applyEventEffect(eventInstance);
                }
            }, 1000);
        } else {
            this.applyEventEffect(eventInstance);
        }
        
        return eventInstance;
    }
    
    applyEventEffect(eventInstance) {
        // Effects are applied in game.js through getEventMultipliers()
    }
    
    endEvent(eventInstance) {
        // Remove effect (handled in game.js)
        if (eventInstance.id === 'black_hole_near_miss' && !eventInstance.paid) {
            // Effect was already applied, just remove it
        }
    }
    
    payEventCost(eventInstance) {
        if (!eventInstance.cost) return false;
        
        if (eventInstance.cost.type === 'paperwork') {
            if (this.gameState.paperwork >= eventInstance.cost.amount) {
                this.gameState.paperwork -= eventInstance.cost.amount;
                eventInstance.paid = true;
                // Remove negative effect
                return true;
            }
        }
        return false;
    }
    
    getEventMultipliers() {
        let multipliers = {
            paperwork: 1,
            licenses: 1,
            processingSpeed: 1,
            spawnRate: 1
        };
        
        this.activeEvents.forEach(event => {
            if (event.paid && event.id === 'black_hole_near_miss') {
                // Paid event, no negative effect
                return;
            }
            
            if (event.effect.paperworkMultiplier) {
                multipliers.paperwork *= event.effect.paperworkMultiplier;
            }
            if (event.effect.licenseMultiplier) {
                multipliers.licenses *= event.effect.licenseMultiplier;
            }
            if (event.effect.processingSpeedMultiplier) {
                multipliers.processingSpeed *= event.effect.processingSpeedMultiplier;
            }
            if (event.effect.spawnRateMultiplier) {
                multipliers.spawnRate *= event.effect.spawnRateMultiplier;
            }
        });
        
        return multipliers;
    }
    
    getActiveEvents() {
        return this.activeEvents;
    }
}

