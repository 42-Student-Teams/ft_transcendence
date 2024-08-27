import Component from "../library/component.js";
import NavBar from '../components/home/navbar.js';
import FriendMatchHistory from "../components/profile/FriendMatchHistory.js";
import FriendProfileInfo from "../components/profile/FriendProfileInfo.js";
import { profile } from "../utils/langPack.js";
import store from "../store/index.js";

export default class FriendProfile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.friendUsername = null;
        this.currentLang = store.state.language;
        this.components = {
            navBar: new NavBar(),
			friendProfileInfo: null,
            friendMatchHistory: null,
        };

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
            console.error(langPack.friendUsernameNotSet);
            return;
        }

		const friendData = await this.fetchFriendData();

		if (!friendData) {
            this.element.innerHTML = `<p>${langPack.errorLoadingFriendProfile}</p>`;
            return;
        }


        const view = /*html*/ `
            <div class="h-100 d-flex flex-column bg-custom vh-100">
                <div class="row m-0">
                    <nav class="navbar navbar-expand bg-white shadow-sm w-100 mb-0" id="navBar"></nav>
                </div>
                <div class="container-fluid p-0 row flex-fill overflow-hidden m-0">
                    <div class="col-md-4 d-flex flex-column overflow-auto p-0">
                        <div id="friendProfileInfo" class="m-4"></div>
                    </div>
                    <div class="col-md-8 d-flex flex-column overflow-auto p-0">
                        <div id="friendMatchHistory" class="flex-grow-1 d-flex flex-column mt-4 me-4 mb-4"></div>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
        this.components.navBar.render();

        this.components.friendProfileInfo = new FriendProfileInfo();
        this.components.friendMatchHistory = new FriendMatchHistory();

        // Pass the data to the components
        this.components.friendProfileInfo.setFriendData(friendData);
        this.components.friendMatchHistory.setMatchHistory(friendData.historique);
    }

	async fetchFriendData() {
        if (!this.friendUsername) {
            console.error("Friend username not set");
            return null;
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
            return data;
        } catch (error) {
            console.error("Error fetching friend profile:", error);
            return null;
        }
    }
}