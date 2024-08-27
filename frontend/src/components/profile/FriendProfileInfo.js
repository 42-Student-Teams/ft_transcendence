import Component from "../../library/component.js";
import { profile } from "../../utils/langPack.js";
import store from "../../store/index.js";

export default class FriendProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("friendProfileInfo") });
        this.friendData = null;
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
        this.element = document.getElementById("friendProfileInfo");
    }

    setFriendData(data) {
        this.friendData = data;
        this.render();
    }

    render() {
        this.updateElement(); // Ensure the element is up-to-date

        if (!this.element) {
            console.error("FriendProfileInfo element not found");
            return;
        }

        const langPack = profile[this.currentLang];

        if (!this.friendData) {
            console.error("Friend data not set");
            return;
        }

        const view = /*html*/ `
            <div class="card shadow-sm rounded mb-4">
                <div class="d-flex flex-column align-items-center p-4">
                    <img src="${this.friendData.avatar || 'https://via.placeholder.com/80'}" alt="${this.friendData.username}" class="img-profile-avatar rounded-circle mb-3">
                    <h5 class="mb-1">${this.friendData.prenom} ${this.friendData.nom}</h5>
                    <p class="text-muted mb-2">@${this.friendData.username}</p>
                    <p class="text-muted mb-2">${langPack.status}: ${langPack[this.friendData.status.toLowerCase()]}</p>
                    <div class="w-100 border-top mt-3 pt-3">
                        <div class="text-center">
                            <h6 class="mb-0">${langPack.wins}: ${this.friendData.parties_gagnees}</h6>
                            <h6 class="mb-0">${langPack.losses}: ${this.friendData.parties_perdues}</h6>
                            <h6 class="text-muted mb-0">${langPack.totalGames}: ${this.friendData.parties_jouees}</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}
