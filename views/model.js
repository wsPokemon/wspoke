// model.js
// Estado y lógica de negocio del juego Wordshake

export const gameState = {
    score: 0,
    timeLeft: 180, // 3 minutos en segundos
    currentWord: '',
    usedWords: new Set(),
    timer: null,
    selectedCells: []
};

export function resetGameState() {
    gameState.score = 0;
    gameState.timeLeft = 180;
    gameState.currentWord = '';
    gameState.usedWords = new Set();
    gameState.timer = null;
    gameState.selectedCells = [];
}

export function formatWord(entered_Pokemon) {
    return entered_Pokemon.charAt(0).toUpperCase() + entered_Pokemon.slice(1).toLowerCase();
}

// Aquí puedes agregar más funciones puras relacionadas al estado del juego.
