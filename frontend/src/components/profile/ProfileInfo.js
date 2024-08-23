import Component from "../../library/component.js";
import { profile } from "../../utils/langPack.js";
import store from "../../store/index.js";
import { showToast } from "../../utils/toastUtils.js";

export default class ProfileInfo extends Component {
	constructor() {
		super({ element: document.getElementById("profileInfo") });
		this.currentLang = store.state.language;
		this.render();

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
            <div class="card shadow-sm rounded mb-4">
                <div class="d-flex flex-column align-items-center p-4">
                    <img id="profile-picture" alt="${langPack.profilePicture}" class="img-profile-avatar rounded-circle mb-3" >
                    <div class="text-center">
                        <h5 id="profile-name" class="mb-1 font-weight-bold"></h5>
                        <p id="profile-username" class="text-muted mb-2"></p>
                        <button class="btn btn-outline-secondary btn-sm mb-4" data-bs-toggle="modal" data-bs-target="#edit-profile-modal">
                            <i class="fa-solid fa-pen"></i> ${langPack.editProfile}
                        </button>
                    </div>
                    <div class="w-100 border-top mt-2 pt-3">
                        <div class="text-center">
                            <h6 id="profile-wins" class="text-muted mb-0"></h6>
                            <h6 id="profile-losses" class="text-muted mb-0"></h6>
							<h6 id="profile-total" class="text-muted mb-0"></h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
		this.element = document.getElementById("profileInfo");
		this.element.innerHTML = view;
		await this.handleEvent();
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
			if (response.ok) {
				const profile = await response.json();
				console.log('Received profile data:', profile);
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
	}
}