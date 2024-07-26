import NavBar from '../components/home/navbar.js';
import SideBlockedList from '../components/home/side-blocked-list.js';
import SideChat from '../components/home/side-chat.js';
import SideFriendList from '../components/home/side-friend-list.js';
import Component from "../library/component.js";
import { navigateTo } from "../utils/router.js";

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
						<button type="button" id="btn-toggle-pending" class="btn btn-primary">Pending</button>
						<button type="button" id="btn-toggle-blocked" class="btn btn-primary">Blocked</button>
					</div>
                    <div id="side-chat" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-friend-list" class="d-flex flex-column h-100 gap-3"></div>
					<div id="side-blocked-list" class="d-none flex-column h-100 gap-3"></div>
                  </div>
                </div>
                <div id="main-home" class="col d-flex flex-column justify-content-center align-items-center">
					<div class="gap-3">
					  <button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#local-game-modal" type="button"><i class="fa-solid fa-dice-one"></i> Local</button>
					  <button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#tournament-game-modal" type="button"><i class="fa-solid fa-dice"></i> Tournament</button>
					</div>
                </div>
              </div>
            </div>
          </div>

		<!-- Modal Local Game -->
		<div class="modal" id="local-game-modal" tabindex="-1">
		  <div class="modal-dialog modal-dialog-centered">
		    <div class="modal-content">
			<form class="">
		    	<div class="modal-header">
		        	<h5 class="modal-title" id="modalVerticallyCenteredLabel">Settings of the Game</h5>
		        	<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		      	</div>
		    	<div class="modal-body">
					<div class="p-3">
						<div class="form-check form-switch">
							<label class="form-check-label" for="formSwitchCheckLocal">Fast Ball Speed</label>
							<input class="form-check-input" type="checkbox" id="formSwitchCheckLocal" aria-describedby="speedBallCheckLocal">
						</div>
						<div id="speedBallCheckLocal" class="form-text ">By default the speed of the ball is set to normal</div>
					</div>
					<div class="p-3">
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" aria-describedby="inlineRadioLocalColors" id="radio-color-black" value="black" checked>
						  <label class="form-check-label" for="radio-local-color-black">Black</label>
						</div>
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-local-color-blue" value="blue">
						  <label class="form-check-label" for="radio-color-blue">Blue</label>
						</div>
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-local-color-red" value="red">
						  <label class="form-check-label" for="radio-color-blue">Red</label>
						</div>
						<div id="inlineRadioLocalColors" class="mb-3 form-text ">By default color of the ball is set to Black</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
						<button id="btn-play-local" type="button" class="btn btn-success">Play</button>
					</div>
				</form>
		    </div>
		  </div>
		</div>
		<!-- Modal Tournament Game -->	
		<div class="modal" id="tournament-game-modal" tabindex="-1">
		  <div class="modal-dialog modal-dialog-centered">
		    <div class="modal-content">
			<form class="">
		      <div class="modal-header">
		        <h5 class="modal-title" id="modalVerticallyCenteredLabel">Settings of the Game</h5>
		        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		      </div>
		      <div class="modal-body">
					<div class="p-3">
				    	<label for="input-Tournament" class="form-label">Nickname</label>
				    	<input type="text" class="form-control" id="input-nickname" aria-describedby="nickName" required>
				    	<div id="nickName" class="form-text">Please enter a Nickname for the tournament</div>
					</div>
					<div class="p-3">
						<div class="form-check form-switch">
							<label class="form-check-label" for="formSwitchCheckTournament">Fast Ball Speed</label>
							<input class="form-check-input" type="checkbox" id="formSwitchCheckTournament" aria-describedby="speedBallCheckTournament">
						</div>
						<div id="speedBallCheckTournament" class="form-text ">By default the speed of the ball is set to normal</div>
					</div>
					<div class="p-3">
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" aria-describedby="inlineRadioColorsTournament" id="radio-tournament-color-black" value="black" checked>
						  <label class="form-check-label" for="radio-tournament-color-black">Black</label>
						</div>
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-tournament-color-blue" value="blue">
						  <label class="form-check-label" for="radio-color-blue">Blue</label>
						</div>
						<div class="form-check form-check-inline">
						  <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-tournament-color-red" value="red">
						  <label class="form-check-label" for="radio-color-blue">Red</label>
						</div>
						<div id="inlineRadioColorsTournament" class="mb-3 form-text ">By default color of the ball is set to Black</div>
					</div>
			  </div>
		      <div class="modal-footer">
				<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
		    	<button id="btn-play-tournament" type="submit" class="px-2 btn btn-success">Play</button>
		      </div>
			<form>
		    </div>
		  </div>
		</div>
        `;
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {


		

		this.element.querySelector("#btn-play-local").addEventListener("click", async (event) => {
			event.preventDefault();
			const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
			const speed = document.getElementById('formSwitchCheckTournament').checked;
			const game = {
				color: colorRadio.value,
				speed: speed
			};

			localStorage.setItem("local-game", JSON.stringify(game));

			navigateTo("/local-game");
		});

		this.element.querySelector("#btn-play-tournament").addEventListener("click", async (event) => {
			event.preventDefault();
			const nickname = document.getElementById('input-nickname').value;
			const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
			const speed = document.getElementById('formSwitchCheckTournament').checked;
			const game = {
				nickname: nickname,
				color: colorRadio.value,
				speed: speed
			};
			console.log(game);
			navigateTo("/tournament-game");
		});

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
/*
		this.element.querySelector("#btn-toggle-pending").addEventListener("click", async (event) => {
			event.preventDefault();
			var sideChat = document.getElementById('side-chat');
			var blockedList = document.getElementById('side-blocked-list');
			var friendlist = document.getElementById('side-friend-list');
			var pendinglist = document.getElementById('side-pending-list');
			var btnBlocked = document.getElementById('btn-toggle-blocked');
			var btnPending = document.getElementById('btn-toggle-pending');
			var btnFriends = document.getElementById('btn-toggle-friends');

			if (pendinglist.classList.contains('d-none')) {
				friendlist.classList.remove('d-none');
				btnBlocked.classList.remove('active');
				friendlist.classList.add('d-flex');
				blockedList.classList.remove('d-flex');
				blockedList.classList.add('d-none');
				sideChat.classList.remove('d-flex');
				sideChat.classList.add('d-none');
				btnFriends.classList.add('active');
			}
		}); */
	}
}
