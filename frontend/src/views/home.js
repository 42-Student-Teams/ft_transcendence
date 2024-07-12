import NavBar from '../components/home/navbar.js';
import SideChat from '../components/home/side-chat.js';
import SideFriendList from '../components/home/side-friend-list.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      sideChat: new SideChat(),
	  sideFriendList: new SideFriendList(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
          <div class="h-100 d-flex flex-column">
            <div class="row chat-rm-margin ">
              <nav class="navbar navbar-expand pl-4 bg-white shadow-sm" id="navBar"></nav>
            </div>
            <div class="flex-grow-1 d-flex">
              <div class="chat-rm-margin row flex-grow-1 h-100">
                <div id="navbarToggleExternalContent" class="chat-flex col bg-white h-100 d-flex flex-column collapse collapse">
                  <div class="d-flex flex-column h-100 gap-4 p-4 overflow-auto ">
                    <div class="btn-group" role="group" aria-label="Basic button group">
  						<button type="button" class="btn btn-primary active">Friends</button>
  						<button type="button" class="btn btn-primary">Channels</button>
  						<button type="button" class="btn btn-primary">Blocked</button>
					</div>
                    <div id="side-chat" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-chatrooms" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-friend-list" class="d-flex flex-column h-100 gap-3"></div>
                  </div>
                </div>
                <div id="main-home" class="col d-flex flex-column justify-content-center align-items-center">
					<div class="gap-3">
					  <button class="btn btn-primary btn-game-init btn-lg" type="button"><i class="fa-solid fa-dice-one"></i> Local</button>
					  <button class="btn btn-primary btn-game-init btn-lg" type="button"><i class="fa-solid fa-dice"></i> Tournament</button>
					</div>
                </div>
              </div>
            </div>
          </div>
        `;
    this.element.innerHTML = view;
  }
}
