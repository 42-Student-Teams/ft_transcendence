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
            <div class="card p-2 m-0">
                <div class="card-body p-2 m-0">
                    <h5 class="card-title text-center mt-3 mb-4">Match History</h5>
                    <div id="match-list-display" class="mt-3"></div>
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
                console.log('Received match history data:', data);
                
                this.matchHistory = data.historique.slice(0, 5);

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

    async renderMatchHistory() {
        const matchDisplayElement = document.getElementById("match-list-display");
        matchDisplayElement.innerHTML = ''; // Clear any existing content

        if (this.matchHistory.length > 0) {
            this.matchHistory.forEach((match, index) => {
                const isLastMatch = index === this.matchHistory.length - 1;
                const matchHtml = this.createMatch(match, isLastMatch);
                matchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);
            });
        } else {
            matchDisplayElement.innerHTML = '<p class="text-center">The court is empty... for now. How about playing your first game?</p>';
        }
    }

    createMatch(match, isLastMatch) {
        const result = match.gagnant_username === match.joueur1_username ? "Victory" : "Defeat";
        const resultClass = result === "Victory" ? "text-success" : "text-danger";
        const score = `${match.score_joueur1} - ${match.score_joueur2}`;
        const date = new Date(match.date_partie).toLocaleString(); // Format the date

        return `
        <div class="d-flex justify-content-between align-items-center py-3 ${!isLastMatch ? 'border-bottom' : ''}">
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-2">
                <small class="text-muted text-truncate text-center" >${match.joueur1_username}</small>
            </div>
            <div class="text-center">
                <span class="${resultClass} d-block mb-1">${result}</span>
                <p class="mb-1">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-2">
                <small class="text-muted text-truncate text-center" ">${match.joueur2_username}</small>
            </div>
        </div>
        `;
    }
}
