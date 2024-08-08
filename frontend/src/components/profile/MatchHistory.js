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
                    <div class="my-1"></div>

                    ${this.createMatch("Victory", "9-4", "01/01/2023 10:00 AM")}
                    <div class="border-top my-3"></div>
                    ${this.createMatch("Victory", "7-3", "02/01/2023 11:00 AM")}
                    <div class="border-top my-3"></div>
                    ${this.createMatch("Defeat", "5-7", "03/01/2023 12:00 PM")}
                    <div class="border-top my-3"></div>
                    ${this.createMatch("Victory", "8-2", "04/01/2023 01:00 PM")}
                    <div class="border-top my-3"></div>
                    ${this.createMatch("Defeat", "4-6", "05/01/2023 02:00 PM")}

                    <div class="my-1"></div>
                </div>
            </div>
        </div>
        `;
        this.element = document.getElementById('matchHistory');
        this.element.innerHTML = view;
    }

    createMatch(result, score, date) {
        return `
        <div class="d-flex justify-content-between align-items-center my-3">
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-1">
            </div>
            <div class="text-center">
                <h6 class="mb-0">${result}</h6>
                <p class="mb-0">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded-circle">
        </div>
        `;
    }
}
