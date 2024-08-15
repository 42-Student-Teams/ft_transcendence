import Component from "../../library/component.js";
import { showToast } from "../../utils/toastUtils.js";

export default class MatchHistory extends Component {
    constructor() {
        super({ element: document.getElementById("matchHistory") });
        this.matchHistory = []; // Initialize matchHistory as an empty array
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card p-3 flex-grow-1 d-flex flex-column">
                <div class="card-content flex-grow-1 d-flex flex-column">
                    <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                        <div class="my-1"></div>
                        <div id="match-list-display" class="flex-grow-1"></div>
                        <div class="my-1"></div>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;

        // Fetch and display the match history
        await this.fetchMatchHistory();
    }

    async fetchMatchHistory() {
        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/history_getGames`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.matchHistory = data.historique || [];
                this.renderMatchHistory(); // Render the match history after fetching data
            } else {
                console.error('Failed to fetch match history');
                showToast('Failed to fetch match history', 'danger');
            }
        } catch (error) {
            console.error('Error fetching match history:', error);
            showToast('Error fetching match history', 'danger');
        }
    }

    renderMatchHistory() {
        const matchDisplayElement = document.getElementById("match-list-display");
        matchDisplayElement.innerHTML = ''; // Clear any existing content

        if (this.matchHistory.length > 0) {
            this.matchHistory.forEach((match) => {
                const matchHtml = this.createMatch(match);
                matchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);
            });
        } else {
            matchDisplayElement.innerHTML = '<p>No match history found.</p>';
        }
    }

    createMatch(match) {
        const result = match.gagnant_username === match.joueur1_username ? "Victory" : "Defeat";
        const resultClass = result === "Victory" ? "text-success" : "text-danger";
        const score = `${match.score_joueur1} - ${match.score_joueur2}`;
        const date = new Date(match.date_partie).toLocaleString(); // Format the date

        return `
        <div class="d-flex justify-content-between align-items-center my-3">
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-1">
                <small class="text-muted">${match.joueur1_username}</small>
            </div>
            <div class="text-center">
                <h6 class="mb-0 ${resultClass}">${result}</h6>
                <p class="mb-0">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-1">
                <small class="text-muted">${match.joueur2_username}</small>
            </div>
        </div>
        `;
    }
}
