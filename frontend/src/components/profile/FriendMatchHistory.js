// /src/components/profile/FriendMatchHistory.js
import Component from "../../library/component.js";

export default class FriendMatchHistory extends Component {
    constructor() {
        super({ element: document.getElementById("friendMatchHistory") });
        this.friendUsername = null;
    }

    setFriendUsername(username) {
        this.friendUsername = username;
        this.render();
    }

    async render() {
        if (!this.friendUsername) {
            console.error("Friend username not set");
            return;
        }

        try {
            const jwt = localStorage.getItem("jwt");
            const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/history_getGames`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch game history');
            }

            const data = await response.json();

            const friendGames = data.historique.filter(game => 
                game.joueur1_username === this.friendUsername || game.joueur2_username === this.friendUsername
            );

            const gamesHtml = friendGames.map(game => this.createMatch(game)).join('');

            const view = /*html*/ `
            <div class="card p-3 flex-grow-1 d-flex flex-column">
                <div class="card-content flex-grow-1 d-flex flex-column">
                    <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                        <div class="my-1"></div>
                        ${gamesHtml}
                        <div class="my-1"></div>
                    </div>
                </div>
            </div>
            `;

            this.element.innerHTML = view;
        } catch (error) {
            console.error("Error fetching friend match history:", error);
            this.element.innerHTML = "<p>Error loading friend match history</p>";
        }
    }

    createMatch(game) {
        const isFriendWinner = game.gagnant_username === this.friendUsername;
        const result = isFriendWinner ? "Victory" : "Defeat";
        const score = `${game.score_joueur1}-${game.score_joueur2}`;
        return `
        <div class="d-flex justify-content-between align-items-center my-3">
            <div class="d-flex flex-column align-items-center">
                <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded-circle mb-1">
            </div>
            <div class="text-center">
                <h6 class="mb-0">${result}</h6>
                <p class="mb-0">${score}</p>
                <small class="text-muted">${new Date(game.date_partie).toLocaleString()}</small>
            </div>
            <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded-circle">
        </div>
        <div class="border-top my-3"></div>
        `;
    }
}