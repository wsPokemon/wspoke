document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        start: document.querySelector('.start-screen'),
        game: document.querySelector('.game-screen')
    };

    const modal = {
        overlay: document.querySelector('.modal-overlay'),
        gameOver: document.querySelector('.game-over-modal'),
        closeButtons: document.querySelectorAll('.close-modal')
    };

    const gameState = {
        score: 0,
        timeLeft: 180, // 3 minutos en segundos
        currentWord: '',
        usedWords: new Set(),
        timer: null,
        selectedCells: []
    };

    function formatWord(entered_Pokemon) {
        return entered_Pokemon.charAt(0).toUpperCase() + entered_Pokemon.slice(1).toLowerCase();
    }

    
    // Control de pantallas
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        document.querySelector(`.${screenName}`).classList.add('active');
    }

    // Control del modal
    function toggleModal(show, modalType = 'default') {
        if (modalType === 'gameOver') {
            modal.gameOver.style.display = show ? 'flex' : 'none';
        } else {
            modal.overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Inicializar el juego
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

    // Seleccionar letra
    function selectLetter(cell) {
        if (cell.classList.contains('selected')) return;
        
        cell.classList.add('selected')
        gameState.currentWord += cell.textContent;
        gameState.selectedCells.push(cell);
        
        const preview = document.querySelector('.word-preview');
        preview.textContent = gameState.currentWord;
    }

    // Reiniciar palabra actual
    function resetWord() {
        gameState.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
        });
        gameState.selectedCells = [];
        gameState.currentWord = '';
        document.querySelector('.word-preview').textContent = '';
    }
    // Validar palabra
    async function validateWord() {
        gameState.currentWord = formatWord(gameState.currentWord)

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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: gameState.currentWord})
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

    // Agregar palabra a la lista
    function addWordToList(pokemon) {
        const wordsList = document.querySelector('.words-list');
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        
        const types = [
            { name: pokemon.tipo_P, icon: `.././assets/poke_icons/type_${pokemon.tipo_P.toLowerCase()}.webp` },
            pokemon.tipo_S && { name: pokemon.tipo_S, icon: `../assets/poke_icons/type_${pokemon.tipo_S.toLowerCase()}.webp` }
        ].filter(Boolean); // Elimina elementos falsy (como tipo_S si no existe)
        
        wordItem.innerHTML = `
            <div class="pokemon-image">
                <img src="poke_icons/${pokemon.name}_icon.webp" alt="${pokemon.name}">
            </div>
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-types">
                ${types.map(type => `
                    <div class="type-container">
                        <img src="poke_type/type_${type.name}.webp" class="type-icon">
                        <span>${type.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        wordsList.insertBefore(wordItem, wordsList.firstChild);
    }

    // Mostrar mensaje de validación
    function showValidationMessage(message, isValid) {
        const validationMessage = document.querySelector('.validation-message');
        validationMessage.textContent = message;
        validationMessage.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
        
        setTimeout(() => {
            validationMessage.textContent = '';
            validationMessage.className = 'validation-message';
        }, 2000);
    }

    // Timer
    function startTimer() {
        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            const minutes = Math.floor(gameState.timeLeft / 60);
            const seconds = gameState.timeLeft % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // Finalizar juego
    function endGame() {
        clearInterval(gameState.timer);
        document.getElementById('final-score').textContent = gameState.score;
        toggleModal(true, 'gameOver');
    }

    // Mezclar letras
    async function shuffleLetters() {

        try {
            const response = await fetch('http://localhost:3000/api/shuffle', {
                method: 'POST'
            });
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

    // Reiniciar juego
    async function resetGame() {
        try {
            await fetch('http://localhost:3000/api/reset', {
                method: 'POST'
            });
            
            gameState.score = 0;
            gameState.timeLeft = 180;
            gameState.currentWord = '';
            gameState.usedWords.clear();
            gameState.selectedCells = [];
            document.getElementById('score').textContent = '0';
            document.getElementById('timer').textContent = '03:00';
            document.querySelector('.word-preview').textContent = '';
            document.querySelector('.words-list').innerHTML = '';
            toggleModal(false, 'gameOver');
            
            await initGame();
        } catch (error) {
            console.error('Error al reiniciar el juego:', error);
        }
    }

    // Event Listeners
    document.querySelector('.play-btn').addEventListener('click', () => {
        resetGame();
        showScreen('game-screen');
    });

    document.querySelector('.back-btn').addEventListener('click', () => {
        clearInterval(gameState.timer);
        showScreen('start-screen');
    });

    document.querySelector('.reset-word-btn').addEventListener('click', resetWord);
    document.querySelector('.submit-word-btn').addEventListener('click', validateWord);
    document.querySelector('.shuffle-btn').addEventListener('click', shuffleLetters);

    // Keyboard shortcuts (R: Reiniciar palabra, E: Validar palabra) descomentar para habilitar
    // document.addEventListener('keypress', function (e) {
    //         if (document.getElementsByClassName('.game-screen') && e.key === 'r') {
    //             shuffleLetters();
    //         }
    //         if (document.getElementsByClassName('.game-screen') && e.key === 'e') {
    //             validateWord();
    //         }
    // });
    

    document.querySelector('.play-again-btn').addEventListener('click', () => {
        resetGame();
    });

    document.querySelector('.menu-btn').addEventListener('click', () => {
        resetGame();
        showScreen('start-screen');
    });

    document.querySelectorAll('.instructions-btn, .help-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleModal(true));
    });

    modal.closeButtons.forEach(btn => {
        btn.addEventListener('click', () => toggleModal(false));
    });

    modal.overlay.addEventListener('click', (e) => {
        if (e.target === modal.overlay) toggleModal(false);
    });

    modal.gameOver.addEventListener('click', (e) => {
        if (e.target === modal.gameOver) toggleModal(false, 'gameOver');
    });
});