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
                    <img src="https://via.placeholder.com/80" alt="Profile" class="img-fluid rounded-circle mb-3" id="profile-picture">
                    <div class="text-center">
                        <h5 class="mb-1 font-weight-bold">Leonel Saba</h5>
                        <p class="text-muted mb-2">Lsaba-qu</p>
                        <button class="btn btn-outline-secondary btn-sm mb-4" data-bs-toggle="modal" data-bs-target="#edit-profile-modal">
                            <i class="fa-solid fa-pen"></i> Edit Profile
                        </button>
                    </div>
                    <div class="w-100 border-top mt-2 pt-3">
                        <div class="text-center">
                            <h6 class="text-muted mb-0">Wins: 10</h6>
                            <h6 class="text-muted mb-0">Losses: 0</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.element = document.getElementById("profileInfo");
        this.element.innerHTML = view;
    }
}
