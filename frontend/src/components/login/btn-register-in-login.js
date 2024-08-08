import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import store from "../../store/index.js";
import { login } from "/src/utils/langPack.js";

export default class BtnRegisterInLogin extends Component {
    constructor() {
        super({ element: document.getElementById("btnRegisterInLogin") });
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }

    async render() {
        const langPack = login[this.currentLang];
        const view = /*html*/ `
            <small>${langPack.noAccount}
                <a href="">${langPack.signUp}</a>
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