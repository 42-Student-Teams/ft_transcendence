import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import store from "../../store/index.js";

export default class BtnRegisterInLogin extends Component {
    constructor() {
        super({ element: document.getElementById("btnRegisterInLogin") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <small>${noAccount}
                <a href="">${signUp}</a>
            </small>
        `;

        this.element = document.getElementById("btnRegisterInLogin");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("a").addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo("/register");
        });
    }

    onStateChange() {
        if (this.currentLang !== store.state.language) {
            this.currentLang = store.state.language;
            this.render();
        }
    }
}