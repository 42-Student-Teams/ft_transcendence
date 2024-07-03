import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import store from "../../store/index.js";

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("btnAuth0") });
        this.render();
    }

    async render() {
        const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=public`;

        const view = /*html*/ `
            <a href="${authorizationUrl}" class="btn btn-md btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} style="width:20px" class="me-2">
                Sign In with 42
            </a>
        `;

        this.element = document.getElementById("btnAuth0");
        this.element.innerHTML = view;
    }

    async handleEvent() {
        this.element.querySelector("a").addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = event.target.href;
        });
    }
}

