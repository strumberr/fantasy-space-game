import { showToast, fetchWithAuth, CHARACTER_CLASSES, COMMON_DISPLAY_PROPERTIES, CLASS_SPECIFIC_PROPERTIES } from '../script.js';
import { formatLevel } from './characters.js';

class MatchesTab {
    constructor() {
        this.matchModal = null;
        this.matchResultModal = null;
        this.characters = [];
        this.initialize();
    }

    initialize() {
        console.log('Initializing matches tab...');

        // Initialize modals
        this.matchModal = new bootstrap.Modal(document.getElementById('newMatchModal'));
        this.matchResultModal = new bootstrap.Modal(document.getElementById('matchResultModal'));

        // Add event listeners
        document.getElementById('matches-tab').addEventListener('shown.bs.tab', () => {
            console.log('Matches tab shown, loading matches...');
            this.loadMatches();
            this.loadCharacters(); // Load characters when tab is shown
        });

        // Add event listener for new match modal shown
        document.getElementById('newMatchModal').addEventListener('show.bs.modal', () => {
            this.loadCharacters(); // Reload characters when modal is opened
        });

        document.getElementById('randomMatchButton').addEventListener('click', this.handleRandomMatch.bind(this));
        document.getElementById('fightButton').addEventListener('click', this.handleFight.bind(this));

        // Add change listeners for character selects
        document.getElementById('challengerSelect').addEventListener('change', this.updateFightButton.bind(this));
        document.getElementById('opponentSelect').addEventListener('change', this.updateFightButton.bind(this));
    }

    async loadCharacters() {
        try {
            // Load challengers
            const challengers = await fetchWithAuth('/api/characters/challengers');

            // Load opponents
            const opponents = await fetchWithAuth('/api/characters/opponents');

            // Store characters and populate selects
            this.characters = {
                challengers: challengers,
                opponents: opponents
            };

            this.populateCharacterSelects();
        } catch (error) {
            console.error('Error loading characters:', error);
            showToast(error.message, true);
        }
    }

    populateCharacterSelects() {
        const challengerSelect = document.getElementById('challengerSelect');
        const opponentSelect = document.getElementById('opponentSelect');

        // Add the select classes
        challengerSelect.className = 'character-select';
        opponentSelect.className = 'character-select';

        // Clear existing options except the first one
        challengerSelect.innerHTML = '<option value="">Choose your challenger...</option>';
        opponentSelect.innerHTML = '<option value="">Choose your opponent...</option>';

        // Add challenger options
        this.characters.challengers.forEach(character => {
            const option = document.createElement('option');
            option.value = character.id;
            option.dataset.class = character.characterClass;
            const icon = character.characterClass === 'WARRIOR' ? '⚔️' : '🔮';
            option.textContent = `${icon} ${character.name} (${formatLevel(character.level)})`;
            challengerSelect.appendChild(option.cloneNode(true));
        });

        // Add opponent options
        this.characters.opponents.forEach(character => {
            const option = document.createElement('option');
            option.value = character.id;
            option.dataset.class = character.characterClass;
            const icon = character.characterClass === 'WARRIOR' ? '⚔️' : '🔮';
            option.textContent = `${icon} ${character.name} (${formatLevel(character.level)})`;
            opponentSelect.appendChild(option);
        });
    }

    updateFightButton() {
        const challengerId = document.getElementById('challengerSelect').value;
        const opponentId = document.getElementById('opponentSelect').value;
        const fightButton = document.getElementById('fightButton');
        const challengerSelect = document.getElementById('challengerSelect');
        const opponentSelect = document.getElementById('opponentSelect');

        fightButton.disabled = !challengerId || !opponentId || challengerId === opponentId;

        // Update character stats displays
        if (challengerId) {
            const challenger = this.characters.challengers.find(c => c.id === challengerId);
            this.displayCharacterStats('challenger', challenger);
            challengerSelect.dataset.class = challenger.characterClass;
        } else {
            delete challengerSelect.dataset.class;
        }
        if (opponentId) {
            const opponent = this.characters.opponents.find(c => c.id === opponentId);
            this.displayCharacterStats('opponent', opponent);
            opponentSelect.dataset.class = opponent.characterClass;
        } else {
            delete opponentSelect.dataset.class;
        }
    }

