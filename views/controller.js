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
    } catch (error) {
        console.error('Error al inicializar el juego:', error);
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
    } catch (error) {
        console.error('Error al validar la palabra:', error);
        showValidationMessage('Error al validar', false);
    }
}

function endGame() {
    clearInterval(gameState.timer);
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-score-game-over').textContent = gameState.score;
    isActive = false;
    toggleModal(false);
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
    } catch (error) {
        console.error('Error al mezclar letras:', error);
        showValidationMessage('Error al mezclar letras', false);
    }
}

async function resetGame() {
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
    } catch (error) {
        console.error('Error al reiniciar el juego:', error);
    }
}

function startTimer() {
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
        showScreen('start-screen');
        isActive = false;
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
    document.querySelector('.play-again-btn').addEventListener('click', resetGame);
    document.querySelector('.play-again-btn-over').addEventListener('click', resetGame);
    document.querySelector('.menu-btn').addEventListener('click', () => {
        showScreen('start-screen');
        toggleModal(false, 'saveUser');
        toggleModal(false, 'overlay');
        isActive = false;
    });
    document.querySelector('.menu-btn-over').addEventListener('click', () => {
        showScreen('start-screen');
        toggleModal(false, 'gameOver');
        toggleModal(false, 'overlay');
        isActive = false;
    });
    document.querySelector('.save-btn').addEventListener('click', async () => {
        const playerName = document.getElementById('player-name').value.trim();
        const score = gameState.score;
        if (!playerName) {
            alert('Por favor, ingresa un nombre.');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score })
            });
            if (response.ok) {
                const leaderboard = await response.json();
                updateLeaderboard(leaderboard);
                toggleModal(false, 'saveUser');
                toggleModal(true, 'gameOver');
            } else {
                console.error('Error al guardar el puntaje.');
            }
        } catch (error) {
            console.error('Error al guardar el puntaje:', error);
        }
    });
    document.querySelectorAll('.instructions-btn, .help-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleModal(true);
            document.querySelector('.instrucciones-modal').focus();
        });
    });

    // Leaderboard desde el menú principal
    document.querySelector('.leaderboard-btn').addEventListener('click', async () => {
        await loadMainLeaderboard();
        showScreen('leaderboard-screen');
        isActive = false;
    });
    // Volver al menú principal desde leaderboard
    document.querySelector('.back-to-menu-btn').addEventListener('click', () => {
        showScreen('start-screen');
        isActive = false;
    });

    // Cargar leaderboard principal
    async function loadMainLeaderboard() {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'GET'
            });
            const leaderboard = await response.json();
            updateLeaderboard(leaderboard, 'main-leaderboard-rows');
        } catch (error) {
            console.error('Error al cargar el leaderboard:', error);
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
});

