class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.initialize();
    }

    initialize() {
        // Mostrar vista inicial
        this.view.showView(this.model.state.currentView);
        
        // Bindear eventos
        document.querySelector('.play-btn').addEventListener('click', () => this.handlePlay());
        document.querySelector('.instructions-btn').addEventListener('click', () => this.view.toggleModal(true));
        document.querySelector('.back-btn').addEventListener('click', () => this.handleBack());
        document.querySelector('.close-modal-btn').addEventListener('click', () => this.view.toggleModal(false));
        document.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.querySelector('.modal-overlay')) this.view.toggleModal(false);
        });
        
        // Manejar navegación del navegador
        this.view.bindNavigation((view) => this.handleNavigation(view));
    }

    handlePlay() {
        this.model.navigateTo('game-container');
        this.view.showView('game-container');
    }

    handleBack() {
        this.model.goBack();
        this.view.showView(this.model.state.currentView);
    }

    handleNavigation(view) {
        this.model.state.currentView = view;
        this.view.showView(view);
    }
}

// Inicializar la aplicación
const app = new Controller(new Model(), new View());