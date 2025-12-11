// Main Game Logic
class AlienDMVGame {
    constructor() {
        this.state = {
            paperwork: 0,
            licenses: 0,
            cosmicApproval: 0,
            upgrades: [],
            queue: [],
            currentAlien: null,
            processingStartTime: null,
            lastSpawnTime: Date.now(),
            spawnInterval: 3000, // Base spawn interval in ms
            lastAutoProcess: Date.now(),
            licenseMultiplierEndTime: 0,
            licenseMultiplier: 1,
            prestigeRequirement: 1000
        };
        
        this.eventManager = new EventManager(this.state);
        this.isProcessing = false;
        this.gameLoop = null;
        this.lastSaveTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.setupEventListeners();
        this.renderUpgrades();
        this.updateUI();
        this.startGameLoop();
        this.checkSpeciesUnlocks();
    }
    
    setupEventListeners() {
        // Stamp button
        document.getElementById('stamp-btn').addEventListener('click', () => {
            this.handleStamp();
        });
        
        // Upgrade tabs
        document.querySelectorAll('.upgrade-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchUpgradeTab(tabName);
            });
        });
        
        // Prestige button
        document.getElementById('prestige-btn').addEventListener('click', () => {
            this.prestige();
        });
        
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'block';
        });
        
        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });
        
        // Settings buttons
        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.saveGame();
            this.showNotification('Game saved!', 'success');
        });
        
        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.loadGame();
            this.showNotification('Game loaded!', 'success');
        });
        
        document.getElementById('export-save-btn').addEventListener('click', () => {
            this.exportSave();
        });
        
        document.getElementById('import-save-btn').addEventListener('click', () => {
            this.importSave();
        });
        
        document.getElementById('reset-game-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset? This will delete all progress!')) {
                this.resetGame();
            }
        });
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('settings-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
        }, 100); // Update every 100ms
    }
    
    update() {
        const now = Date.now();
        
        // Update event manager
        this.eventManager.update();
        
        // Spawn aliens
        const spawnMultipliers = this.eventManager.getEventMultipliers();
        const effectiveSpawnInterval = this.state.spawnInterval / 
            (this.getUpgradeEffects().spawnRateMultiplier * spawnMultipliers.spawnRate);
        
        if (now - this.state.lastSpawnTime >= effectiveSpawnInterval) {
            this.spawnAlien();
            this.state.lastSpawnTime = now;
        }
        
        // Auto-process aliens
        const autoProcessInterval = this.getUpgradeEffects().autoProcessInterval;
        if (autoProcessInterval && now - this.state.lastAutoProcess >= autoProcessInterval) {
            if (this.state.queue.length > 0 && !this.isProcessing) {
                this.startProcessing();
            }
            this.state.lastAutoProcess = now;
        }
        
        // Process current alien
        if (this.isProcessing && this.state.currentAlien) {
            this.updateProcessing();
        }
        
        // Generate licenses from paperwork
        this.generateLicenses();
        
        // Update UI
        this.updateUI();
        this.updateEventDisplay();
        
        // Auto-save every 30 seconds
        if (now - this.lastSaveTime >= 30000) {
            this.saveGame();
            this.lastSaveTime = now;
        }
    }
    
    spawnAlien() {
        const unlockedSpecies = getUnlockedSpecies();
        if (unlockedSpecies.length === 0) return;
        
        const randomSpecies = unlockedSpecies[Math.floor(Math.random() * unlockedSpecies.length)];
        const alien = createAlien(randomSpecies);
        
        if (alien) {
            this.state.queue.push(alien);
            
            // If no alien is being processed, start processing
            if (!this.isProcessing && this.state.queue.length === 1) {
                this.startProcessing();
            }
        }
    }
    
    startProcessing() {
        if (this.state.queue.length === 0 || this.isProcessing) return;
        
        this.state.currentAlien = this.state.queue.shift();
        this.state.processingStartTime = Date.now();
        this.isProcessing = true;
        
        // Check for instant approval
        const instantChance = this.getUpgradeEffects().instantApprovalChance;
        if (Math.random() < instantChance) {
            this.completeProcessing(true);
            return;
        }
        
        this.updateProcessingDisplay();
    }
    
    updateProcessing() {
        if (!this.state.currentAlien || !this.state.processingStartTime) return;
        
        const now = Date.now();
        const elapsed = now - this.state.processingStartTime;
        
        // Calculate processing time with multipliers
        const baseTime = this.state.currentAlien.processingTime;
        const speedMultiplier = this.getUpgradeEffects().processingSpeedMultiplier;
        const eventMultipliers = this.eventManager.getEventMultipliers();
        const effectiveTime = baseTime / (speedMultiplier * eventMultipliers.processingSpeed);
        
        const progress = Math.min(100, (elapsed / effectiveTime) * 100);
        this.state.currentAlien.progress = progress;
        
        // Update progress bar
        document.getElementById('processing-fill').style.width = progress + '%';
        document.getElementById('processing-time-text').textContent = Math.floor(progress) + '%';
        
        // Check if complete
        if (progress >= 100) {
            this.completeProcessing();
        }
    }
    
    completeProcessing(instant = false) {
        if (!this.state.currentAlien) return;
        
        const alien = this.state.currentAlien;
        let paperworkEarned = alien.paperworkYield;
        let shouldAward = true;
        let quirkTriggered = false;
        
        // Apply quirk effects
        if (Math.random() < alien.quirkChance) {
            quirkTriggered = true;
            
            switch (alien.quirk) {
                case 'split':
                    paperworkEarned *= 2;
                    this.showNotification(`${alien.name} split into two! Double reward!`, 'success');
                    // Play split animation
                    const spriteContainer = document.querySelector('.alien-sprite');
                    if (spriteContainer && spriteContainer.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'split', spriteContainer.firstChild);
                    }
                    break;
                    
                case 'smudge':
                    // Play smudge animation
                    const spriteContainerSmudge = document.querySelector('.alien-sprite');
                    if (spriteContainerSmudge && spriteContainerSmudge.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'smudge', spriteContainerSmudge.firstChild);
                    }
                    // Check for error chance from upgrades
                    const errorChance = this.getUpgradeEffects().errorChance;
                    if (Math.random() < errorChance) {
                        this.showNotification(`${alien.name} caused an error!`, 'error');
                        shouldAward = false;
                    } else {
                        // Redo process
                        this.showNotification(`${alien.name} smudged the form! Redoing...`, 'error');
                        this.state.queue.unshift(alien);
                        this.isProcessing = false;
                        this.state.currentAlien = null;
                        this.state.processingStartTime = null;
                        if (this.state.queue.length > 0) {
                            setTimeout(() => this.startProcessing(), 500);
                        }
                        return;
                    }
                    break;
                    
                case 'float_away':
                    const floatReduction = this.getUpgradeEffects().floatAwayReduction;
                    if (Math.random() < floatReduction) {
                        this.showNotification(`Anti-Gravity Cones prevented ${alien.name} from floating away!`, 'success');
                    } else {
                        this.showNotification(`${alien.name} floated away!`, 'error');
                        shouldAward = false;
                        // Play float away animation
                        const spriteContainer = document.querySelector('.alien-sprite');
                        if (spriteContainer && spriteContainer.firstChild) {
                            spriteManager.playQuirkAnimation(alien.speciesId, 'float_away', spriteContainer.firstChild);
                        }
                    }
                    break;
                    
                case 'self_approval':
                    paperworkEarned *= 2;
                    this.showNotification(`${alien.name} self-approved! Double reward!`, 'success');
                    // Play self-approval animation
                    const spriteContainerSelf = document.querySelector('.alien-sprite');
                    if (spriteContainerSelf && spriteContainerSelf.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'self_approval', spriteContainerSelf.firstChild);
                    }
                    break;
                    
                case 'time_loop':
                    paperworkEarned *= 2;
                    this.state.queue.unshift({ ...alien });
                    this.showNotification(`${alien.name} left and re-entered! Double yield!`, 'success');
                    // Play time loop animation
                    const spriteContainerLoop = document.querySelector('.alien-sprite');
                    if (spriteContainerLoop && spriteContainerLoop.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'time_loop', spriteContainerLoop.firstChild);
                    }
                    break;
                    
                case 'explode':
                    if (Math.random() < 0.15) {
                        this.state.queue = [];
                        paperworkEarned *= 10;
                        this.showNotification(`${alien.name} exploded! Queue cleared, huge reward!`, 'error');
                        // Play explode animation
                        const spriteContainer = document.querySelector('.alien-sprite');
                        if (spriteContainer && spriteContainer.firstChild) {
                            spriteManager.playQuirkAnimation(alien.speciesId, 'explode', spriteContainer.firstChild);
                        }
                    }
                    break;
                    
                case 'license_multiplier':
                    this.state.licenseMultiplier = 2;
                    this.state.licenseMultiplierEndTime = Date.now() + 30000; // 30 seconds
                    this.showNotification(`${alien.name} granted License Multiplier for 30 seconds!`, 'success');
                    // Play glow animation
                    const spriteContainerGlow = document.querySelector('.alien-sprite');
                    if (spriteContainerGlow && spriteContainerGlow.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'license_multiplier', spriteContainerGlow.firstChild);
                    }
                    break;
            }
        }
        
        // Apply quirk penalty reduction
        const quirkPenaltyReduction = this.getUpgradeEffects().quirkPenaltyReduction;
        if (!shouldAward && quirkPenaltyReduction > 0 && Math.random() < quirkPenaltyReduction) {
            shouldAward = true;
            paperworkEarned *= 0.5; // Reduced reward
            this.showNotification('Auto Sorting System prevented penalty!', 'success');
        }
        
        // Award resources
        if (shouldAward) {
            const eventMultipliers = this.eventManager.getEventMultipliers();
            const prestigeMultiplier = 1 + (this.state.cosmicApproval * 0.1);
            const finalPaperwork = Math.floor(paperworkEarned * eventMultipliers.paperwork * prestigeMultiplier);
            this.state.paperwork += finalPaperwork;
            
            this.showNotification(`+${finalPaperwork} Paperwork`, 'success');
        }
        
        // Reset processing
        this.isProcessing = false;
        this.state.currentAlien = null;
        this.state.processingStartTime = null;
        document.getElementById('processing-fill').style.width = '0%';
        document.getElementById('processing-time-text').textContent = '0%';
        
        // Start processing next alien
        if (this.state.queue.length > 0) {
            setTimeout(() => this.startProcessing(), 500);
        } else {
            this.updateProcessingDisplay();
        }
        
        this.checkSpeciesUnlocks();
    }
    
    handleStamp() {
        if (!this.isProcessing && this.state.currentAlien) {
            // Manual click processing
            const clickYield = this.getUpgradeEffects().clickYield;
            if (clickYield > 0) {
                this.state.paperwork += clickYield;
            }
            this.completeProcessing();
        } else if (this.state.queue.length > 0 && !this.isProcessing) {
            this.startProcessing();
        }
    }
    
    generateLicenses() {
        // Generate licenses from paperwork (1 license per 100 paperwork)
        const licenseRate = 100;
        const licensesToGenerate = Math.floor(this.state.paperwork / licenseRate);
        
        if (licensesToGenerate > 0) {
            const eventMultipliers = this.eventManager.getEventMultipliers();
            const effectiveMultiplier = this.state.licenseMultiplier * eventMultipliers.licenses;
            const finalLicenses = Math.floor(licensesToGenerate * effectiveMultiplier);
            
            this.state.licenses += finalLicenses;
            this.state.paperwork -= licensesToGenerate * licenseRate;
            
            if (finalLicenses > 0) {
                // Show notification occasionally
                if (Math.random() < 0.1) {
                    this.showNotification(`+${finalLicenses} Licenses`, 'success');
                }
            }
        }
        
        // Check license multiplier expiration
        if (Date.now() >= this.state.licenseMultiplierEndTime) {
            this.state.licenseMultiplier = 1;
        }
    }
    
    getUpgradeEffects() {
        return applyUpgradeEffects(this.state);
    }
    
    switchUpgradeTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.upgrade-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update sections
        document.querySelectorAll('.upgrade-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`upgrades-${tabName}`).classList.add('active');
    }
    
    renderUpgrades() {
        // Processing upgrades
        const processingUpgrades = getUpgradesByCategory('processing');
        this.renderUpgradeList('processing-upgrades', processingUpgrades);
        
        // Automation upgrades
        const automationUpgrades = getUpgradesByCategory('automation');
        this.renderUpgradeList('automation-upgrades', automationUpgrades);
        
        // Queue upgrades
        const queueUpgrades = getUpgradesByCategory('queue');
        this.renderUpgradeList('queue-upgrades', queueUpgrades);
    }
    
    renderUpgradeList(containerId, upgrades) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        upgrades.forEach(upgrade => {
            const owned = this.state.upgrades.find(u => u.id === upgrade.id);
            const level = owned ? owned.level : 0;
            const canPurchase = canPurchaseUpgrade(upgrade, this.state);
            const cost = getUpgradeCost(upgrade, owned);
            const isMaxed = level >= upgrade.maxLevel;
            
            const upgradeElement = document.createElement('div');
            upgradeElement.className = `upgrade-item ${owned ? 'owned' : ''} ${isMaxed ? 'maxed' : ''}`;
            
            upgradeElement.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-level">Lv. ${level}/${upgrade.maxLevel}</span>
                </div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost">
                    <span class="upgrade-cost-text">${cost.type === 'paperwork' ? '📄' : '🪪'} ${this.formatNumber(cost.amount)}</span>
                    <button class="upgrade-buy-btn" ${!canPurchase || isMaxed ? 'disabled' : ''}>
                        ${isMaxed ? 'MAXED' : 'BUY'}
                    </button>
                </div>
            `;
            
            const buyBtn = upgradeElement.querySelector('.upgrade-buy-btn');
            buyBtn.addEventListener('click', () => {
                if (canPurchase && !isMaxed) {
                    this.purchaseUpgrade(upgrade);
                }
            });
            
            container.appendChild(upgradeElement);
        });
    }
    
    purchaseUpgrade(upgrade) {
        const owned = this.state.upgrades.find(u => u.id === upgrade.id);
        const cost = getUpgradeCost(upgrade, owned);
        
        // Check cost
        if (cost.type === 'paperwork' && this.state.paperwork < cost.amount) {
            return;
        }
        if (cost.type === 'licenses' && this.state.licenses < cost.amount) {
            return;
        }
        
        // Deduct cost
        if (cost.type === 'paperwork') {
            this.state.paperwork -= cost.amount;
        } else {
            this.state.licenses -= cost.amount;
        }
        
        // Add/update upgrade
        if (owned) {
            owned.level++;
        } else {
            this.state.upgrades.push({
                id: upgrade.id,
                level: 1
            });
        }
        
        // Handle special effects
        if (upgrade.effect.unlockSpecies) {
            ALIEN_SPECIES[upgrade.effect.unlockSpecies].unlocked = true;
        }
        
        this.renderUpgrades();
        this.showNotification(`${upgrade.name} purchased!`, 'success');
    }
    
    updateUI() {
        // Update resources
        document.getElementById('paperwork-count').textContent = this.formatNumber(this.state.paperwork);
        document.getElementById('licenses-count').textContent = this.formatNumber(this.state.licenses);
        document.getElementById('cosmic-approval-count').textContent = this.formatNumber(this.state.cosmicApproval);
        
        // Update prestige
        const prestigeMultiplier = 1 + (this.state.cosmicApproval * 0.1);
        document.getElementById('prestige-multiplier').textContent = prestigeMultiplier.toFixed(2) + 'x';
        
        const canPrestige = this.state.licenses >= this.state.prestigeRequirement;
        document.getElementById('prestige-btn').disabled = !canPrestige;
        document.getElementById('prestige-requirement').textContent = 
            `Requires ${this.formatNumber(this.state.prestigeRequirement)} Licenses`;
        
        // Update queue display
        this.updateQueueDisplay();
        
        // Update stamp button
        const stampBtn = document.getElementById('stamp-btn');
        const hasAutoProcess = this.getUpgradeEffects().autoProcessInterval !== null;
        stampBtn.disabled = hasAutoProcess && this.isProcessing;
        
        // Update processing display
        if (!this.isProcessing && !this.state.currentAlien) {
            this.updateProcessingDisplay();
        }
    }
    
    updateQueueDisplay() {
        const queueDisplay = document.getElementById('queue-display');
        
        if (this.state.queue.length === 0 && !this.state.currentAlien) {
            queueDisplay.innerHTML = '<p class="empty-queue">No aliens in queue...</p>';
            return;
        }
        
        queueDisplay.innerHTML = '';
        
        // Show current alien if processing
        if (this.state.currentAlien) {
            const item = document.createElement('div');
            item.className = 'queue-item processing';
            item.innerHTML = `
                <strong>${this.state.currentAlien.emoji} ${this.state.currentAlien.name}</strong><br>
                <small>${this.state.currentAlien.species} - Processing...</small>
            `;
            queueDisplay.appendChild(item);
        }
        
        // Show queue (limit to 10 visible)
        const queueToShow = this.state.queue.slice(0, 10);
        queueToShow.forEach((alien, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.innerHTML = `
                <strong>${alien.emoji} ${alien.name}</strong><br>
                <small>${alien.species}</small>
            `;
            queueDisplay.appendChild(item);
        });
        
        if (this.state.queue.length > 10) {
            const more = document.createElement('div');
            more.className = 'queue-item';
            more.innerHTML = `<em>+${this.state.queue.length - 10} more...</em>`;
            queueDisplay.appendChild(more);
        }
    }
    
    updateProcessingDisplay() {
        const currentAlienDiv = document.getElementById('current-alien');
        const alienCard = currentAlienDiv.querySelector('.alien-card');
        const alienSpriteContainer = alienCard.querySelector('.alien-sprite');
        const alienName = alienCard.querySelector('.alien-name');
        const alienSpecies = alienCard.querySelector('.alien-species');
        const alienQuote = alienCard.querySelector('.alien-quote');
        const processingStatus = document.getElementById('processing-status');
        
        if (this.state.currentAlien) {
            const alien = this.state.currentAlien;
            
            // Update sprite with animation
            const state = this.isProcessing ? 'process' : 'idle';
            const animationName = spriteManager.getAnimationName(alien.speciesId, state);
            const spriteElement = spriteManager.getSpriteElement(animationName, alien.speciesId);
            
            // Clear and replace sprite
            alienSpriteContainer.innerHTML = '';
            alienSpriteContainer.appendChild(spriteElement);
            
            alienName.textContent = alien.name;
            alienSpecies.textContent = alien.species;
            alienQuote.textContent = `"${alien.quote}"`;
            processingStatus.textContent = '';
        } else {
            // Default waiting state
            alienSpriteContainer.innerHTML = '';
            const defaultSprite = spriteManager.getSpriteElement('idle', null);
            alienSpriteContainer.appendChild(defaultSprite);
            alienName.textContent = 'Waiting for aliens...';
            alienSpecies.textContent = '';
            alienQuote.textContent = '';
            processingStatus.textContent = 'Click STAMP or wait for automation';
        }
    }
    
    updateEventDisplay() {
        const eventDisplay = document.getElementById('event-display');
        const activeEvents = this.eventManager.getActiveEvents();
        
        eventDisplay.innerHTML = '';
        
        activeEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            
            const timeLeft = Math.max(0, Math.ceil((event.endTime - Date.now()) / 1000));
            
            eventCard.innerHTML = `
                <div class="event-title">${event.name}</div>
                <div class="event-description">${event.description}</div>
                <div class="event-timer">Time remaining: ${timeLeft}s</div>
            `;
            
            if (event.id === 'black_hole_near_miss' && !event.paid) {
                const actionButton = document.createElement('button');
                actionButton.className = 'upgrade-buy-btn';
                actionButton.style.marginTop = '10px';
                actionButton.textContent = `Pay ${event.cost.amount} Paperwork`;
                actionButton.addEventListener('click', () => {
                    this.payEventCost(event.id);
                });
                eventCard.appendChild(actionButton);
            }
            
            eventDisplay.appendChild(eventCard);
        });
    }
    
    payEventCost(eventId) {
        const event = this.eventManager.getActiveEvents().find(e => e.id === eventId);
        if (event && this.eventManager.payEventCost(event)) {
            this.showNotification('Event cost paid!', 'success');
            this.updateEventDisplay();
        } else {
            this.showNotification('Not enough resources!', 'error');
        }
    }
    
    prestige() {
        if (this.state.licenses < this.state.prestigeRequirement) {
            return;
        }
        
        // Calculate cosmic approval
        const approvalGained = Math.floor(this.state.licenses / this.state.prestigeRequirement);
        this.state.cosmicApproval += approvalGained;
        
        // Reset game state
        this.state.paperwork = 0;
        this.state.licenses = 0;
        this.state.upgrades = [];
        this.state.queue = [];
        this.state.currentAlien = null;
        this.isProcessing = false;
        this.state.processingStartTime = null;
        this.state.licenseMultiplier = 1;
        this.state.licenseMultiplierEndTime = 0;
        
        // Increase prestige requirement
        this.state.prestigeRequirement = Math.floor(this.state.prestigeRequirement * 1.5);
        
        // Reset species unlocks (keep base ones)
        Object.keys(ALIEN_SPECIES).forEach(id => {
            if (id !== 'zorglax_blob' && id !== 'slimoid_tentacloid' && 
                id !== 'low_gravity_greegan' && id !== 'four_eyed_bureaucrat') {
                ALIEN_SPECIES[id].unlocked = false;
            }
        });
        
        this.showNotification(`Prestiged! Gained ${approvalGained} Cosmic Approval!`, 'success');
        this.renderUpgrades();
        this.updateUI();
        this.saveGame();
    }
    
    checkSpeciesUnlocks() {
        checkSpeciesUnlocks(this.state);
    }
    
    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    }
    
    saveGame() {
        const saveData = {
            state: this.state,
            timestamp: Date.now()
        };
        localStorage.setItem('alienDMVSave', JSON.stringify(saveData));
    }
    
    loadGame() {
        const saveData = localStorage.getItem('alienDMVSave');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.state = { ...this.state, ...data.state };
                this.eventManager = new EventManager(this.state);
            } catch (e) {
                console.error('Failed to load save:', e);
            }
        }
    }
    
    exportSave() {
        const saveData = {
            state: this.state,
            timestamp: Date.now()
        };
        const dataStr = JSON.stringify(saveData);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `alien-dmv-save-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Save exported!', 'success');
    }
    
    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const saveData = JSON.parse(event.target.result);
                        this.state = { ...this.state, ...saveData.state };
                        this.eventManager = new EventManager(this.state);
                        this.renderUpgrades();
                        this.updateUI();
                        this.saveGame();
                        this.showNotification('Save imported!', 'success');
                    } catch (err) {
                        this.showNotification('Invalid save file!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    resetGame() {
        if (confirm('Are you absolutely sure? This will delete ALL progress including Cosmic Approval!')) {
            localStorage.removeItem('alienDMVSave');
            location.reload();
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new AlienDMVGame();
    window.game = game; // Make accessible globally
});

