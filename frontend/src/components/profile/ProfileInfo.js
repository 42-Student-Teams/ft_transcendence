import Component from "../../library/component.js";

export default class ProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("profileInfo") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card mb-2 p-3">
                <button class="btn btn-dark btn-sm mb-3 edit-profil-btn" data-bs-toggle="modal" data-bs-target="#edit-profile-modal">Edit profil</button>
                <div class="d-flex align-items-center mb-3">
                    <img src="https://via.placeholder.com/80" alt="Profile" class="img-fluid rounded mr-3">
                    <div class="ml-3 mx-2">
                        <h5 class="mb-0">Leonel Saba</h5>
                        <p class="mb-0">12W 13L 43%</p>
                    </div>
                </div>
                <div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>First Name</span>
                        <span>Leonel</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Last Name</span>
                        <span>Saba</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Username</span>
                        <span>Lamillton</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Email</span>
                        <span>exemple@adress.com</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Password</span>
                        <span>*****</span>
                    </div>
                </div>
            </div>
        `;

        this.element = document.getElementById("profileInfo");
        this.element.innerHTML = view;
    }
}
