// controller.js
// Orquestador principal del juego Wordshake

import { gameState, resetGameState, formatWord } from './model.js';
import { showScreen, toggleModal, addWordToList, showValidationMessage, updateLeaderboard, modal } from './view.js';

let isActive = false;

// --- Funciones de control ---
async function initGame() {
    try {
        const response = await fetch('http://localhost:3000/api/letters');
        const data = await response.json();
        const letters = data.letters;
        const grid = document.querySelector('.game-grid');
        grid.innerHTML = '';
        letters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.addEventListener('click', () => selectLetter(cell));
            grid.appendChild(cell);
        });
        startTimer();
    } catch {
        console.error('Error al inicializar el juego:');
    }
}

function selectLetter(cell) {
    if (cell.classList.contains('selected')) return;
    cell.classList.add('selected');
    gameState.currentWord += cell.textContent;
    gameState.selectedCells.push(cell);
    const preview = document.querySelector('.word-preview');
    preview.textContent = gameState.currentWord;
}

function resetWord() {
    gameState.selectedCells.forEach(cell => {
        cell.classList.remove('selected');
    });
    gameState.selectedCells = [];
    gameState.currentWord = '';
    document.querySelector('.word-preview').textContent = '';
}

async function validateWord() {
    gameState.currentWord = formatWord(gameState.currentWord);
    if (gameState.currentWord.length < 3) {
        showValidationMessage('La palabra debe tener al menos 3 letras', false);
        return;
    }
    if (gameState.usedWords.has(gameState.currentWord)) {
        showValidationMessage('Ya usaste esta palabra', false);
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: gameState.currentWord })
        });
        const data = await response.json();
        if (data.isValid) {
            gameState.score += gameState.currentWord.length;
            gameState.usedWords.add(gameState.currentWord);
            document.getElementById('score').textContent = gameState.score;
            showValidationMessage(`¡Correcto! Has encontrado a ${data.pokemon.name}`, true);
            addWordToList(data.pokemon);
            resetWord();
        } else {
            showValidationMessage('Debes escribir el nombre completo de un Pokémon', false);
        }
    } catch {
        console.error('Error al validar la palabra:');
        showValidationMessage('Error al validar', false);
    }
}

function endGame() {
    clearInterval(gameState.timer);
    gameState.timer = null;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-score-game-over').textContent = gameState.score;
    isActive = false;
    toggleModal(false, 'gameOver');
    toggleModal(false, 'saveUser');
    toggleModal(true, 'saveUser');
}

async function shuffleLetters() {
    try {
        const response = await fetch('http://localhost:3000/api/shuffle', { method: 'POST' });
        const data = await response.json();
        const letters = data.letters;
        const grid = document.querySelector('.game-grid');
        grid.innerHTML = '';
        letters.forEach((letter, index) => {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.textContent = letter;
            cell.dataset.index = index;
            cell.addEventListener('click', () => selectLetter(cell));
            grid.appendChild(cell);
        });
        resetWord();
        showValidationMessage('¡Nuevas letras generadas!', true);
    } catch {
        console.error('Error al mezclar letras:');
        showValidationMessage('Error al mezclar letras', false);
    }
}

async function resetGame() {
    clearInterval(gameState.timer);
    gameState.timer = null;
    try {
        await fetch('http://localhost:3000/api/reset', { method: 'POST' });
        resetGameState();
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '03:00';
        document.querySelector('.word-preview').textContent = '';
        document.querySelector('.words-list').innerHTML = '';
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
        await initGame();
    } catch {
        console.error('Error al reiniciar el juego:');
    }
}

