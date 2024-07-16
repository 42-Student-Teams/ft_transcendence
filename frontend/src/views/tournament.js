import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class Tournament extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        this.components = { 
            navBar: new NavBar(),
            // btnAuth0: new BtnAuth0(),
         };
    }

    async render() {

        const view = /*html*/ `
		<div class="h-100 d-flex flex-column">
  <div class="row chat-rm-margin">
    <nav class="navbar navbar-expand pl-4 bg-white shadow-sm" id="navBar"></nav>
  </div>
  <h1 class="pt-5 text-center display-1">Tournament</h1>
  <div class="d-flex flex-row justify-content-center">
    <h1 class="display-5">Inaranjo</h1>
    <br/>
    <h1 class="display-5 mx-3"> x </h1>
    <h1 class="display-5">Jackito</h1>
  </div>
  <div class="d-flex justify-content-center align-items-center">
    <div class="game-container d-flex justify-content-center align-items-center gap-5">
      <div class="col text-center">
        <h1 class="display-1">3</h1>
      </div>
      <div class="col text-center">
        <div class="game-canva rounded">
        </div>
      </div>
      <div class="col text-center">
        <h1 class="display-1">0</h1>
      </div>
    </div>
  </div>
</div>
        `;

        this.element.innerHTML = view;
    }
}