    displayCharacterStats(type, character) {
        if (!character) return;

        const statsContainer = document.getElementById(`${type}Stats`);
        statsContainer.innerHTML = '';

        // Add common properties
        COMMON_DISPLAY_PROPERTIES.forEach(prop => {
            if (character[prop] !== undefined) {
                const propertyItem = this.createPropertyElement(prop, character[prop]);
                statsContainer.appendChild(propertyItem);
            }
        });

        // Add class-specific properties
        const classSpecificProps = CLASS_SPECIFIC_PROPERTIES[character.characterClass] || [];
        classSpecificProps.forEach(prop => {
            if (character[prop] !== undefined) {
                const propertyItem = this.createPropertyElement(prop, character[prop]);
                statsContainer.appendChild(propertyItem);
            }
        });
    }

    createPropertyElement(prop, value) {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'property-item';
        propertyItem.dataset.property = prop;

        const label = document.createElement('div');
        label.className = 'property-label';
        label.textContent = this.formatPropertyName(prop);

        const valueElement = document.createElement('div');
        valueElement.className = 'property-value';
        valueElement.textContent = value;

        propertyItem.appendChild(label);
        propertyItem.appendChild(valueElement);

        return propertyItem;
    }

    formatPropertyName(prop) {
        return prop
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    async loadMatches() {
        console.log('Loading matches...');
        const listContainer = document.getElementById('matchesList');
        try {
            listContainer.innerHTML = '<p class="text-muted text-center">Loading matches...</p>';

            const matches = await fetchWithAuth('/api/matches');

            this.displayMatches(matches);
        } catch (error) {
            console.error('Error loading matches:', error);
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle fa-3x"></i>
                    <p>Failed to load matches</p>
                    <small>${error.message}</small>
                </div>
            `;
            showToast(error.message, true);
        }
    }

    displayMatches(matches) {
        const listContainer = document.getElementById('matchesList');
        listContainer.innerHTML = '';

        if (matches.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-galaxy fa-3x"></i>
                    <p>The cosmic arena awaits its first battle...</p>
                    <small>Create a match to begin your legend</small>
                </div>
            `;
            return;
        }

        matches.forEach(match => {
            const matchElement = this.createMatchElement(match);
            listContainer.appendChild(matchElement);
        });
    }

    createMatchElement(match) {
        const div = document.createElement('div');
        div.className = 'match-item card mb-3';
        div.innerHTML = `
            <div class="card-body">
                <div class="match-participants d-flex justify-content-between align-items-center">
                    <div class="character-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-2">
                            <span class="class-icon" title="${CHARACTER_CLASSES[match.challenger.characterClass].name}">
                                ${match.challenger.characterClass === 'WARRIOR' ? '⚔️' : '🔮'}
                            </span>
                            <h6 class="character-name mb-0">
                                ${match.challenger.name}
                                <span class="experience-gained">
                                    <i class="fas fa-star"></i> +${match.challenger.experienceGained}
                                </span>
                            </h6>
                        </div>
                        <span class="badge ms-3 ${match.challenger.isVictor ? 'bg-success' : !match.opponent.isVictor ? 'bg-warning' : 'bg-danger'}">
                            ${!match.challenger.isVictor && !match.opponent.isVictor ? 'DRAW' : match.challenger.isVictor ? 'WINNER' : 'DEFEATED'}
                        </span>
                    </div>

                    <div class="match-vs">
                        <span>VS</span>
                        <span class="rounds-info"><i class="fas fa-clock"></i> ${match.rounds.length}</span>
                    </div>

                    <div class="character-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-2">
                            <span class="class-icon" title="${CHARACTER_CLASSES[match.opponent.characterClass].name}">
                                ${match.opponent.characterClass === 'WARRIOR' ? '⚔️' : '🔮'}
                            </span>
                            <h6 class="character-name mb-0">
                                ${match.opponent.name}
                                <span class="experience-gained">
                                    <i class="fas fa-star"></i> +${match.opponent.experienceGained}
                                </span>
                            </h6>
                        </div>
                        <span class="badge ms-3 ${match.opponent.isVictor ? 'bg-success' : !match.challenger.isVictor ? 'bg-warning' : 'bg-danger'}">
                            ${!match.challenger.isVictor && !match.opponent.isVictor ? 'DRAW' : match.opponent.isVictor ? 'WINNER' : 'DEFEATED'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Initialize tooltips
        const tooltips = div.querySelectorAll('[title]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));

        div.addEventListener('click', () => this.displayMatchResult(match));

        return div;
    }

    async handleFight(event) {
        event.preventDefault();
        const challengerId = document.getElementById('challengerSelect').value;
        const opponentId = document.getElementById('opponentSelect').value;
        const fightButton = document.getElementById('fightButton');

        if (!challengerId || !opponentId) return;
        const rounds = parseInt(document.getElementById('roundsSelect').value) || 20;

        try {
            fightButton.disabled = true;
            fightButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fighting...';

            const match = await fetchWithAuth('/api/matches', {
                method: 'POST',
                body: JSON.stringify({
                    challengerId: challengerId,
                    opponentId: opponentId,
                    rounds: rounds
                })
            });

            // Hide the new match modal
            this.matchModal.hide();

            // Show the match result directly from the response
            this.displayMatchResult(match);

            // Reload the matches list
            await this.loadMatches();

            showToast('Match completed successfully!');
        } catch (error) {
            console.error('Error creating match:', error);
            showToast(error.message, true);
        } finally {
            fightButton.disabled = false;
            fightButton.innerHTML = '<i class="fas fa-swords"></i> Fight!';
        }
    }

    async handleRandomMatch() {
        // Check if we have enough characters
        if (!this.characters.challengers.length || !this.characters.opponents.length) {
            showToast('Not enough characters available for a random match', true);
            return;
        }

        // Get random challenger and opponent
        const challenger = this.characters.challengers[Math.floor(Math.random() * this.characters.challengers.length)];

        // Filter out the challenger from opponents if it exists there
        const availableOpponents = this.characters.opponents.filter(c => c.id !== challenger.id);

        if (!availableOpponents.length) {
            showToast('No available opponents for this challenger', true);
            return;
        }

        const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];

        // Set the select values
        document.getElementById('challengerSelect').value = challenger.id;
        document.getElementById('opponentSelect').value = opponent.id;

        // Update the fight button and stats
        this.updateFightButton();
    }

    displayMatchResult(match) {
        const modal = document.getElementById('matchResultModal');

        modal.querySelector('.modal-body').innerHTML = `
            <div class="match-content">
                <div class="match-summary mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="challenger" data-class="${match.challenger.characterClass}">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="class-icon" title="${CHARACTER_CLASSES[match.challenger.characterClass].name}">
                                    ${match.challenger.characterClass === 'WARRIOR' ? '⚔️' : '🔮'}
                                </span>
                                <h5 class="mb-0">${match.challenger.name}</h5>
                            </div>
                            <div class="badge ${match.challenger.isVictor ? 'bg-success' : !match.opponent.isVictor ? 'bg-warning' : 'bg-danger'}">
                                ${!match.challenger.isVictor && !match.opponent.isVictor ? 'DRAW' : match.challenger.isVictor ? 'WINNER' : 'DEFEATED'}
                            </div>
                            <div class="experience-info">
                                <div class="d-flex align-items-center gap-2">
                                    <span title="Total Experience">
                                        <i class="fas fa-star"></i> ${match.challenger.experienceTotal}
                                    </span>
                                    <span class="text-success" title="Experience Gained">
                                        <i class="fas fa-plus"></i>${match.challenger.experienceGained}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="match-vs">
                            <span>VS</span>
                            <span class="rounds-info"><i class="fas fa-clock"></i> ${match.rounds.length}</span>
                        </div>
                        
                        <div class="opponent" data-class="${match.opponent.characterClass}">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="class-icon" title="${CHARACTER_CLASSES[match.opponent.characterClass].name}">
                                    ${match.opponent.characterClass === 'WARRIOR' ? '⚔️' : '🔮'}
                                </span>
                                <h5 class="mb-0">${match.opponent.name}</h5>
                            </div>
                            <div class="badge ${match.opponent.isVictor ? 'bg-success' : !match.challenger.isVictor ? 'bg-warning' : 'bg-danger'}">
                                ${!match.challenger.isVictor && !match.opponent.isVictor ? 'DRAW' : match.opponent.isVictor ? 'WINNER' : 'DEFEATED'}
                            </div>
                            <div class="experience-info">
                                <div class="d-flex align-items-center gap-2">
                                    <span title="Total Experience">
                                        <i class="fas fa-star"></i> ${match.opponent.experienceTotal}
                                    </span>
                                    <span class="text-success" title="Experience Gained">
                                        <i class="fas fa-plus"></i>${match.opponent.experienceGained}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rounds-timeline">
                    <h6 class="mb-3">Battle Timeline</h6>
                    <div class="rounds-list"></div>
                </div>
            </div>

            <div class="match-footer">
                <button type="button" class="btn btn-cosmic" data-bs-dismiss="modal">
                    <i class="fas fa-portal-exit"></i> Return to the Cosmic Arena
                </button>
            </div>
        `;

        // Initialize tooltips in the modal
        const tooltips = modal.querySelectorAll('[title]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));

        // Display rounds if they exist
        const roundsList = modal.querySelector('.rounds-list');
        if (match.rounds && Array.isArray(match.rounds)) {
            // Group rounds by round number
            const roundsMap = match.rounds.reduce((acc, round) => {
                if (!acc[round.round]) {
                    acc[round.round] = {};
                }
                const character = round.characterId === match.challenger.id ? 'challenger' : 'opponent';
                acc[round.round][character] = round;
                return acc;
            }, {});

            roundsList.innerHTML = Object.entries(roundsMap).map(([roundNum, roundData]) => `
                <div class="round-item">
                    <div class="round-header">Round ${roundNum}</div>
                    <div class="round-content d-flex justify-content-between align-items-center gap-4">
                        <div class="challenger-stats flex-grow-1">
                            ${roundData.challenger ? `
                                <div class="stats-row d-flex justify-content-between">
                                    <div class="stat-item ${roundData.challenger.healthDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">❤️</span>
                                        <span class="stat-value">${roundData.challenger.healthDelta >= 0 ? '+' : ''}${roundData.challenger.healthDelta}</span>
                                    </div>
                                    <div class="stat-item ${roundData.challenger.staminaDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">⚡</span>
                                        <span class="stat-value">${roundData.challenger.staminaDelta >= 0 ? '+' : ''}${roundData.challenger.staminaDelta}</span>
                                    </div>
                                    <div class="stat-item ${roundData.challenger.manaDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">✨</span>
                                        <span class="stat-value">${roundData.challenger.manaDelta >= 0 ? '+' : ''}${roundData.challenger.manaDelta}</span>
                                    </div>
                                </div>
                            ` : '<div class="no-action">No action</div>'}
                        </div>

                        <div class="round-vs">VS</div>

                        <div class="opponent-stats flex-grow-1">
                            ${roundData.opponent ? `
                                <div class="stats-row d-flex justify-content-between">
                                    <div class="stat-item ${roundData.opponent.healthDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">❤️</span>
                                        <span class="stat-value">${roundData.opponent.healthDelta >= 0 ? '+' : ''}${roundData.opponent.healthDelta}</span>
                                    </div>
                                    <div class="stat-item ${roundData.opponent.staminaDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">⚡</span>
                                        <span class="stat-value">${roundData.opponent.staminaDelta >= 0 ? '+' : ''}${roundData.opponent.staminaDelta}</span>
                                    </div>
                                    <div class="stat-item ${roundData.opponent.manaDelta < 0 ? 'negative' : 'positive'}">
                                        <span class="stat-label">✨</span>
                                        <span class="stat-value">${roundData.opponent.manaDelta >= 0 ? '+' : ''}${roundData.opponent.manaDelta}</span>
                                    </div>
                                </div>
                            ` : '<div class="no-action">No action</div>'}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            roundsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle fa-3x"></i>
                    <p>No rounds data available</p>
                </div>
            `;
        }

        // Show the modal
        const matchResultModal = new bootstrap.Modal(modal);
        matchResultModal.show();
    }
}

export default MatchesTab;