import Component from "../../library/component.js";

export default class PlayerStatsCard extends Component {
    constructor() {
        super({ element: document.getElementById("playerStatsCard") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="custom-card mb-4">
                <div class="card-body">
                    <div class="info-row">
                        <span class="info-title">Wins:</span>
                        <span class="info-value">1</span>
                    </div>
                    <div class="info-row">
                        <span class="info-title">Loses:</span>
                        <span class="info-value">0</span>
                    </div>
                    <div class="info-row">
                        <span class="info-title">Win rate:</span>
                        <span class="info-value">75%</span>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}
