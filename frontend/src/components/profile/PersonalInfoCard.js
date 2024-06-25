import Component from "../../library/component.js";

export default class PersonalInfoCard extends Component {
    constructor() {
        super({ element: document.getElementById("personalInfoCard") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="custom-card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">Personal Info</h5>
                        <span class="edit-icon" onclick="editInfo()"><i class="fas fa-pencil-alt"></i></span>
                    </div>
                    <p class="card-text"><strong>First name:</strong> Leonel</p>
                    <p class="card-text"><strong>Last name:</strong> Lamilton</p>
                    <p class="card-text"><strong>Username:</strong> Sabah</p>
                    <p class="card-text"><strong>Password:</strong> ***********</p>
                    <p class="card-text"><strong>Email:</strong> exemple@ex.copm</p>
                    <p class="card-text"><strong>Avatar Color:</strong> Green</p>
                    <button class="btn validate-btn" onclick="validateInfo()">Validate</button>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}
