class View {
    constructor() {
        this.sections = document.querySelectorAll('.view-section');
        this.modal = document.querySelector('.modal-overlay');
    }

    showView(viewName) {
        this.sections.forEach(section => {
            section.classList.toggle('active-view', section.classList.contains(viewName));
        });
    }

    toggleModal(show) {
        this.modal.style.display = show ? 'flex' : 'none';
    }

    bindNavigation(handler) {
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                handler(event.state.view);
            }
        });
    }
}