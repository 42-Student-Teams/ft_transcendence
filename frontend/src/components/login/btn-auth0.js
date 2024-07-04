// frontend/src/components/login/btn-auth0.js

import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("btnAuth0") });
        this.render();
    }

    async render() {
        try {
            const config = await this.getOAuthConfig();
            const authorizationUrl = `${config.AUTHORIZATION_URL}?client_id=${config.CLIENT_ID}&redirect_uri=${encodeURIComponent(config.REDIRECT_URI)}&response_type=code`;

            const view = /*html*/ `
                <a href="${authorizationUrl}" class="btn btn-md btn-fortytwo w-100 fs-5">
                    <img src=${btnLogo} alt="Logo 42" style="width:20px" class="me-2">
                    Se connecter avec 42
                </a>
            `;

            this.element.innerHTML = view;
            this.addEventListeners();
        } catch (error) {
            console.error('Erreur lors de la récupération de la configuration OAuth:', error);
            this.element.innerHTML = `<p>Erreur lors du chargement du bouton de connexion</p>`;
        }
    }

    async getOAuthConfig() {
        const response = await fetch('http://localhost:8069/oauth/config/', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        return await response.json();
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