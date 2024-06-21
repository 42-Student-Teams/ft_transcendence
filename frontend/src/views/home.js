import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });

    // store.events.subscribe("languageIdChange", () => this.renderAll());

    this.render();

    this.components = {
      navBar: new NavBar(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
            <nav id="navBar">
            </nav>
            <div class="container-fluid">
              <div class="row">
                <div id="chat" class="sidebar col-md-2 d-none d-md-block bg-primary">
                    <p>Hello</p>
                </div>
                <main class=" bg-secondary">
                    <div class="w-100 d-flex justify-content-center align-items-center py-2">
                      <h1 class="display-4 fw-bold">Game Mode Selection</h1>
                    </div>
                    <div class="d-flex flex-row gap-3 mt-3 justify-content-center">
                          <div id="singleGameMode" class="" ></div>
                          <div id="tournamentGameMode" class=" col"></div>
                    </div>
                  </main>
                </div>
            </div>
        `;

    this.element.innerHTML = view;
  }
}
