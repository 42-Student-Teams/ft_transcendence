import * as bootstrap from 'bootstrap';
import NavBar from '../components/home/navbar.js';
import { showToast } from "../utils/toastUtils.js";
import MatchHistory from "../components/profile/MatchHistory.js";
import ProfileInfo from "../components/profile/ProfileInfo.js";

import Component from "../library/component.js";

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.render();

        this.components = {
            navBar: new NavBar(),
            profileInfo: new ProfileInfo(),
            matchHistory: new MatchHistory(),
        };
    }

    async render() {
        const view = /*html*/ `
        <div class="h-100 d-flex flex-column bg-custom vh-100">
            <div class="row m-0">
                <nav class="navbar navbar-expand bg-white shadow-sm w-100 mb-0" id="navBar"></nav>
            </div>
            <div class="container-fluid p-0 row flex-fill overflow-hidden m-0">
                <div class="col-md-4 d-flex flex-column overflow-auto p-0">
                    <div id="profileInfo" class="m-4"></div>
                </div>
                <div class="col-md-8 d-flex flex-column overflow-auto p-0">
                    <div id="matchHistory" class="flex-grow-1 d-flex flex-column mt-4 me-4 mb-4"></div>
                </div>
            </div>
        </div>
        <!-- Modal Edit Profile -->
        <div class="modal" id="edit-profile-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <form id="edit-profile-form" novalidate>
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
                                <input type="text" class="form-control" id="edit-first-name">
                            </div>
                            <div class="p-3">
                                <label for="edit-last-name" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="edit-last-name">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success" data-bs-dismiss="modal">Save changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Toast Container (positioned absolutely) -->
        <div aria-live="polite" aria-atomic="true" class="position-fixed top-50 start-50 translate-middle p-3" style="z-index: 9999;">
            <div id="errorToast" class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        Please fill in all fields correctly
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
        `;
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        document.getElementById("edit-profile-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const profilePicture = document.getElementById("edit-profile-picture").files[0];
            const firstName = document.getElementById("edit-first-name").value.trim();
            const lastName = document.getElementById("edit-last-name").value.trim();

            // After closing the modal, show toast if fields are empty
            if (!firstName || !lastName) {
                showToast("Incorrect input, please try again.", "danger");
                return;
            }

            // Store values here
            const profileData = {
                profilePicture,
                firstName,
                lastName,
            };

            console.log(profileData);
        });
    }
}