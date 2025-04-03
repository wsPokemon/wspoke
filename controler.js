class Controller {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.initialize();
    }
  
    initialize() {
      console.log("Inicializando la aplicación");
      this.view.showView(this.model.state.currentView);
      this.setupEventListeners();
      this.view.bindNavigation((view) => this.handleNavigation(view));
    }
  
    setupEventListeners() {
      const playBtn = document.querySelector('.play-btn');
      const instructionsBtn = document.querySelector('.instructions-btn');
      const backBtn = document.querySelector('.back-btn');
      const closeModalBtn = document.querySelector('.close-modal-btn');
      const instructionsOverlay = document.querySelector('.instructions-modal');
      const closeDevModalBtn = document.querySelector('.close-dev-modal-btn');
      const devModalOverlay = document.querySelector('.dev-modal');
  
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          console.log("Botón Jugar Ahora clickeado");
          this.handlePlay();
        });
      } else {
        console.error("No se encontró el botón 'Jugar Ahora'");
      }
  
      if (instructionsBtn) {
        instructionsBtn.addEventListener('click', () => {
          console.log("Botón Ver Instrucciones clickeado");
          this.view.toggleInstructionsModal(true);
        });
      } else {
        console.error("No se encontró el botón 'Ver Instrucciones'");
      }
  
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          console.log("Botón Volver al Inicio clickeado");
          this.handleBack();
        });
      } else {
        console.error("No se encontró el botón 'Volver al Inicio'");
      }
  
      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
          console.log("Cerrando modal de instrucciones");
          this.view.toggleInstructionsModal(false);
        });
      } else {
        console.error("No se encontró el botón para cerrar el modal de instrucciones");
      }
  
      if (instructionsOverlay) {
        instructionsOverlay.addEventListener('click', (e) => {
          if (e.target === instructionsOverlay) {
            console.log("Clic fuera del modal de instrucciones");
            this.view.toggleInstructionsModal(false);
          }
        });
      }
  
      if (closeDevModalBtn) {
        closeDevModalBtn.addEventListener('click', () => {
          console.log("Cerrando modal de desarrollo");
          this.view.toggleDevModal(false);
        });
      } else {
        console.error("No se encontró el botón para cerrar el modal de desarrollo");
      }
  
      if (devModalOverlay) {
        devModalOverlay.addEventListener('click', (e) => {
          if (e.target === devModalOverlay) {
            console.log("Clic fuera del modal de desarrollo");
            this.view.toggleDevModal(false);
          }
        });
      }
    }
  
    handlePlay() {
      this.model.navigateTo('game-container');
      this.view.showView('game-container');
      this.view.toggleDevModal(true);
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
  
  document.addEventListener('DOMContentLoaded', () => {
    new Controller(new Model(), new View());
  });
  