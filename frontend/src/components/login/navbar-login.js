import Component from "../../library/component.js";
import store from "../../store/index.js";
import { login } from '../../utils/langPack.js';

export default class NavbarLogin extends Component {
  constructor() {
    super({ element: document.getElementById("navBarLogin") });
    store.events.subscribe("stateChange", () => this.render());
    this.render();
  }

  async render() {
    const languageId = store.state.languageId;
    const translations = login[languageId];

    const view = /*html*/ `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Transcendence</a>
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-globe"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item language-option" href="#" data-lang="fr">🇫🇷 Français</a></li>
                <li><a class="dropdown-item language-option" href="#" data-lang="en">🇬🇧 English</a></li>
                <li><a class="dropdown-item language-option" href="#" data-lang="es">🇪🇸 Español</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    `;

    this.element.innerHTML = view;
    this.attachEventListeners();
  }

  attachEventListeners() {
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