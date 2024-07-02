import Component from "../library/component.js";
import ProfileInfo from "../components/profile/ProfileInfo.js";
import ChartComponent from "../components/profile/chart.js";
import MatchHistory from "../components/profile/MatchHistory.js";

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="container-fluid py-2 d-flex flex-column">
                <div class="row flex-fill">
                    <div class="col-md-4 d-flex flex-column" id="profile-info"></div>
                    <div class="col-md-8 d-flex flex-column">
                        <div id="chart-container"></div>
                        <div id="match-history"></div>
                    </div>
                </div>
            </div>
        `;

        this.element.innerHTML = view;

        this.components = {
            profileInfo: new ProfileInfo(),
            chart: new ChartComponent(),
            matchHistory: new MatchHistory()
        };
    }
}
