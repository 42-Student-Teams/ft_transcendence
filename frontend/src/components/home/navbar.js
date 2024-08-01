import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { login } from "/src/utils/langPack.js";

export default class Navbar extends Component {
    constructor(isLoggedIn = true) {
        super({ element: document.getElementById("navBar") });
        this.isLoggedIn = isLoggedIn;
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }

    async render() {
        const langPack = login[this.currentLang];

        const view = /*html*/ `
            <a id="home-page" class="navbar-brand ps-3">Transcendence</a>
            <div class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></div>
            <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                ${this.isLoggedIn ? this.getLoggedInItems(langPack) : this.getLoggedOutItems(langPack)}
            </ul>
        `;

        this.element = document.getElementById("navBar");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    getLoggedInItems(langPack) {
        return /*html*/ `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="true"><i class="fas fa-user fa-fw"></i></a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                        <a href="" id="profile-link" role="button" class="dropdown-item">${langPack.profile}</a>
                    </li>
                    <li>
                        <hr class="dropdown-divider" />
                    </li>
                    <li id="btnLogout">
                        <a href="" class="dropdown-item" role="button">${langPack.logout}</a>
                    </li>
                </ul>
            </li>
            ${this.getLanguageSelector(langPack)}
        `;
    }

    getLoggedOutItems(langPack) {
        return this.getLanguageSelector(langPack);
    }

    getLanguageSelector() {
        return /*html*/ `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-globe"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
                    <li><a class="dropdown-item" href="#" data-lang="en">${login.en.flag} English ${this.currentLang === 'en' ? '✓' : ''}</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="fr">${login.fr.flag} Français ${this.currentLang === 'fr' ? '✓' : ''}</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="es">${login.es.flag} Español ${this.currentLang === 'es' ? '✓' : ''}</a></li>
                </ul>
            </li>
        `;
    }

    async handleEvent() {
        if (this.isLoggedIn) {
            this.element.querySelector("#profile-link")?.addEventListener("click", (event) => {
                event.preventDefault();
                navigateTo("/profile");
            });

            this.element.querySelector("#btnLogout")?.addEventListener("click", (event) => {
                event.preventDefault();
                store.dispatch("logOut");
                navigateTo("/login");
            });
        }

        this.element.querySelector("#home-page").addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo("/");
        });

        // Gestion du changement de langue
        const languageItems = this.element.querySelectorAll('[data-lang]');
        languageItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const newLang = event.target.getAttribute('data-lang');
                this.changeLanguage(newLang);
            });
        });
    }

    changeLanguage(lang) {
        store.dispatch("setLanguage", lang);
    }

    onStateChange() {
        if (this.currentLang !== store.state.language) {
            this.currentLang = store.state.language;
            this.render();
        }
    }
}