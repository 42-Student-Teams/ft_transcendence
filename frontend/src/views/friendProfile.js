// /src/views/friendProfile.js
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

        // Initialiser les composants après que les éléments sont créés dans le DOM
        this.components.friendProfileInfo = new FriendProfileInfo();
        this.components.friendMatchHistory = new FriendMatchHistory();
        this.components.friendProfileInfo.setFriendUsername(this.friendUsername);
        this.components.friendMatchHistory.setFriendUsername(this.friendUsername);
    }
}