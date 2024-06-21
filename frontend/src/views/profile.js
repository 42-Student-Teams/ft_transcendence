import Component from "../../library/component.js";
import ProfileHeader from './ProfileHeader.js';
import GameHistory from './GameHistory.js';
import PersonalInfoCard from './PersonalInfoCard.js';

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.render();
        this.components = {
            profileHeader: new ProfileHeader(),
            gameHistory: new GameHistory(),
            personalInfoCard: new PersonalInfoCard()
        };
    }

    async render() {
        const view = /*html*/ `
            <div class="container-fluid mt-3 bottom-spacing">
                <div class="profile-title">
                    <span class="back-arrow" onclick="goBack()">&larr;</span>
                    <h4>PLAYER PROFILE</h4>
                </div>
                <div class="row">
                    <div class="col-lg-4">
                        <div id="profileHeader"></div>
                        <div id="personalInfoCard"></div>
                    </div>
                    <div class="col-lg-8">
                        <div id="gameHistory"></div>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}