class Model {
    constructor() {
      this.state = {
        currentView: 'start-screen',
        history: []
      };
    }
  
    navigateTo(view) {
      this.state.history.push(this.state.currentView);
      this.state.currentView = view;
      window.history.pushState({ view }, '', `#${view}`);
      console.log(`Navegando a: ${view}`);
    }
  
    goBack() {
      if (this.state.history.length > 0) {
        const previousView = this.state.history.pop();
        this.state.currentView = previousView;
        window.history.back();
        console.log(`Volviendo a: ${previousView}`);
      }
    }
  }
  