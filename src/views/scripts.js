document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        start: document.querySelector('.start-screen'),
        game: document.querySelector('.game-screen')
    };

    const modal = {
        overlay: document.querySelector('.modal-overlay'),
        closeButtons: document.querySelectorAll('.close-modal')
    };

    // Control de pantallas
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        document.querySelector(`.${screenName}`).classList.add('active');
    }

    // Control del modal
    function toggleModal(show) {
        modal.overlay.style.display = show ? 'flex' : 'none';
    }

    // Event Listeners
    document.querySelector('.play-btn').addEventListener('click', () => {
        showScreen('game-screen');
    });

    document.querySelector('.back-btn').addEventListener('click', () => {
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

    // Inicialización del juego
    const letters = ['C','O','L','M','B','I','A','M','E','X','I','C','O','A','R','G'];
    const grid = document.querySelector('.game-grid');
    
    letters.forEach(letter => {
        const cell = document.createElement('div');
        cell.className = 'letter-cell';
        cell.textContent = letter;
        grid.appendChild(cell);
    });
});