function startTimer() {
    clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// --- Listeners y coordinación ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.play-btn').addEventListener('click', () => {
        resetGame();
        showScreen('game-screen');
        isActive = true;
    });

    // Volver a Jugar desde pantalla de juego
    document.querySelector('.replay-btn').addEventListener('click', () => {
        resetGame();
        showScreen('game-screen');
        isActive = true;
    });
    document.querySelector('.back-btn').addEventListener('click', () => {
        clearInterval(gameState.timer);
        gameState.timer = null;
        showScreen('start-screen');
        isActive = false;
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
    });
    document.querySelector('.reset-word-btn').addEventListener('click', resetWord);
    document.querySelector('.submit-word-btn').addEventListener('click', validateWord);
    document.querySelector('.shuffle-btn').addEventListener('click', shuffleLetters);
    document.querySelector('.instrucciones-modal').addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            toggleModal(false);
        }
    });
    document.addEventListener('keyup', function (e) {
        if (!isActive) return;
        if (e.key === 's') resetWord();
        if (e.key === 'r') shuffleLetters();
        if (e.key === 'e') validateWord();
        if (e.key === 'R' && e.shiftKey) {
            // Shift+R para reiniciar el juego
            resetGame();
            showScreen('game-screen');
            isActive = true;
        }
    });
    document.querySelector('.play-again-btn').addEventListener('click', () => {
        resetGame();
        showScreen('game-screen');
        isActive = true;
    });
    document.querySelector('.play-again-btn-over').addEventListener('click', () => {
        resetGame();
        showScreen('game-screen');
        isActive = true;
    });
    document.querySelector('.menu-btn').addEventListener('click', () => {
        clearInterval(gameState.timer);
        gameState.timer = null;
        showScreen('start-screen');
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
        toggleModal(false, 'overlay');
        isActive = false;
    });
    document.querySelector('.menu-btn-over').addEventListener('click', () => {
        clearInterval(gameState.timer);
        gameState.timer = null;
        showScreen('start-screen');
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
        toggleModal(false, 'overlay');
        isActive = false;
    });

    // Mostrar instrucciones desde menú principal
    document.querySelector('.instructions-btn').addEventListener('click', () => {
        toggleModal(true);
        document.querySelector('.instrucciones-modal').focus();
    });
    // Mostrar instrucciones desde game screen
    document.querySelector('.help-btn').addEventListener('click', () => {
        toggleModal(true);
        document.querySelector('.instrucciones-modal').focus();
    });
        gameState.timer = null;
        showScreen('start-screen');
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
        toggleModal(false, 'overlay');
        isActive = false;
    });
    document.querySelector('.save-btn').addEventListener('click', async () => {
        const playerName = document.getElementById('player-name').value.trim();
        const score = gameState.score;
        if (!playerName) {
            showValidationMessage('Por favor, ingresa un nombre.', false);
            return;
        }
        // Generar o recuperar UUID único del jugador
        let uuid = localStorage.getItem('wordshake_uuid');
        if (!uuid) {
            uuid = crypto.randomUUID();
            localStorage.setItem('wordshake_uuid', uuid);
        }
        if (score <= 0) {
            showValidationMessage('No puedes guardar un puntaje de 0. ¡Juega para obtener puntos!', false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score, uuid })
            });
            if (response.ok) {
                await loadMainLeaderboard('leaderboard-rows');
                toggleModal(false, 'saveUser');
                toggleModal(true, 'gameOver');
            } else if (response.status === 409) {
                const data = await response.json();
                showValidationMessage(data.error || 'Error al guardar el puntaje', false);
            } else if (response.status === 400) {
                const data = await response.json();
                showValidationMessage(data.error || 'No puedes guardar un puntaje de 0.', false);
            } else {
                showValidationMessage('Error al guardar el puntaje', false);
            }
        } catch {
            showValidationMessage('Error al guardar el puntaje', false);
        }
    });

    // Leaderboard desde el menú principal
    document.querySelector('.leaderboard-btn').addEventListener('click', async () => {
        await loadMainLeaderboard();
        showScreen('leaderboard-screen');
        isActive = false;
    });
    // Volver al menú principal desde leaderboard
    document.querySelector('.back-to-menu-btn').addEventListener('click', () => {
        clearInterval(gameState.timer);
        gameState.timer = null;
        showScreen('start-screen');
        toggleModal(false, 'saveUser');
        toggleModal(false, 'gameOver');
        isActive = false;
    });

    // Cargar leaderboard principal
    async function loadMainLeaderboard(elementId = 'main-leaderboard-rows') {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'GET'
            });
            const leaderboard = await response.json();
            updateLeaderboard(leaderboard, elementId);
        } catch {
            console.error('Error al cargar el leaderboard:');
        }
    }

    modal.closeButtons.forEach(btn => {
        btn.addEventListener('click', () => toggleModal(false));
    });
    modal.overlay.addEventListener('click', (e) => {
        if (e.target === modal.overlay) toggleModal(false);
    });
    // Inicializar pantalla de inicio
    showScreen('start-screen');

