import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { home } from '../../utils/langPack.js';

export default class Navbar extends Component {
    constructor() {
        super({ element: document.getElementById("navBar") });
        store.events.subscribe("stateChange", () => this.render());
        this.render();
    }

    async render() {
        const languageId = store.state.languageId;
        const translations = home[languageId];

        const view = /*html*/ `
            <a id="home-page" class="navbar-brand ps-3">Transcendence</a>
            <div class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></div>
            <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="true"><i class="fas fa-user fa-fw"></i></a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li>
                            <a href="" id="profile-link" role="button" class="dropdown-item">${translations.profile}</a>
                        </li>
                        <li>
                            <hr class="dropdown-divider" />
                        </li>
                        <li id="btnLogout">
                            <a href="" class="dropdown-item" role="button">${translations.logout}</a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-globe"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
                        <li><a class="dropdown-item language-option" href="#" data-lang="fr">🇫🇷 Français</a></li>
                        <li><a class="dropdown-item language-option" href="#" data-lang="en">🇬🇧 English</a></li>
                        <li><a class="dropdown-item language-option" href="#" data-lang="es">🇪🇸 Español</a></li>
                    </ul>
                </li>
            </ul>
        `;

        this.element = document.getElementById("navBar");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#profile-link").addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo("/profile");
        });

        this.element.querySelector("#home-page").addEventListener("click", (event) => {
            event.preventDefault();
            navigateTo("/");
        });

        this.element.querySelector("#btnLogout").addEventListener("click", (event) => {
            event.preventDefault();
            store.dispatch("logOut");
            navigateTo("/login");
        });

        const languageOptions = this.element.querySelectorAll(".language-option");
        languageOptions.forEach(option => {
            option.addEventListener("click", (event) => {
                event.preventDefault();
                const newLang = event.target.dataset.lang;
                store.dispatch("setLanguage", { languageId: newLang });
            });
        });
    }
}