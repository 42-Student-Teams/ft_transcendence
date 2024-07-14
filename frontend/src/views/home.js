import NavBar from '../components/home/navbar.js';
import SideChat from '../components/home/side-chat.js';
import SideFriendList from '../components/home/side-friend-list.js';
import SideBlockedList from '../components/home/side-blocked-list.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      sideChat: new SideChat(),
	  sideFriendList: new SideFriendList(),
	  sideBlockedList: new SideBlockedList(),
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
                <div id="" class="chat-flex col bg-white h-100 d-flex flex-column collapse collapse">
                  <div class="d-flex flex-column h-100 gap-4 p-4 overflow-auto ">
                    <div class="btn-group" role="group" aria-label="Basic button group">
  						<button type="button" id="btn-toggle-friends" class="btn btn-primary active">Friends</button>
  						<button type="button" id="btn-toggle-blocked" class="btn btn-primary">Blocked</button>
					</div>
                    <div id="side-chat" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-friend-list" class="d-flex flex-column h-100 gap-3"></div>
					<div id="side-blocked-list" class="d-none flex-column h-100 gap-3"></div>
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

		<!-- Modal -->
			<div class="modal" id="local-game-modal" tabindex="-1">
			  <div class="modal-dialog modal-dialog-centered">
			    <div class="modal-content">
			      <div class="modal-header">
			        <h5 class="modal-title" id="modalVerticallyCenteredLabel">Block</h5>
			        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			      </div>
			      <div class="modal-body">
				  	Are you sure you want to block this <b>user</b> ?<br/>Blocking this user will also remove them from your friends list
				  </div>
			      <div class="modal-footer">
				   <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
			        <button type="button" class="btn btn-danger">Block</button>
			      </div>
			    </div>
			  </div>
			</div>

			<div class="modal" id="Tournament-game-modal" tabindex="-1">
			  <div class="modal-dialog modal-dialog-centered">
			    <div class="modal-content">
			      <div class="modal-header">
			        <h5 class="modal-title" id="modalVerticallyCenteredLabel">Block</h5>
			        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			      </div>
			      <div class="modal-body">
				  	Are you sure you want to block this <b>user</b> ?<br/>Blocking this user will also remove them from your friends list
				  </div>
			      <div class="modal-footer">
				   <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
			        <button type="button" class="btn btn-danger">Block</button>
			      </div>
			    </div>
			  </div>
			</div>
        `;
    this.element.innerHTML = view;
	this.handleEvent();
  }

  async handleEvent() {
		this.element.querySelector("#btn-toggle-blocked").addEventListener("click", async (event) => {
				event.preventDefault();
				var blockedList = document.getElementById('side-blocked-list');
				var sideChat = document.getElementById('side-chat');
				var friendlist = document.getElementById('side-friend-list');
				var btnBlocked = document.getElementById('btn-toggle-blocked');
				var btnFriends = document.getElementById('btn-toggle-friends');
				
				if (blockedList.classList.contains('d-none')) {
					blockedList.classList.remove('d-none');
					blockedList.classList.add('d-flex');
					btnBlocked.classList.add('active');
					friendlist.classList.remove('d-flex');
					friendlist.classList.add('d-none');
					btnFriends.classList.remove('active');
					sideChat.classList.remove('d-flex');
					sideChat.classList.add('d-none');
				}
			});
			
			this.element.querySelector("#btn-toggle-friends").addEventListener("click", async (event) => {
			event.preventDefault();
			var sideChat = document.getElementById('side-chat');
			var blockedList = document.getElementById('side-blocked-list');
			var friendlist = document.getElementById('side-friend-list');
			var btnBlocked = document.getElementById('btn-toggle-blocked');
			var btnFriends = document.getElementById('btn-toggle-friends');

			if (friendlist.classList.contains('d-none')) {
				friendlist.classList.remove('d-none');
				btnBlocked.classList.remove('active');
				friendlist.classList.add('d-flex');
				blockedList.classList.remove('d-flex');
				blockedList.classList.add('d-none');
				sideChat.classList.remove('d-flex');
				sideChat.classList.add('d-none');
				btnFriends.classList.add('active');
			}
		});


	}
}
