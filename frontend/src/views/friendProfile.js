import Component from "../library/component.js";
import NavBar from '../components/home/navbar.js';
import FriendProfileInfo from "../components/profile/FriendProfileInfo.js";
import FriendMatchHistory from "../components/profile/FriendMatchHistory.js";

export default class FriendProfile extends Component {
    constructor() {
        super({ element: document.createElement('app') });
        this.friendUsername = null;
        this.components = {
            navBar: new NavBar(),
            friendProfileInfo: new FriendProfileInfo(),
            friendMatchHistory: new FriendMatchHistory(),
        };
    }

    setFriendUsername(username) {
        console.log("FriendProfile: Setting friend username:", username);
        this.friendUsername = username;
        this.render();
    }

    render() {
        console.log("FriendProfile: Rendering with username:", this.friendUsername);
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
        
        // Rendre la barre de navigation
        this.components.navBar.render();

        // Définir le nom d'utilisateur et rendre FriendProfileInfo
        this.components.friendProfileInfo.setFriendUsername(this.friendUsername);
        
        // Définir le nom d'utilisateur et rendre FriendMatchHistory
        this.components.friendMatchHistory.setUsername(this.friendUsername);
    }
}