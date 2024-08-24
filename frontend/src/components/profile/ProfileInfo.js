import Component from "../../library/component.js";

export default class ProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("profileInfo") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card shadow-sm rounded mb-4">
                <div class="d-flex flex-column align-items-center p-4">
                    <img id="profile-picture" alt="Profile" class="img-fluid w-25 h-25 rounded-circle mb-3" >
                    <div class="text-center">
                        <h5 id="profile-name" class="mb-1 font-weight-bold"></h5>
                        <p id="profile-username" class="text-muted mb-2"></p>
                        <button class="btn btn-outline-secondary btn-sm mb-4" data-bs-toggle="modal" data-bs-target="#edit-profile-modal">
                            <i class="fa-solid fa-pen"></i> Edit Profile
                        </button>
                    </div>
                    <div class="w-100 border-top mt-2 pt-3">
                        <div class="text-center">
                            <h6 id="profile-wins" class="text-muted mb-0">Wins: 10</h6>
                            <h6 id="profile-losses" class="text-muted mb-0"> </h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.element = document.getElementById("profileInfo");
        this.element.innerHTML = view;
		this.handleEvent()
    }

	async handleEvent() {
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

				document.getElementById("profile-username").innerText = profile.username;
				document.getElementById("profile-name").innerText = profile.prenom + " " + profile.nom;
				document.getElementById("profile-wins").innerText = "Wins : " + profile.parties_gagnees;
				document.getElementById("profile-picture").src = profile.avatar;
				// TODO : Get Losses from the API
				document.getElementById("profile-losses").innerText = "Losses : " + profile.parties_jouees;
            } else {
                console.error('Failed to fetch match history');
                showToast('Failed to fetch user profile', 'danger');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            showToast('Error fetching user profile', 'danger');
        }
	}
}
