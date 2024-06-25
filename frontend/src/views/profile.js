import Component from "../library/component.js";
import ProfileHeader from '../components/profile/ProfileHeader.js';
import GameHistory from '../components/profile/GameHistory.js';
import PersonalInfoCard from '../components/profile/PersonalInfoCard.js';
import PlayerStatsCard from '../components/profile/PlayerStatsCard.js';

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.render();
        this.components = {
            profileHeader: new ProfileHeader(),
            gameHistory: new GameHistory(),
            personalInfoCard: new PersonalInfoCard(),
            playerStatsCard: new PlayerStatsCard()
        };
    }

    async render() {
        const view = /*html*/ `
            <div class="container-fluid mt-3 bottom-spacing">
                <div class="profile-title">
                    <span class="back-arrow" onclick="goBack()">&larr;</span>
                    <h4>PLAYER PROFILE</h4>
                </div>
                <div class="row flex-grow-1">
                    <div class="col-lg-4 d-flex flex-column">
                        <div id="profileHeader" class="mb-3"></div>
                        <div id="playerStatsCard" class="mb-3"></div>
                        <div class="same-height">
                            <div id="personalInfoCard" class="flex-item"></div>
                        </div>
                    </div>
                    <div class="col-lg-8 d-flex flex-column">
                        <div class="same-height">
                            <div id="gameHistory" class="flex-item"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}
