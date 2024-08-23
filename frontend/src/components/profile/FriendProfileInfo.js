import Component from "../../library/component.js";
import { profile } from "../../utils/langPack.js";
import store from "../../store/index.js";

export default class FriendProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("friendProfileInfo") });
        this.friendUsername = null;
        this.currentLang = store.state.language;

        store.events.subscribe('stateChange', () => {
            if (this.currentLang !== store.state.language) {
                this.currentLang = store.state.language;
                this.render();
            }
        });
    }

    setFriendUsername(username) {
        this.friendUsername = username;
        this.render();
    }

    async render() {
        const langPack = profile[this.currentLang];

        if (!this.friendUsername) {
            console.error("Friend username not set");
            return;
        }

        try {
            const jwt = localStorage.getItem("jwt");
            const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/get_friend_profile?username=${this.friendUsername}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch friend profile');
            }

            const data = await response.json();
            console.log("Friend Profile info data:", data);

            const view = /*html*/ `
                <div class="card shadow-sm rounded mb-4">
                    <div class="d-flex flex-column align-items-center p-4">
                        <img src="${data.avatar || 'https://via.placeholder.com/80'}" alt="${data.username}" class="img-profile-avatar rounded-circle mb-3">
                        <h5 class="mb-1">${data.prenom} ${data.nom}</h5>
                        <p class="text-muted mb-2">@${data.username}</p>
                        <p class="text-muted mb-2">${langPack.status}: ${langPack[data.status.toLowerCase()]}</p>
                        <div class="w-100 border-top mt-3 pt-3">
                            <div class="text-center">
                                <h6 class="mb-0">${langPack.wins}: ${data.parties_gagnees}</h6>
								<h6 class="mb-0">${langPack.losses}: ${data.parties_perdues}</h6>
                                <h6 class="text-muted mb-0">${langPack.totalGames}: ${data.parties_jouees}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.element.innerHTML = view;
        } catch (error) {
            console.error("Error fetching friend profile:", error);
            this.element.innerHTML = `<p>${langPack.errorLoadingFriendProfile}</p>`;
        }
    }
}