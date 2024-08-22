import NavBar from '../components/home/navbar.js';
import MatchHistory from "../components/profile/MatchHistory.js";
import ProfileInfo from "../components/profile/ProfileInfo.js";
import { showToast } from "../utils/toastUtils.js";
import Component from "../library/component.js";
import { profile } from "../utils/langPack.js";
import store from "../store/index.js";

export default class Profile extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.currentLang = store.state.language;
        this.render();

        this.components = {
            navBar: new NavBar(),
            profileInfo: new ProfileInfo(),
            matchHistory: new MatchHistory(),
        };

        store.events.subscribe('stateChange', () => {
            if (this.currentLang !== store.state.language) {
                this.currentLang = store.state.language;
                this.render();
            }
        });
    }

    async render() {
        const langPack = profile[this.currentLang];
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
                            <h5 class="modal-title">${langPack.editProfile}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="p-3">
                                <label for="edit-profile-picture" class="form-label">${langPack.profilePicture}</label>
                                <input type="file" class="form-control" id="edit-profile-picture">
                            </div>
                            <div class="p-3">
                                <label for="edit-first-name" class="form-label">${langPack.firstName}</label>
                                <input type="text" class="form-control" id="edit-first-name">
                            </div>
                            <div class="p-3">
                                <label for="edit-last-name" class="form-label">${langPack.lastName}</label>
                                <input type="text" class="form-control" id="edit-last-name">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">${langPack.cancel}</button>
                            <button type="submit" class="btn btn-success" data-bs-dismiss="modal">${langPack.saveChanges}</button>
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
                        ${langPack.fillAllFields}
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
        const langPack = profile[this.currentLang];
        document.getElementById("edit-profile-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const profilePicture = document.getElementById("edit-profile-picture").files[0];
            const firstName = document.getElementById("edit-first-name").value.trim();
            const lastName = document.getElementById("edit-last-name").value.trim();
			
            if (!firstName || !lastName) {
                showToast(langPack.incorrectInput, "danger");
                return;
            }

			const formData  = new FormData();
			formData.append('nom', lastName);
			formData.append('prenom', firstName);
			formData.append('avatar', profilePicture);

			try {
				const jwt = localStorage.getItem('jwt');
				const apiurl = process.env.API_URL;
				const response = await fetch(`${apiurl}/user_update`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
					body: formData,
				});
				console.log('Response:', response);

				if (response.ok) {
					showToast(langPack.profileUpdateSuccess, 'success');
				}
			}
			catch (error) {
				console.error('Error updating user profile:', error);
				showToast(langPack.profileUpdateError, 'danger');
			}
        });
    }
}