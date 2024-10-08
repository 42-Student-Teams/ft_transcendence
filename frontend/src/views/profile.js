import NavBar from '../components/home/navbar.js';
import { showToast } from "../utils/toastUtils.js";
import Component from "../library/component.js";
import { profile } from "../utils/langPack.js";
import { getProfile, updateProfile, clearEditModalInputs } from "../utils/profileUtils.js";
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
                                <label for="edit-profile-firstname" class="form-label">${langPack.firstName}</label>
                                <input type="text" class="form-control" id="edit-profile-firstname">
                            </div>
                            <div class="p-3">
                                <label for="edit-profile-lastname" class="form-label">${langPack.lastName}</label>
                                <input type="text" class="form-control" id="edit-profile-lastname">
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

		await getProfile();

		const profileUsernameElem = document.getElementById("profile-username");
		const profileNameElem = document.getElementById("profile-name");
		const profileWinsElem = document.getElementById("profile-wins");
		const profileLossesElem = document.getElementById("profile-losses");
		const profilePictureElem = document.getElementById("profile-picture");
		const profileTotalElem = document.getElementById("profile-total");

		if (profileUsernameElem && profileNameElem && profileWinsElem && profileLossesElem && profilePictureElem && profileTotalElem) {
			profileUsernameElem.innerText = store.state.username;
			profileNameElem.innerText = `${store.state.firstname} ${store.state.lastname}`;
			profileWinsElem.innerText = `${langPack.wins}: ${store.state.gamesWon}`;
			profilePictureElem.src = store.state.avatar;
			profileLossesElem.innerText = `${langPack.losses}: ${store.state.gamesLossed}`;
			profileTotalElem.innerText = `${langPack.totalGames}: ${store.state.gamesPlayed}`;
		}

		this.fetchMatchHistory();

		const editProfileModal = document.getElementById("edit-profile-modal");
		// wait for the dom to load 
		if (editProfileModal) {
			editProfileModal.addEventListener("submit", async (event) => {
				event.preventDefault();

				const profilePicture = document.getElementById("edit-profile-picture").files[0];
				const firstName = document.getElementById("edit-profile-firstname").value.trim();
				const lastName = document.getElementById("edit-profile-lastname").value.trim();

				if (!firstName || !lastName) {
					showToast(langPack.incorrectInput, "danger");
					return;
				}

				const formData = new FormData();
				formData.append('last_name', lastName);
				formData.append('first_name', firstName);
				formData.append('avatar', profilePicture);
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
						const profile = {
							firstname: data.user.first_name,
							lastname: data.user.last_name,
							avatar: data.user.avatar_url,
						};
						await updateProfile(profile);
						const profileNameElem = document.getElementById("profile-name");
						const profilePictureElem = document.getElementById("profile-picture");

						await this.fetchMatchHistory();

						if (profileNameElem && profilePictureElem) {
							profileNameElem.innerText = `${profile.firstname} ${profile.lastname}`;
							profilePictureElem.src = profile.avatar;
						}
					} else {
						console.error('Failed to update user profile');
						showToast(langPack.profileUpdateError, 'danger');
					}
				} catch (error) {
					console.error('Error updating user profile:', error);
					showToast(langPack.profileUpdateError, 'danger');
				}
				await clearEditModalInputs(["edit-profile-firstname", "edit-profile-lastname", "edit-profile-picture"]);
			});
		}
	}

	async fetchMatchHistory() {
		const langPack = profile[this.currentLang];
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/history_getGames`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			this.matchHistory = data.historique.slice(0, 5);
			this.renderMatchHistory();
		} catch (error) {
			console.error('Error fetching match history:', error);
			showToast(langPack.fetchMatchHistoryError, 'danger');
		}
	}

	async renderMatchHistory() {
		const langPack = profile[this.currentLang];
		const matchDisplayElement = document.getElementById("match-list-display");
		if (matchDisplayElement) {
			matchDisplayElement.innerHTML = '';
			if (this.matchHistory.length > 0) {
				this.matchHistory.forEach((match, index) => {
					const isLastMatch = index === this.matchHistory.length - 1;
					const matchHtml = this.createMatch(match, isLastMatch);
					matchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);
				});
			} else {
				if (matchDisplayElement)
					matchDisplayElement.innerHTML = `<p class="text-center">${langPack.noMatchesPlayed}</p>`;
			}
		} else {
			console.error("Match list display element not found");
		}
	}

	createMatch(match, isLastMatch) {
		const langPack = profile[this.currentLang];
		let result = "";
		const myPlayerUsername = (match.joueur1_username === store.state.username) ? match.joueur1_username : match.joueur2_username;
		const myScore = (myPlayerUsername === match.joueur1_username) ? match.score_joueur1 : match.score_joueur2;
		const opponentScore = (myPlayerUsername === match.joueur1_username) ? match.score_joueur2 : match.score_joueur1;

		if (match.gagnant_username === null) {
			if (myScore > opponentScore || myScore == opponentScore)
				result = langPack.defeatByWithdraw;
			else
				result = langPack.defeat;
		} else if (match.gagnant_username === myPlayerUsername) {
			if (myScore === 3) {
				result = langPack.victory;
			} else if (myScore < 3) {
				result = langPack.victoryByWithdraw;
			}
		} else {
			if (opponentScore === 3) {
				result = langPack.defeat;
			}
			else if (opponentScore < 3)
				result = langPack.defeatByWithdraw;
		}

		const score = `${match.score_joueur1} - ${match.score_joueur2}`;
		let resultClass = "";
		if (result == langPack.victoryByWithdraw || result == langPack.victory)
			resultClass = "text-success";
		else
			resultClass = "text-danger";
		const date = new Date(match.date_partie).toLocaleString(this.currentLang);

		return `
        <div class="d-flex justify-content-between align-items-center py-3 ${!isLastMatch ? 'border-bottom' : ''}">
            <div class="game-history-container d-flex flex-column align-items-center">
                <img src="${match.joueur1_avatar}" alt="${langPack.profilePicture}" class="rounded-circle mb-2 img-match-history">
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