import NavBar from '../components/home/navbar.js';
import SideChat from '../components/home/side-chat.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      sideChat: new SideChat(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
          <div class="h-100 d-flex flex-column">
            <div class="row chat-rm-margin ">
              <nav class="navbar navbar-expand navbar-dark bg-dark pl-4" id="navBar"></nav>
            </div>
            <div class="flex-grow-1 d-flex">
              <div class="chat-rm-margin row flex-grow-1 h-100">
                <div class="chat-flex col bg-dark h-100 d-flex flex-column">
                  <div class="d-flex flex-column h-100 gap-4 p-4 overflow-auto">
                    <div class="header-text">
                      <div class="logo text-white">Chatroom</div>
                    </div>
                    <div id="side-chat"></div>
                    <div id="side-chatrooms"></div>
                    <div id="side-friends"></div>
                  </div>
                </div>
                <div class="col bg-success d-flex flex-column justify-content-center align-items-center">
                  <!-- Content for the second column -->
                  <h3>Column 2 Content</h3>
                  <p>This column takes up 9 units of the grid.</p>
                </div>
              </div>
            </div>
          </div>
        `;
    this.element.innerHTML = view;

  }
}
