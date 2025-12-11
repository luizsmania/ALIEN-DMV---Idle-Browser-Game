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
            prestigeRequirement: 1000,
            totalAliensProcessed: 0,
            totalPaperworkEarned: 0,
            gameStartTime: Date.now()
        };
        
        this.eventManager = new EventManager(this.state);
        this.isProcessing = false;
        this.gameLoop = null;
        this.lastSaveTime = Date.now();
        this.lastLicenseConversion = 0; // Track when licenses were last converted
        
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
        
        // Convert licenses button
        document.getElementById('convert-licenses-btn').addEventListener('click', () => {
            this.convertToLicenses();
        });
        
        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });
        
        // Settings buttons
        document.getElementById('save-game-btn').addEventListener('click', () => {
            this.saveGame();
            this.showNotification('Jogo salvo!', 'success');
        });
        
        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.loadGame();
            this.showNotification('Jogo carregado!', 'success');
        });
        
        document.getElementById('export-save-btn').addEventListener('click', () => {
            this.exportSave();
        });
        
        document.getElementById('import-save-btn').addEventListener('click', () => {
            this.importSave();
        });
        
        document.getElementById('reset-game-btn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja resetar? Isso apagará todo o progresso!')) {
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
        
        // Spawn aliens - but slow down if queue is getting too large
        const queueSize = this.state.queue.length;
        const queueSlowdown = queueSize > 100 ? Math.max(0.1, 1 - (queueSize - 100) / 1000) : 1;
        
        const spawnMultipliers = this.eventManager.getEventMultipliers();
        const effectiveSpawnInterval = (this.state.spawnInterval / 
            (this.getUpgradeEffects().spawnRateMultiplier * spawnMultipliers.spawnRate)) / queueSlowdown;
        
        if (now - this.state.lastSpawnTime >= effectiveSpawnInterval) {
            this.spawnAlien();
            this.state.lastSpawnTime = now;
        }
        
        // Auto-process aliens - check more frequently
        const autoProcessInterval = this.getUpgradeEffects().autoProcessInterval;
        if (autoProcessInterval && now - this.state.lastAutoProcess >= autoProcessInterval) {
            if (this.state.queue.length > 0 && !this.isProcessing) {
                this.startProcessing();
            }
            this.state.lastAutoProcess = now;
        }
        
        // Always check if we should start processing (even without automation or between auto-processes)
        if (!this.isProcessing && this.state.queue.length > 0) {
            // Start processing immediately if queue has aliens and nothing is being processed
            this.startProcessing();
        }
        
        // Process current alien - always update if processing
        if (this.isProcessing) {
            if (this.state.currentAlien && this.state.processingStartTime) {
                this.updateProcessing();
            } else {
                // Safety: reset if processing state is inconsistent
                console.warn('Processing state inconsistent - resetting');
                this.isProcessing = false;
                this.state.currentAlien = null;
                this.state.processingStartTime = null;
            }
        }
        
        // Generate licenses from paperwork
        this.generateLicenses();
        
        // Update UI
        this.updateUI();
        this.updateEventDisplay();
        
        // Update stats if stats tab is active
        if (document.querySelector('[data-tab="stats"]')?.classList.contains('active')) {
            this.updateStats();
        }
        
        // Auto-save every 30 seconds
        if (now - this.lastSaveTime >= 30000) {
            this.saveGame();
            this.lastSaveTime = now;
        }
    }
    
    spawnAlien() {
        const unlockedSpecies = getUnlockedSpecies();
        if (unlockedSpecies.length === 0) return;
        
        // Limit queue size to prevent infinite growth - stop spawning if queue is too large
        const maxQueueSize = 500;
        if (this.state.queue.length >= maxQueueSize) {
            return; // Don't spawn if queue is too large - focus on processing existing ones
        }
        
        const randomSpecies = unlockedSpecies[Math.floor(Math.random() * unlockedSpecies.length)];
        const alien = createAlien(randomSpecies);
        
        if (alien) {
            this.state.queue.push(alien);
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
        
        // Safety timeout: force complete after maximum time (30 seconds)
        const maxTime = 30000;
        setTimeout(() => {
            if (this.isProcessing && this.state.currentAlien && 
                this.state.processingStartTime && 
                Date.now() - this.state.processingStartTime > maxTime) {
                console.warn('Processing timeout - forcing completion after 30s');
                this.completeProcessing();
            }
        }, maxTime);
        
        this.updateProcessingDisplay();
    }
    
    updateProcessing() {
        if (!this.state.currentAlien || !this.state.processingStartTime) {
            // Safety: if we're marked as processing but don't have an alien, reset
            if (this.isProcessing) {
                this.isProcessing = false;
                this.state.currentAlien = null;
                this.state.processingStartTime = null;
            }
            return;
        }
        
        const now = Date.now();
        const elapsed = now - this.state.processingStartTime;
        
        // Calculate processing time with multipliers
        const baseTime = this.state.currentAlien.processingTime;
        const speedMultiplier = this.getUpgradeEffects().processingSpeedMultiplier;
        const eventMultipliers = this.eventManager.getEventMultipliers();
        
        // Safety check: ensure we don't divide by zero or negative
        const processingSpeed = Math.max(0.01, speedMultiplier * eventMultipliers.processingSpeed);
        const effectiveTime = Math.max(100, baseTime / processingSpeed); // Minimum 100ms
        
        const progress = Math.min(100, (elapsed / effectiveTime) * 100);
        this.state.currentAlien.progress = progress;
        
        // Update progress bar
        const fillBar = document.getElementById('processing-fill');
        const timeText = document.getElementById('processing-time-text');
        if (fillBar) fillBar.style.width = progress + '%';
        if (timeText) timeText.textContent = Math.floor(progress) + '%';
        
        // Safety timeout: force complete if processing takes too long (10x expected time)
        const maxProcessingTime = effectiveTime * 10;
        if (elapsed > maxProcessingTime) {
            console.warn('Processing timeout - forcing completion');
            this.completeProcessing();
            return;
        }
        
        // Check if complete - use >= for both progress and time to ensure completion
        if (progress >= 100 || elapsed >= effectiveTime) {
            // Force completion
            this.completeProcessing();
        }
        
        // Additional safety: if progress is stuck at 100% but not completing
        if (progress >= 99.9 && elapsed > effectiveTime * 1.1) {
            console.warn('Progress stuck - forcing completion');
            this.completeProcessing();
        }
    }
    
    completeProcessing(instant = false) {
        if (!this.state.currentAlien) {
            // Safety: if no alien but we're processing, reset state
            if (this.isProcessing) {
                this.isProcessing = false;
                this.state.processingStartTime = null;
            }
            return;
        }
        
        const alien = this.state.currentAlien;
        
        // Safety: prevent multiple calls
        if (!this.isProcessing && !instant) {
            return;
        }
        let paperworkEarned = alien.paperworkYield;
        let shouldAward = true;
        let quirkTriggered = false;
        
        // Apply quirk effects
        if (Math.random() < alien.quirkChance) {
            quirkTriggered = true;
            
            switch (alien.quirk) {
                case 'split':
                    paperworkEarned *= 2;
                    this.showNotification(`${alien.name} se dividiu em dois! Recompensa dobrada!`, 'success');
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
                        this.showNotification(`${alien.name} causou um erro!`, 'error');
                        shouldAward = false;
                    } else {
                        // Redo process
                        this.showNotification(`${alien.name} borrou o formulário! Refazendo...`, 'error');
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
                        this.showNotification(`Cones Anti-Gravidade impediram que ${alien.name} flutuasse para longe!`, 'success');
                    } else {
                        this.showNotification(`${alien.name} flutuou para longe!`, 'error');
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
                    this.showNotification(`${alien.name} auto-aprovou! Recompensa dobrada!`, 'success');
                    // Play self-approval animation
                    const spriteContainerSelf = document.querySelector('.alien-sprite');
                    if (spriteContainerSelf && spriteContainerSelf.firstChild) {
                        spriteManager.playQuirkAnimation(alien.speciesId, 'self_approval', spriteContainerSelf.firstChild);
                    }
                    break;
                    
                case 'time_loop':
                    paperworkEarned *= 2;
                    this.state.queue.unshift({ ...alien });
                    this.showNotification(`${alien.name} saiu e voltou! Rendimento dobrado!`, 'success');
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
                        this.showNotification(`${alien.name} explodiu! Fila limpa, recompensa enorme!`, 'error');
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
                    this.showNotification(`${alien.name} concedeu Multiplicador de Licenças por 30 segundos!`, 'success');
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
            this.showNotification('Sistema de Classificação Automática impediu penalidade!', 'success');
        }
        
        // Award resources
        if (shouldAward) {
            const eventMultipliers = this.eventManager.getEventMultipliers();
            const prestigeMultiplier = 1 + (this.state.cosmicApproval * 0.1);
            const finalPaperwork = Math.floor(paperworkEarned * eventMultipliers.paperwork * prestigeMultiplier);
            this.state.paperwork += finalPaperwork;
            this.state.totalPaperworkEarned += finalPaperwork;
            this.state.totalAliensProcessed++;
            
            // Show notification for larger gains
            if (finalPaperwork >= 20 || Math.random() < 0.3) {
                this.showNotification(`+${finalPaperwork} Paperwork`, 'success');
            }
        }
        
        // Reset processing
        this.isProcessing = false;
        this.state.currentAlien = null;
        this.state.processingStartTime = null;
        document.getElementById('processing-fill').style.width = '0%';
        document.getElementById('processing-time-text').textContent = '0%';
        
        // Start processing next alien immediately if queue has aliens
        if (this.state.queue.length > 0) {
            // Process immediately without delay
            if (!this.isProcessing) {
                this.startProcessing();
            }
        } else {
            this.updateProcessingDisplay();
        }
        
        this.checkSpeciesUnlocks();
    }
    
    handleStamp() {
        const clickYield = this.getUpgradeEffects().clickYield;
        
        // Always give click yield bonus if upgrade is owned
        if (clickYield > 0) {
            this.state.paperwork += clickYield;
            this.state.totalPaperworkEarned += clickYield;
            // Show notification occasionally to avoid spam
            if (Math.random() < 0.2) {
                this.showNotification(`+${clickYield} Documentos (bônus de clique)`, 'success');
            }
        }
        
        // If alien is being processed, clicking can speed it up or complete it
        if (this.isProcessing && this.state.currentAlien) {
            // Manual click speeds up processing by 10%
            const now = Date.now();
            const elapsed = now - this.state.processingStartTime;
            const speedBoost = elapsed * 0.1; // 10% speed boost
            this.state.processingStartTime = now - (elapsed + speedBoost);
            
            // Check if this click completes processing
            const baseTime = this.state.currentAlien.processingTime;
            const speedMultiplier = this.getUpgradeEffects().processingSpeedMultiplier;
            const eventMultipliers = this.eventManager.getEventMultipliers();
            const effectiveTime = baseTime / (speedMultiplier * eventMultipliers.processingSpeed);
            const newElapsed = now - this.state.processingStartTime;
            
            if (newElapsed >= effectiveTime) {
                this.completeProcessing();
            }
        } else if (this.state.currentAlien && !this.isProcessing) {
            // Complete processing if alien is ready
            this.completeProcessing();
        } else if (this.state.queue.length > 0 && !this.isProcessing) {
            // Start processing if queue has aliens
            this.startProcessing();
        }
    }
    
    generateLicenses() {
        // Manual license conversion only - no automatic conversion
        // This allows players to accumulate paperwork for upgrades
        // Licenses can be converted manually via button
        
        // Check license multiplier expiration
        if (Date.now() >= this.state.licenseMultiplierEndTime) {
            this.state.licenseMultiplier = 1;
        }
    }
    
    // Manual license conversion function
    convertToLicenses() {
        const licenseRate = 100;
        const fullChunks = Math.floor(this.state.paperwork / licenseRate);
        
        if (fullChunks > 0) {
            const eventMultipliers = this.eventManager.getEventMultipliers();
            const effectiveMultiplier = this.state.licenseMultiplier * eventMultipliers.licenses;
            const finalLicenses = Math.floor(fullChunks * effectiveMultiplier);
            
            this.state.licenses += finalLicenses;
            this.state.paperwork -= fullChunks * licenseRate;
            
            this.showNotification(`Convertido ${fullChunks * licenseRate} Documentos → ${finalLicenses} Licenças`, 'success');
            this.updateUI();
        } else {
            this.showNotification('Precisa de pelo menos 100 Documentos para converter!', 'error');
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
        
        // Update stats if stats tab
        if (tabName === 'stats') {
            this.updateStats();
        }
    }
    
    updateStats() {
        const playTime = Math.floor((Date.now() - this.state.gameStartTime) / 1000);
        const hours = Math.floor(playTime / 3600);
        const minutes = Math.floor((playTime % 3600) / 60);
        const seconds = playTime % 60;
        let timeStr = '';
        if (hours > 0) timeStr += `${hours}h `;
        if (minutes > 0) timeStr += `${minutes}m `;
        timeStr += `${seconds}s`;
        
        document.getElementById('stat-aliens-processed').textContent = this.formatNumber(this.state.totalAliensProcessed);
        document.getElementById('stat-total-paperwork').textContent = this.formatNumber(this.state.totalPaperworkEarned);
        document.getElementById('stat-play-time').textContent = timeStr;
        document.getElementById('stat-upgrades').textContent = this.state.upgrades.reduce((sum, u) => sum + u.level, 0);
        document.getElementById('stat-queue-length').textContent = this.state.queue.length + (this.state.currentAlien ? 1 : 0);
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
            upgradeElement.dataset.upgradeId = upgrade.id; // Store upgrade ID for refresh
            
            // Show requirement info if needed
            let requirementText = '';
            if (upgrade.requirement && !canPurchase) {
                const reqUpgrade = this.state.upgrades.find(u => u.id === upgrade.requirement.upgrade);
                const reqLevel = reqUpgrade ? reqUpgrade.level : 0;
                const reqName = UPGRADES[upgrade.requirement.upgrade]?.name || upgrade.requirement.upgrade;
                requirementText = `<div class="upgrade-requirement" style="color: #f44336; font-size: 12px; margin-top: 5px;">Requer: ${reqName} Nv. ${upgrade.requirement.level} (Você tem: Nv. ${reqLevel})</div>`;
            }
            
            upgradeElement.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-level">Lv. ${level}/${upgrade.maxLevel}</span>
                </div>
                <div class="upgrade-description">${upgrade.description}</div>
                ${requirementText}
                <div class="upgrade-cost">
                    <span class="upgrade-cost-text">${cost.type === 'paperwork' ? '📄' : '🪪'} ${this.formatNumber(cost.amount)}</span>
                    <button class="upgrade-buy-btn" data-upgrade-id="${upgrade.id}" ${!canPurchase || isMaxed ? 'disabled' : ''}>
                        ${isMaxed ? 'MÁXIMO' : 'COMPRAR'}
                    </button>
                </div>
            `;
            
            const buyBtn = upgradeElement.querySelector('.upgrade-buy-btn');
            buyBtn.addEventListener('click', () => {
                // Always try to purchase - the function will show error if it can't
                this.purchaseUpgrade(upgrade);
            });
            
            container.appendChild(upgradeElement);
        });
    }
    
    // Lightweight function to refresh upgrade button states without full re-render
    refreshUpgradeButtons() {
        // Get all upgrade buttons
        const buyButtons = document.querySelectorAll('.upgrade-buy-btn[data-upgrade-id]');
        
        buyButtons.forEach(btn => {
            const upgradeId = btn.dataset.upgradeId;
            const upgrade = UPGRADES[upgradeId];
            if (!upgrade) return;
            
            const owned = this.state.upgrades.find(u => u.id === upgradeId);
            const canPurchase = canPurchaseUpgrade(upgrade, this.state);
            const level = owned ? owned.level : 0;
            const isMaxed = level >= upgrade.maxLevel;
            const cost = getUpgradeCost(upgrade, owned);
            
            // Update button state
            btn.disabled = !canPurchase || isMaxed;
            
            // Update button text and add tooltip
            if (isMaxed) {
                btn.textContent = 'MÁXIMO';
                btn.title = 'Esta melhoria está no nível máximo';
            } else if (!canPurchase) {
                btn.textContent = 'COMPRAR';
                // Add helpful tooltip
                if (cost.type === 'paperwork' && this.state.paperwork < cost.amount) {
                    btn.title = `Precisa de ${this.formatNumber(cost.amount - this.state.paperwork)} Documentos a mais`;
                } else if (cost.type === 'licenses' && this.state.licenses < cost.amount) {
                    btn.title = `Precisa de ${this.formatNumber(cost.amount - this.state.licenses)} Licenças a mais`;
                } else if (upgrade.requirement) {
                    const reqUpgrade = this.state.upgrades.find(u => u.id === upgrade.requirement.upgrade);
                    if (!reqUpgrade || reqUpgrade.level < upgrade.requirement.level) {
                        btn.title = `Requer ${UPGRADES[upgrade.requirement.upgrade]?.name || 'melhoria'} nível ${upgrade.requirement.level}`;
                    }
                } else {
                    btn.title = 'Não pode comprar';
                }
            } else {
                btn.textContent = 'COMPRAR';
                btn.title = `Comprar por ${cost.type === 'paperwork' ? '📄' : '🪪'} ${this.formatNumber(cost.amount)}`;
            }
            
            // Update cost display
            const costText = btn.parentElement.querySelector('.upgrade-cost-text');
            if (costText) {
                const hasEnough = (cost.type === 'paperwork' && this.state.paperwork >= cost.amount) ||
                                 (cost.type === 'licenses' && this.state.licenses >= cost.amount);
                costText.textContent = `${cost.type === 'paperwork' ? '📄' : '🪪'} ${this.formatNumber(cost.amount)}`;
                costText.style.color = hasEnough ? '#4a90e2' : '#f44336';
            }
        });
    }
    
    purchaseUpgrade(upgrade) {
        const owned = this.state.upgrades.find(u => u.id === upgrade.id);
        const cost = getUpgradeCost(upgrade, owned);
        
        // Double-check can purchase
        if (!canPurchaseUpgrade(upgrade, this.state)) {
            const reqUpgrade = upgrade.requirement ? this.state.upgrades.find(u => u.id === upgrade.requirement.upgrade) : null;
            if (upgrade.requirement && (!reqUpgrade || reqUpgrade.level < upgrade.requirement.level)) {
                const reqName = UPGRADES[upgrade.requirement.upgrade]?.name || upgrade.requirement.upgrade;
                this.showNotification(`Requer ${reqName} nível ${upgrade.requirement.level}!`, 'error');
            } else if (cost.type === 'paperwork' && this.state.paperwork < cost.amount) {
                this.showNotification(`Precisa de ${this.formatNumber(cost.amount - this.state.paperwork)} Documentos a mais!`, 'error');
            } else if (cost.type === 'licenses' && this.state.licenses < cost.amount) {
                this.showNotification(`Precisa de ${this.formatNumber(cost.amount - this.state.licenses)} Licenças a mais!`, 'error');
            } else {
                this.showNotification('Não é possível comprar esta melhoria!', 'error');
            }
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
        this.showNotification(`${upgrade.name} comprado!`, 'success');
    }
    
    updateUI() {
        // Update resources
        document.getElementById('paperwork-count').textContent = this.formatNumber(this.state.paperwork);
        document.getElementById('licenses-count').textContent = this.formatNumber(this.state.licenses);
        document.getElementById('cosmic-approval-count').textContent = this.formatNumber(this.state.cosmicApproval);
        
        // Update convert button
        const convertBtn = document.getElementById('convert-licenses-btn');
        const canConvert = Math.floor(this.state.paperwork / 100) > 0;
        convertBtn.disabled = !canConvert;
        const chunks = Math.floor(this.state.paperwork / 100);
        if (chunks > 0) {
            convertBtn.textContent = `🔄 Converter (${chunks})`;
            convertBtn.title = `Converter ${chunks * 100} Documentos → ${chunks} Licença(s)`;
        } else {
            convertBtn.textContent = `🔄 Converter`;
            convertBtn.title = 'Converter 100 Documentos → 1 Licença';
        }
        
        // Update upgrade button states (lightweight refresh)
        this.refreshUpgradeButtons();
        
        // Update prestige
        const prestigeMultiplier = 1 + (this.state.cosmicApproval * 0.1);
        document.getElementById('prestige-multiplier').textContent = prestigeMultiplier.toFixed(2) + 'x';
        
        const canPrestige = this.state.licenses >= this.state.prestigeRequirement;
        document.getElementById('prestige-btn').disabled = !canPrestige;
        document.getElementById('prestige-requirement').textContent = 
            `Requer ${this.formatNumber(this.state.prestigeRequirement)} Licenças`;
        
        // Update queue display
        this.updateQueueDisplay();
        
        // Update stamp button - always allow clicks for click yield bonus
        const stampBtn = document.getElementById('stamp-btn');
        const hasAutoProcess = this.getUpgradeEffects().autoProcessInterval !== null;
        const clickYield = this.getUpgradeEffects().clickYield;
        
        // Never disable if there's click yield - player should always be able to click
        if (clickYield > 0) {
            stampBtn.disabled = false;
            stampBtn.title = `Clique para +${clickYield} Documentos de bônus! (Também acelera o processamento)`;
        } else {
            // Only disable if automation is active and processing, and no click yield
            stampBtn.disabled = hasAutoProcess && this.isProcessing;
            stampBtn.title = hasAutoProcess ? 'Automação está ativa' : 'Clique para processar alienígenas';
        }
        
        // Update button text without causing layout shifts
        // Use a separate span for the bonus text to keep button stable
        let bonusSpan = stampBtn.querySelector('.stamp-bonus');
        if (clickYield > 0) {
            if (!bonusSpan) {
                // Create bonus span if it doesn't exist - find the text node after "STAMP"
                const textNodes = Array.from(stampBtn.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                const stampTextNode = textNodes.find(n => n.textContent.includes('STAMP'));
                if (stampTextNode) {
                    // Insert bonus span after STAMP text
                    bonusSpan = document.createElement('span');
                    bonusSpan.className = 'stamp-bonus';
                    stampTextNode.parentNode.insertBefore(bonusSpan, stampTextNode.nextSibling);
                } else {
                    // Fallback: append to button
                    bonusSpan = document.createElement('span');
                    bonusSpan.className = 'stamp-bonus';
                    stampBtn.appendChild(bonusSpan);
                }
            }
            bonusSpan.textContent = ` (+${clickYield})`;
        } else {
            // Remove bonus span if no click yield
            if (bonusSpan) {
                bonusSpan.remove();
            }
        }
        
        // Update processing display
        if (!this.isProcessing && !this.state.currentAlien) {
            this.updateProcessingDisplay();
        }
    }
    
    updateQueueDisplay() {
        const queueDisplay = document.getElementById('queue-display');
        
        if (this.state.queue.length === 0 && !this.state.currentAlien) {
            queueDisplay.innerHTML = '<p class="empty-queue">Nenhum alienígena na fila...</p>';
            return;
        }
        
        queueDisplay.innerHTML = '';
        
        // Show current alien if processing
        if (this.state.currentAlien) {
            const item = document.createElement('div');
            item.className = 'queue-item processing';
            item.innerHTML = `
                <strong>${this.state.currentAlien.emoji} ${this.state.currentAlien.name}</strong><br>
                <small>${this.state.currentAlien.species} - Processando...</small>
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
            more.innerHTML = `<em>+${this.state.queue.length - 10} mais...</em>`;
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
            // Default waiting state - use emoji fallback
            alienSpriteContainer.innerHTML = '';
            const emojiElement = document.createElement('div');
            emojiElement.className = 'sprite-emoji-fallback';
            emojiElement.textContent = '👽';
            alienSpriteContainer.appendChild(emojiElement);
            alienName.textContent = 'Aguardando alienígenas...';
            alienSpecies.textContent = '';
            alienQuote.textContent = '';
            const clickYield = this.getUpgradeEffects().clickYield;
            if (clickYield > 0) {
                processingStatus.textContent = `Clique em CARIMBAR para +${clickYield} Documentos de bônus!`;
            } else {
                processingStatus.textContent = 'Clique em CARIMBAR ou aguarde a automação';
            }
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
                <div class="event-timer">Tempo restante: ${timeLeft}s</div>
            `;
            
            if (event.id === 'black_hole_near_miss' && !event.paid) {
                const actionButton = document.createElement('button');
                actionButton.className = 'upgrade-buy-btn';
                actionButton.style.marginTop = '10px';
                actionButton.textContent = `Pagar ${event.cost.amount} Documentos`;
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
            this.showNotification('Custo do evento pago!', 'success');
            this.updateEventDisplay();
        } else {
            this.showNotification('Recursos insuficientes!', 'error');
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
        
        this.showNotification(`Prestigiado! Ganhou ${approvalGained} Aprovação Cósmica!`, 'success');
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
                // Ensure new stats fields exist
                if (!this.state.totalAliensProcessed) this.state.totalAliensProcessed = 0;
                if (!this.state.totalPaperworkEarned) this.state.totalPaperworkEarned = 0;
                if (!this.state.gameStartTime) this.state.gameStartTime = Date.now();
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
        this.showNotification('Save exportado!', 'success');
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
                        this.showNotification('Save importado!', 'success');
                    } catch (err) {
                        this.showNotification('Arquivo de save inválido!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    resetGame() {
        if (confirm('Tem certeza absoluta? Isso apagará TODO o progresso incluindo Aprovação Cósmica!')) {
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

