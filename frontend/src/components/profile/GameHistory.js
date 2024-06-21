import Component from "../../library/component.js";

export default class GameHistory extends Component {
    constructor() {
        super({ element: document.getElementById("gameHistory") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <h4 class="mt-4">Game History</h4>
            <div class="game-history mt-3">
                ${this.renderGameHistoryItems()}
            </div>
        `;
        this.element.innerHTML = view;
    }

    renderGameHistoryItems() {
        const games = [
            { player1: "Lamilton", player2: "Jack", result: "Victory", score: "5 - 3", player1Color: "#5aff92", player2Color: "#61e3f3" },
            // Add more games as needed
        ];

        return games.map(game => `
            <div class="game-history-item">
                <div class="player">
                    <div class="avatar" style="background-color: ${game.player1Color};"></div>
                    <div class="details">
                        <p class="username">${game.player1}</p>
                    </div>
                </div>
                <div class="result">
                    <p>${game.result}</p>
                    <p>${game.score}</p>
                </div>
                <div class="player">
                    <p class="username">${game.player2}</p>
                    <div class="avatar" style="background-color: ${game.player2Color};"></div>
                </div>
            </div>
        `).join('');
    }
}
