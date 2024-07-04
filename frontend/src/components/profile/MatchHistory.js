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
                    ${this.createMatch("Victory", "100-43", "01/01/2023 10:00 AM")}
                    ${this.createMatch("Victory", "19-13", "01/01/2023 10:00 AM")}
                    ${this.createMatch("Defeat", "9-13", "01/01/2023 10:00 AM")}
                    ${this.createMatch("Victory", "13-2", "01/01/2023 10:00 AM")}
                    ${this.createMatch("Defeat", "8-14", "01/01/2023 10:00 AM", true)}
                </div>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }

    createMatch(result, score, date, isLast = false) {
        return `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid mb-1">
                <small class="text-muted">${date}</small>
            </div>
            <div class="text-center">
                <h6 class="mb-0">${result}</h6>
                <p class="mb-0">${score}</p>
            </div>
            <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid ml-2">
        </div>
        ${!isLast ? '<div class="divider my-1"></div>' : ''}
        `;
    }
}
