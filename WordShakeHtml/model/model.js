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
        window.history.pushState({ view }, '');
    }

    goBack() {
        const previousView = this.state.history.pop();
        if (previousView) {
            this.state.currentView = previousView;
            window.history.back();
        }
    }
}