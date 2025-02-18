import CharactersTab from './js/characters.js';
import MatchesTab from './js/matches.js';
import LeaderboardTab from './js/leaderboard.js';

// Common configurations
export const CHARACTER_CLASSES = {
    WARRIOR: {
        name: 'Warrior',
        properties: {
            health: { type: 'number', min: 1, max: 200, default: 110 },
            attackPower: { type: 'number', min: 1, max: 100, default: 40 },
            stamina: { type: 'number', min: 1, max: 100, default: 20 },
            defensePower: { type: 'number', min: 1, max: 100, default: 30 }
        }
    },
    SORCERER: {
        name: 'Sorcerer',
        properties: {
            health: { type: 'number', min: 1, max: 200, default: 100 },
            attackPower: { type: 'number', min: 1, max: 100, default: 40 },
            mana: { type: 'number', min: 0, max: 100, default: 30 },
            healingPower: { type: 'number', min: 0, max: 100, default: 30 }
        }
    }
};

export const COMMON_DISPLAY_PROPERTIES = ['health', 'attackPower'];
export const CLASS_SPECIFIC_PROPERTIES = {
    WARRIOR: ['stamina', 'defensePower'],
    SORCERER: ['mana', 'healingPower']
};

// Utility functions
export function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

export function checkAuth() {
    const auth = window.sessionStorage.getItem('auth');
    if (!auth) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

export async function fetchWithAuth(url, options = {}) {
    const auth = window.sessionStorage.getItem('auth');
    if (!auth) {
        window.location.href = '/login.html';
        return;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        }
    });

    if (response.status === 401) {
        // Clear invalid auth token
        window.sessionStorage.removeItem('auth');
        // Redirect to login with error message
        window.location.href = '/login.html?authError=true';
        return;
    }

    // Parse JSON response
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    try {
        // Initialize all tabs
        const charactersTab = new CharactersTab();
        const matchesTab = new MatchesTab();
        const leaderboardTab = new LeaderboardTab();

        // Show characters tab by default
        const charactersTabEl = document.getElementById('characters-tab');
        const tab = new bootstrap.Tab(charactersTabEl);
        tab.show();
    } catch (error) {
        console.error('Error initializing application:', error);
        showToast('Failed to initialize application', true);
    }
});

// Update the logout handler to clear all user data
window.handleLogout = function() {
    // Clear all authentication and user data
    window.sessionStorage.clear();  // Clears all session storage
    window.localStorage.clear();    // Clears all local storage
    
    // Clear any cached data or state
    window.location.href = '/login.html';
}

// Add function to reset user context when loading login page
export function resetUserContext() {
    // Clear all storage
    window.sessionStorage.clear();
    window.localStorage.clear();
    
    // Clear any cached data
    if (window.caches) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
}
