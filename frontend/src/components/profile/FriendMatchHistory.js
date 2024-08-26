import Component from "../../library/component.js";
import { profile } from "../../utils/langPack.js";
import store from "../../store/index.js";

export default class FriendMatchHistory extends Component {
	constructor() {
		super({ element: document.getElementById("friendMatchHistory") });
		this.matchHistory = [];
		this.currentLang = store.state.language;

		store.events.subscribe('stateChange', () => {
			if (this.currentLang !== store.state.language) {
				this.currentLang = store.state.language;
				this.updateElement();
				this.render();
			}
		});
	}

	updateElement() {
		this.element = document.getElementById("friendMatchHistory");
	}

	setMatchHistory(history) {
		this.matchHistory = history || [];
		this.render();
	}

	render() {
		this.updateElement(); // Ensure the element is up-to-date

		if (!this.element) {
			console.error("FriendMatchHistory element not found");
			return;
		}

		const langPack = profile[this.currentLang];

		const view = /*html*/ `
            <div class="card p-2 m-0">
                <div class="card-body p-2 m-0">
                    <h5 class="card-title text-center mt-3 mb-4">${langPack.matchHistory}</h5>
                    <div id="match-list-display" class="mt-3"></div>
                </div>
            </div>
        `;
		this.element.innerHTML = view;
		this.renderMatchHistory();
	}

	renderMatchHistory() {
		const matchDisplayElement = document.getElementById("match-list-display");

		if (!matchDisplayElement) {
			console.error("Match list display element not found");
			return;
		}

		const langPack = profile[this.currentLang];
		matchDisplayElement.innerHTML = '';

		if (this.matchHistory.length > 0) {
			this.matchHistory.forEach((match, index) => {
				const isLastMatch = index === this.matchHistory.length - 1;
				const matchHtml = this.createMatch(match, isLastMatch);
				matchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);
			});
		} else {
			matchDisplayElement.innerHTML = `<p class="text-center">${langPack.noMatchesPlayed}</p>`;
		}
	}

	createMatch(match, isLastMatch) {
		const langPack = profile[this.currentLang];
		const result = match.gagnant_username === match.joueur1_username ? langPack.victory : langPack.defeat;
		const resultClass = result === langPack.victory ? "text-success" : "text-danger";
		const score = `${match.score_joueur1} - ${match.score_joueur2}`;
		const date = new Date(match.date_partie).toLocaleString(this.currentLang);

		return `
        <div class="d-flex justify-content-between align-items-center py-3 ${!isLastMatch ? 'border-bottom' : ''}">
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="${match.joueur1_avatar}" alt="" class="rounded-circle mb-2 img-match-history">
                <small class="text-muted text-truncate text-center">${match.joueur1_username}</small>
            </div>
            <div class="text-center">
                <span class="${resultClass} d-block mb-1">${result}</span>
                <p class="mb-1">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="${match.joueur2_avatar}" alt="" class="rounded-circle mb-2 img-match-history">
                <small class="text-muted text-truncate text-center">${match.joueur2_username}</small>
            </div>
        </div>
        `;
	}
}
