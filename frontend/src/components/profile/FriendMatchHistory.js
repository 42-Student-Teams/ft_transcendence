import Component from "../../library/component.js";

export default class FriendMatchHistory extends Component {
    constructor() {
        super({ element: null });
        this.friendUsername = null;
        this.matches = [];
    }

    setUsername(username) {
        this.friendUsername = username;
        this.fetchMatchData();
    }

    async fetchMatchData() {
        if (!this.friendUsername) {
            console.error("Friend username not set");
            return;
        }

        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/history_getGames?username=${this.friendUsername}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.matches = data.historique || [];
                this.render();
            } else {
                console.error('Failed to fetch match history');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    render() {
        this.element = document.getElementById('friendMatchHistory');
        if (!this.element) {
            console.error("Element 'friendMatchHistory' not found");
            return;
        }

        const view = /*html*/ `
        <div class="card p-3 flex-grow-1 d-flex flex-column">
            <div class="card-content flex-grow-1 d-flex flex-column">
                <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                    <div class="my-1"></div>
                    ${this.matches.map(match => this.createMatch(match)).join('<div class="border-top my-3"></div>')}
                    <div class="my-1"></div>
                </div>
            </div>
        </div>
        `;
        this.element.innerHTML = view;
    }

    createMatch(match) {
        const result = match.gagnant_username === this.friendUsername ? "Victory" : "Defeat";
        const score = `${match.score_joueur1}-${match.score_joueur2}`;
        const date = new Date(match.date_partie).toLocaleString();

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