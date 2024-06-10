import Component from "../library/component.js";
// import LogoutButton from './main/logoutButton.js';
import headerLogo from "../assets/image/header-logo.png";

export default class Home extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        
        // this.components = {
        //     logoutButton: new LogoutButton(),
        // };
    }

    async render() {
        // const languageId = store.state.languageId;

        const view = /*html*/ `
            <header class="p-3 mb-3 border-bottom">
              <div class="container">
                <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                  <a href="/" class="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
                    <img src=${headerLogo} width="40" height="32"">
                  </a>
                  <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                  </ul>
                  <div class="dropdown text-end">
                    <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                      <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" class="rounded-circle">
                    </a>
                    <ul class="dropdown-menu text-small">
                      <li>
                          <a class="dropdown-item" href="#">Chat</a>
                      </li>
                      <li>
                          <a class="dropdown-item" href="#">Settings</a>
                      </li>
                      <li>
                          <a class="dropdown-item" href="#">Profile</a>
                      </li>
                      <li>
                          <hr class="dropdown-divider" />
                      </li>
                      <li>
                        <a class="dropdown-item" href="#">Sign out</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </header>
            <main class="d-flex flex-column align-items-center justify-content-center vh-100">
                <div>
                    <div class="w-100 d-flex justify-content-center align-items-center py-2">
                        <h1 class="display-4 fw-bold">Game Mode Selection</h1>
                    </div>
                    <div class="d-flex flex-row gap-3 mt-3 justify-content-center">
                        <div id="singleGameMode" class="rounded border bg-light text-dark shadow-sm col" data-v0-t="card"></div>
                        <div id="tournamentGameMode" class="rounded border bg-light text-dark shadow-sm col" data-v0-t="card"></div>
                    </div>
                </div>
            </main>
        `;

        this.element.innerHTML = view;
    }

   
}
