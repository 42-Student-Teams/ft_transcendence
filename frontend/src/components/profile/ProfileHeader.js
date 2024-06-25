import Component from "../../library/component.js";

export default class ProfileHeader extends Component {
    constructor() {
        super({ element: document.getElementById("profileHeader") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="profile-header mb-4">
                <div class="avatar" style="background-color: #5aff92;"></div>
                <div>
                    <h3>Lamilton</h3>
                    <p class="lvl">LVL 1.000</p>
                </div>
            </div>
        `;
        this.element.innerHTML = view;
    }
}
