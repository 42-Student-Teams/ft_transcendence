import Component from "../../library/component.js";
import { showToast } from "../../utils/toastUtils.js";

export default class MatchHistory extends Component {
    constructor() {
        super({ element: document.getElementById("matchHistory") });
        this.matchHistory = []; // Initialize as an empty array
        this.render();
    }

    async render() {
        // Fetch match history data from backend
        await this.fetchMatchHistory();

        const view = /*html*/ `
        <div class="card p-3 flex-grow-1 d-flex flex-column">
            <div class="card-content flex-grow-1 d-flex flex-column">
                <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                    <div class="my-1"></div>

                    ${this.matchHistory.map(match => this.createMatch(match.result, match.score, match.date)).join('')}
                    
                    <div class="my-1"></div>
                </div>
            </div>
        </div>
        `;
        this.element = document.getElementById("matchHistory");
        this.element.innerHTML = view;
    }
    async createMatch(result, score, date) {
        const resultClass = result === "Victory" ? "text-success" : "text-danger";
        return `
        <div class="d-flex justify-content-between align-items-center my-3">
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-1">
            </div>
            <div class="text-center">
                <h6 class="mb-0 ${resultClass}">${result}</h6>
                <p class="mb-0">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded-circle">
        </div>
        `;
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
                this.matchHistory = data.games || [];
            } else {
                showToast('Failed to fetch match history', 'danger');
                console.error('Failed to fetch match history');
            }
        } catch (error) {
            showToast('Error fetching match history', 'danger');
            console.error('Error fetching match history:', error);
        }
    }
}
