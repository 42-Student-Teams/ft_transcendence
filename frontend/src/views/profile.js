import NavBar from '../components/home/navbar.js';
import { showToast } from "../utils/toastUtils.js";
import Component from "../library/component.js";
import { profile } from "../utils/langPack.js";
import { getProfile, updateProfile } from "../utils/profileUtils.js";
import store from "../store/index.js";

export default class Profile extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.currentLang = store.state.language;
		store.events.subscribe("stateChange", () => this.onStateChange()); // 
		this.render();

		this.components = {
			navBar: new NavBar(),
		};
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
                    <div id="profileInfo" class="m-4">
						<div class="card shadow-sm rounded mb-4 ">
            			    <div class="d-flex flex-column align-items-center p-4">
            			        <img id="profile-picture" alt="${langPack.profilePicture}" class="img-profile-avatar rounded-circle mb-3" >
            			        <div class="text-center">
            			            <h5 id="profile-name" class="mb-1 fs-4"></h5>
            			            <p id="profile-username" class="text-muted mb-2 fs-6"></p>
            			            <button class="btn btn-outline-secondary btn-sm mb-4" data-bs-toggle="modal" data-bs-target="#edit-profile-modal">
            			                <i class="fa-solid fa-pen"></i> ${langPack.editProfile}
            			            </button>
            			        </div>
            			        <div class="w-100 border-top mt-2 pt-3 ">
            			            <div class="text-center ">
            			                <h6 id="profile-wins" class="text-muted mb-0"></h6>
            			                <h6 id="profile-losses" class="text-muted mb-0"></h6>
										<h6 id="profile-total" class="text-muted mb-0"></h6>
            			            </div>
            			        </div>
            			    </div>
            			</div>
					</div>
                </div>
                <div class="col-md-8 d-flex flex-column overflow-auto p-0">
                    <div id="matchHistory" class="flex-grow-1 d-flex flex-column mt-4 me-4 mb-4">
						<div class="card p-2 m-0">
            			    <div class="card-body p-2 m-0">
            			        <h5 class="card-title text-center mt-3 mb-4">${langPack.matchHistory}</h5>
            			        <div id="match-list-display" class="mt-3"></div>
            			    </div>
            			</div>
					</div>
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

		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/get_user_profile`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				}
			});

			this.fetchMatchHistory();
			if (response.ok) {

				const test = await getProfile();
				console.log('test', test);


				const profile = await response.json();
				console.log('Received user profile data:', profile);
				const profileUsernameElem = document.getElementById("profile-username");
				const profileNameElem = document.getElementById("profile-name");
				const profileWinsElem = document.getElementById("profile-wins");
				const profileLossesElem = document.getElementById("profile-losses");
				const profilePictureElem = document.getElementById("profile-picture");
				const profileTotalElem = document.getElementById("profile-total");

				if (profileUsernameElem && profileNameElem && profileWinsElem && profileLossesElem && profilePictureElem && profileTotalElem) {
					profileUsernameElem.innerText = profile.username;
					profileNameElem.innerText = `${profile.prenom} ${profile.nom}`;
					profileWinsElem.innerText = `${langPack.wins}: ${profile.parties_gagnees}`;
					profilePictureElem.src = profile.avatar;
					profileLossesElem.innerText = `${langPack.losses}: ${profile.parties_perdues}`;
					profileTotalElem.innerText = `${langPack.totalGames}: ${profile.parties_jouees}`;
				}
			} else {
				console.error('Failed to fetch match history');
				showToast(langPack.fetchProfileFailed, 'danger');
			}
		} catch (error) {
			console.error('Error fetching user profile:', error);
			showToast(langPack.fetchProfileError, 'danger');
		}

		const editProfileModal = document.getElementById("edit-profile-modal");
		// wait for the dom to load 
		editProfileModal.addEventListener("show.bs.modal", async (event) => {
			editProfileModal.addEventListener("submit", async (event) => {
				event.preventDefault();

				const profilePicture = document.getElementById("edit-profile-picture").files[0];
				const firstName = document.getElementById("edit-first-name").value.trim();
				const lastName = document.getElementById("edit-last-name").value.trim();

				if (!firstName || !lastName) {
					showToast(langPack.incorrectInput, "danger");
					return;
				}

				const formData = new FormData();
				formData.append('last_name', lastName);
				formData.append('first_name', firstName);
				formData.append('avatar', profilePicture);
				console.log('formData', formData.get('avatar'));
				try {
					const jwt = localStorage.getItem('jwt');
					const apiurl = process.env.API_URL;
					const response = await fetch(`${apiurl}/update_user`, {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${jwt}`,
						},
						body: formData,
					});

					if (response.ok) {

						showToast(langPack.profileUpdateSuccess, 'success');

						const data = await response.json();
						console.log('Received updated profile data:', data.user);
						const profile = {
							firstname: data.user.first_name,
							lastname: data.user.last_name,
							avatar: data.user.avatar_url,
						};
						
						console.log('user', profile);
						await updateProfile(profile);
						console.log('profile', getProfile());
					}
					if (!response.ok) {
						console.error('Error updating user profile:', response.statusText);
						showToast(langPack.profileUpdateError, 'danger');
					}
				}
				catch (error) {
					console.error('Error updating user profile:', error);
					showToast(langPack.profileUpdateError, 'danger');
				}
			});
		});
	}

	async fetchMatchHistory() {
		const langPack = profile[this.currentLang];
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			await fetch(`${apiurl}/history_getGames`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				}
			}).then((response) => response.json())
				.then((data) => {
					this.matchHistory = data.historique.slice(0, 5);
					this.renderMatchHistory();
				});

			/*if (response.ok) {
				const data = await response.json();
				console.log('Received match history data:', data);

				this.matchHistory = data.historique.slice(0, 5);

				await this.renderMatchHistory();
				console.log('1 Match history rendered');
			} else {
				console.error('Failed to fetch match history');
				showToast(langPack.fetchMatchHistoryFailed, 'danger');
			}*/
		} catch (error) {
			console.error('Error fetching match history:', error);
			showToast(langPack.fetchMatchHistoryError, 'danger');
		}
	}

	async renderMatchHistory() {
		const langPack = profile[this.currentLang];
		const matchDisplayElement = document.getElementById("match-list-display");
		matchDisplayElement.innerHTML = '';

		console.log('2 Match history rendered');
		if (this.matchHistory.length > 0) {
			this.matchHistory.forEach((match, index) => {
				const isLastMatch = index === this.matchHistory.length - 1;
				const matchHtml = this.createMatch(match, isLastMatch);
				matchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);
			});
		} else {
			matchDisplayElement.innerHTML = `<p class="text-center">${langPack.noMatchesPlayed}</p>`;
		}
	}

	createMatch(match, isLastMatch) {
		const langPack = profile[this.currentLang];
		const result = match.gagnant_username === match.joueur1_username ? langPack.victory : langPack.defeat;
		const resultClass = result === langPack.victory ? "text-success" : "text-danger";
		const score = `${match.score_joueur1} - ${match.score_joueur2}`;
		const date = new Date(match.date_partie).toLocaleString(this.currentLang);

		return `
        <div class="d-flex justify-content-between align-items-center py-3 ${!isLastMatch ? 'border-bottom' : ''}">
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="${match.joueur2_avatar}" alt="${langPack.profilePicture}" class="rounded-circle mb-2 img-match-history">
                <small class="text-muted text-truncate text-center" >${match.joueur1_username}</small>
            </div>
            <div class="text-center">
                <span class="${resultClass} d-block mb-1">${result}</span>
                <p class="mb-1">${score}</p>
                <small class="text-muted">${date}</small>
            </div>
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="${match.joueur2_avatar}" alt="${langPack.profilePicture}" class="rounded-circle mb-2 img-match-history">
                <small class="text-muted text-truncate text-center">${match.joueur2_username}</small>
            </div>
        </div>
        `;
	}

	onStateChange() {
		if (this.currentLang !== store.state.language) {
			this.currentLang = store.state.language;
			this.render();
		}
	}
}