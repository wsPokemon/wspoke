class View {
    constructor() {
      // Selecciona todas las secciones (vistas)
      this.sections = document.querySelectorAll('.view-section');
      // Modal de instrucciones (usando la clase .instructions-modal)
      this.instructionsModal = document.querySelector('.instructions-modal');
      // Modal de desarrollo (usando la clase .dev-modal)
      this.devModal = document.querySelector('.dev-modal');
    }
  
    showView(viewName) {
      this.sections.forEach(section => section.classList.remove('active-view'));
      const targetView = document.querySelector(`.${viewName}`);
      if (targetView) {
        targetView.classList.add('active-view');
        console.log(`Mostrando vista: ${viewName}`);
      } else {
        console.error(`No se encontró la vista: ${viewName}`);
      }
    }
  
    toggleInstructionsModal(show) {
      if (this.instructionsModal) {
        this.instructionsModal.style.display = show ? 'flex' : 'none';
        console.log("Modal de instrucciones", show ? "abierto" : "cerrado");
      }
    }
  
    toggleDevModal(show) {
      if (this.devModal) {
        this.devModal.style.display = show ? 'flex' : 'none';
        console.log("Modal de desarrollo", show ? "abierto" : "cerrado");
      }
    }
  
    bindNavigation(handler) {
      window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
          handler(event.state.view);
        }
      });
    }
  }
