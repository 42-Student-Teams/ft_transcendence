import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { home } from "/src/utils/langPack.js";

export default class Navbar extends Component {
    constructor() {
        super({ element: document.getElementById("navBar") });
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }

    async render() {
        const langPack = home[this.currentLang]; // Utilisation du pack de langue pour la page d'accueil

        const view = /*html*/ `
            <a id="home-page" class="navbar-brand ps-3">${langPack.title}</a>
            <div class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></div>
            <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
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
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-globe"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
                    <li><a class="dropdown-item" href="#" data-lang="en">${langPack.languages.en} ${this.currentLang === 'en' ? '✓' : ''}</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="fr">${langPack.languages.fr} ${this.currentLang === 'fr' ? '✓' : ''}</a></li>
                    <li><a class="dropdown-item" href="#" data-lang="es">${langPack.languages.es} ${this.currentLang === 'es' ? '✓' : ''}</a></li>
                </ul>
            </li>
            </ul>
        `;

        this.element = document.getElementById("navBar");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#profile-link")?.addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo("/profile");
        });

        this.element.querySelector("#btnLogout")?.addEventListener("click", (event) => {
            event.preventDefault();
            store.dispatch("logOut");
            navigateTo("/login");
        });

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

    async onStateChange() {
		console.log('navbar onStateChange');
        if (this.currentLang !== store.state.language) {
            this.currentLang = store.state.language;
            this.render();
        }
    }
}