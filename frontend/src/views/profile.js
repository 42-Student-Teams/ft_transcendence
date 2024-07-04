import Component from "../library/component.js";
import MatchHistory from "../components/profile/MatchHistory.js";
import ProfileInfo from "../components/profile/ProfileInfo.js";
import ChartComponent from "../components/profile/Chart.js";
import Statistics from "../components/profile/Statistics.js";

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        this.render();
        this.initializeComponents();
    }

    async render() {
        // dans  <div class="container-fluid d-flex flex-column min-vh-100" style="min-height: 100vh;">
        const view = /*html*/ `
        <div class="container-fluid d-flex flex-column min-vh-100" >
        <div class="row flex-fill">
                <div class="col-md-4 d-flex flex-column">
                    <div id="profileInfo"></div>
                    <div id="chart" class="flex-grow-1 d-flex flex-column"></div>
                </div>
                <div class="col-md-8 d-flex flex-column">
                    <div id="statistics"></div>
                    <div id="matchHistory" class="flex-grow-1 d-flex flex-column"></div>
                </div>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }

    initializeComponents() {
        new ProfileInfo();
        new ChartComponent();
        new Statistics();
        new MatchHistory();
    }
}
