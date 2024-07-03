// frontend/src/components/login/btn-auth0.js

import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("btnAuth0") });
        this.render();
    }

    render() {
        const clientId = "u-s4t2ud-cf4fcea477189ac2857788e8e11ca8f41435f79c2ca10e75f6b03cd61c14e966"; // Remplacez par votre vrai Client ID
        const redirectUri = encodeURIComponent("http://localhost:8069/oauth/callback/");
        const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public`;

        const view = /*html*/ `
            <a href="${authorizationUrl}" class="btn btn-md btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} alt="Logo 42" style="width:20px" class="me-2">
                Se connecter avec 42
            </a>
        `;

        this.element.innerHTML = view;
        this.addEventListeners();
    }

    addEventListeners() {
        const loginButton = this.element.querySelector('a');
        if (loginButton) {
            loginButton.addEventListener('click', this.handleLogin.bind(this));
        }
    }

    handleLogin(event) {
        event.preventDefault();
        const authUrl = event.currentTarget.href;
        console.log('Redirection vers:', authUrl);
        window.location.href = authUrl;
    }
}