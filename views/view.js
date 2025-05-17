// view.js
// Manipulación del DOM y renderizado visual para Wordshake

export const screens = {
    start: document.querySelector('.start-screen'),
    game: document.querySelector('.game-screen'),
    leaderboard: document.querySelector('.leaderboard-screen')
};

export const modal = {
    overlay: document.querySelector('.modal-overlay'),
    saveUser: document.querySelector('.save-points-modal'),
    gameOver: document.querySelector('.game-over-modal'),
    closeButtons: document.querySelectorAll('.close-modal')
};

export function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    document.querySelector(`.${screenName}`).classList.add('active');
}

export function toggleModal(show, modalType = 'default') {
    if (modalType === 'saveUser') {
        modal.saveUser.style.display = show ? 'flex' : 'none';
    } else if(modalType === 'gameOver') {
        modal.gameOver.style.display = show ? 'flex' : 'none';
    } else {
        modal.overlay.style.display = show ? 'flex' : 'none';
    }
}

export function addWordToList(pokemon) {
    const wordsList = document.querySelector('.words-list');
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    const types = [
        { name: pokemon.tipo_P, icon: `.././assets/poke_icons/type_${pokemon.tipo_P.toLowerCase()}.webp` },
        pokemon.tipo_S && { name: pokemon.tipo_S, icon: `../assets/poke_icons/type_${pokemon.tipo_S.toLowerCase()}.webp` }
    ].filter(Boolean);
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

export function showValidationMessage(message, isValid) {
    const validationMessage = document.querySelector('.validation-message');
    validationMessage.textContent = message;
    validationMessage.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
    setTimeout(() => {
        validationMessage.textContent = '';
        validationMessage.className = 'validation-message';
    }, 2000);
}

export function updateLeaderboard(leaderboard, elementId = 'leaderboard-rows') {
    const leaderboardRows = document.getElementById(elementId);
    leaderboardRows.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
        `;
        leaderboardRows.appendChild(row);
    });
}

