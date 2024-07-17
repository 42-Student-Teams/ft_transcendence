import Component from "../library/component.js";
import MatchHistory from "../components/profile/MatchHistory.js";
import ProfileInfo from "../components/profile/ProfileInfo.js";
import ChartComponent from "../components/profile/Chart.js";
import Statistics from "../components/profile/Statistics.js";
import NavBar from '../components/home/navbar.js';

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        this.render();
        this.initializeComponents();
    }

    async render() {
        const view = /*html*/ `
        <div class="h-100 d-flex flex-column bg-custom vh-100">
            <div class="row chat-rm-margin">
                <nav class="navbar navbar-expand pl-4 bg-white shadow-sm w-100" id="navBar"></nav>
            </div>
            <div class="container-fluid p-2 row flex-fill overflow-hidden">
                <div class="col-md-4 d-flex flex-column overflow-auto px-2">
                    <div id="profileInfo" class="mb-2"></div>
                    <div id="chart" class="flex-grow-1 d-flex flex-column"></div>
                </div>
                <div class="col-md-8 d-flex flex-column overflow-auto px-2">
                    <div id="statistics" class="mb-2"></div>
                    <div id="matchHistory" class="flex-grow-1 d-flex flex-column"></div>
                </div>
            </div>
        </div>

        <!-- Modal Edit Profile -->
        <div class="modal" id="edit-profile-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <form id="edit-profile-form">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Profile</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="p-3">
                                <label for="edit-profile-picture" class="form-label">Profile Picture</label>
                                <input type="file" class="form-control" id="edit-profile-picture">
                            </div>
                            <div class="p-3">
                                <label for="edit-first-name" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="edit-first-name" required>
                            </div>
                            <div class="p-3">
                                <label for="edit-last-name" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="edit-last-name" required>
                            </div>
                            <div class="p-3">
                                <label for="edit-username" class="form-label">Username</label>
                                <input type="text" class="form-control" id="edit-username" required>
                            </div>
                            <div class="p-3">
                                <label for="edit-email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="edit-email" required>
                            </div>
                            <div class="p-3">
                                <label for="edit-password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="edit-password">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">Save changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }

    initializeComponents() {
        new NavBar();
        new ProfileInfo();
        new ChartComponent();
        new Statistics();
        new MatchHistory();

        this.handleEvent();
    }

    handleEvent() {
        document.getElementById("edit-profile-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const profilePicture = document.getElementById("edit-profile-picture").files[0];
            const firstName = document.getElementById("edit-first-name").value;
            const lastName = document.getElementById("edit-last-name").value;
            const username = document.getElementById("edit-username").value;
            const email = document.getElementById("edit-email").value;
            const password = document.getElementById("edit-password").value;

            // valeurs stockées ici
            const profileData = {
                profilePicture,
                firstName,
                lastName,
                username,
                email,
                password
            };

            console.log(profileData);

            // backend pour sauvegarder les modifications
        });
    }
}
