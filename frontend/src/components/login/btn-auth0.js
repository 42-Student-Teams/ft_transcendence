import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";
import { generateRandomState } from "../../utils/randomState.js";
import store from "../../store/index.js";
import { login } from "/src/utils/langPack.js";

export default class BtnAuth0 extends Component {
    constructor() {
        super({ element: document.getElementById("btnAuth0") });
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }

    async render() {
        const langPack = login[this.currentLang];
        const view = /*html*/ `
            <button class="btn btn-md btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} style="width:20px" class="me-2">
                ${langPack.signInWith42}
            </button>
        `;

        this.element = document.getElementById("btnAuth0");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("button").addEventListener("click", () => {
            const { state, expirationTime } = generateRandomState();
            sessionStorage.setItem('oauth_state', JSON.stringify({ state, expirationTime }));
            open(`${process.env.AUTHORIZATION_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}&response_type=code`, "_self");
        });
    }

    onStateChange() {
        if (this.currentLang !== store.state.language) {
            this.currentLang = store.state.language;
            this.render();
        }
    }
}