import Component from "../../library/component.js";

export default class ProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("profileInfo") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card mb-2 p-3">
                <div class="d-flex align-items-center mb-3">
                    <img src="https://via.placeholder.com/80" alt="Profile" class="img-fluid rounded mr-3">
                    <div class="ml-3 mx-2">
                        <h5 class="mb-0">Leonel Saba</h5>
                        <p class="mb-0">12 Wins 13 Losses 43% Winrate</p>
                    </div>
                </div>
                <div class="pb-3">
                    <div class="d-flex justify-content-between mb-2">
                        <span>First Name</span>
                        <span class="profile-user-info">Leonel</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Last Name</span>
                        <span class="profile-user-info">Saba</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Username</span>
                        <span class="profile-user-info">Lamilton</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Email</span>
                        <span class="profile-user-info">lsaba-qu@42lausanne.ch</span>
                    </div>
                </div>
				<button class="btn btn-blue btn-sm mb-3 edit-profil-btn" data-bs-toggle="modal" data-bs-target="#edit-profile-modal"><i class="fa-solid fa-pen"></i> Edit profile</button>
            </div>
        `;

        this.element = document.getElementById("profileInfo");
        this.element.innerHTML = view;
    }
}
