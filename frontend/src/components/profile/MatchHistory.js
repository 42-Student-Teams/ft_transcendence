import Component from "../../library/component.js";

export default class MatchHistory extends Component {
    constructor() {
        super({ element: document.getElementById("matchHistory") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card p-3 flex-grow-1 d-flex flex-column">
                <div class="card-content flex-grow-1 d-flex flex-column">
                    <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                        ${this.getMatchCard('Victory', '100-43')}
                        <div class="divider my-1"></div>
                        ${this.getMatchCard('Victory', '19-13')}
                        <div class="divider my-1"></div>
                        ${this.getMatchCard('Defeat', '9-13')}
                        <div class="divider my-1"></div>
                        ${this.getMatchCard('Victory', '13-2')}
                        <div class="divider my-1"></div>
                        ${this.getMatchCard('Defeat', '8-14')}
                    </div>
                </div>
            </div>
        `;

        this.element.innerHTML = view;
    }

    getMatchCard(result, score) {
        return `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex flex-column align-items-start">
                    <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid mb-1">
                    <small class="text-muted">01/01/2023 10:00 AM</small>
                </div>
                <div class="text-center">
                    <h6 class="mb-0">${result}</h6>
                    <p class="mb-0">${score}</p>
                </div>
                <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid ml-2">
            </div>
        `;
    }
}
