import NavBar from '../components/home/navbar.js';
import SideBlockedList from '../components/home/side-blocked-list.js';
import SideChat from '../components/home/side-chat.js';
import SideFriendList from '../components/home/side-friend-list.js';
import SidePendingList from '../components/home/side-pending-list.js';
import Component from "../library/component.js";
import { refreshList } from '../utils/refresh.js';
import { navigateTo } from "../utils/router.js";

export default class Home extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.render();

		this.components = {
			navBar: new NavBar(),
			sideChat: new SideChat(),
			sideFriendList: new SideFriendList(),
			sidePendingList: new SidePendingList(),
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
					<div id="side-pending-list" class="d-none flex-column h-100 gap-3"></div>
                  </div>
                </div>
                <div id="main-home" class="col d-flex flex-column justify-content-center align-items-center">
					<div class="d-flex gap-4">
					  <button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#local-game-modal" type="button"><i class="fa-solid fa-dice-one"></i> Online</button>
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
						<div id="inlineRadioLocalColors" class="form-text ">By default color of the ball is set to Black</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
						<button id="btn-play-local" type="button" data-bs-dismiss="modal" class="btn btn-success">Play</button>
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
						<div id="inlineRadioColorsTournament" class="form-text">By default color of the ball is set to Black</div>
					</div>
					<div class="p-3 d-flex flex-column" id="ia-players">
						<label class="form-label">AI Players</label>
						<div id="no-ai-players" class="form-text">No AI players added. Add some !</div>
					</div>
					<div class="p-3">
				    	<label for="input-ai" class="form-label">AI Nickname</label>
						<div class="d-flex gap-2 justify-content-between">
				    		<input type="text" class="form-control" id="input-ai-nickname" aria-describedby="ai-nickName" required>
							<button id="btn-add-ai-player" type="button" class="btn btn-add-ai" ><i class="fa-solid fa-plus"></i></button>
						</div>
				    	<div id="nickName" class="form-text">Please enter a Nickname for the AI</div>
					</div>
			  </div>
		      <div class="modal-footer">
				<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
		    	<button id="btn-play-tournament" type="submit" data-bs-dismiss="modal" class="px-2 btn btn-success">Play</button>
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
		const iaPlayersContainer = this.element.querySelector("#ia-players");
		const btnAddAiPlayer = this.element.querySelector("#btn-add-ai-player");
		const noAiPlayersMessage = this.element.querySelector("#no-ai-players");
		const aiNicknames = new Set();

		const updateNoAiPlayersMessage = () => {
			if (iaPlayersContainer.children.length === 2) { // Only the "No AI players" message
				noAiPlayersMessage.style.display = 'block';
			} else {
				noAiPlayersMessage.style.display = 'none';
			}
		};

		btnAddAiPlayer.addEventListener("click", (event) => {
			event.preventDefault();
			const aiNicknameInput = this.element.querySelector("#input-ai-nickname");
			const nickname = aiNicknameInput.value.trim();

			if (nickname === "") {
				alert("AI nickname cannot be empty.");
				return;
			}

			if (aiNicknames.has(nickname)) {
				console.log("This AI nickname is already used. Please choose another one.");
				return ;
			}

			const aiPlayerDiv = document.createElement("div");
			aiPlayerDiv.className = "d-flex align-items-center ia-player-display";
			aiPlayerDiv.innerHTML = `
            	<h1 class="fs-5 flex-fill">${nickname}</h1>
            	<button class="btn rounded btn-unblock btn-remove-ai-player"><i class="fa-solid fa-user-minus"></i></button>
			`;

			iaPlayersContainer.appendChild(aiPlayerDiv);
			aiNicknames.add(nickname);

			// Add event listener to the remove button
			const removeButton = aiPlayerDiv.querySelector(".btn-remove-ai-player");
			removeButton.addEventListener("click", () => {
				iaPlayersContainer.removeChild(aiPlayerDiv);
				aiNicknames.delete(nickname);
				updateNoAiPlayersMessage();
			});

			// Clear the input field
			aiNicknameInput.value = "";

			updateNoAiPlayersMessage();
		});

		updateNoAiPlayersMessage();

		this.element.querySelector("#btn-play-local").addEventListener("click", async (event) => {
			event.preventDefault();
			const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
			const speed = document.getElementById('formSwitchCheckTournament').checked;
			const game = {
				color: colorRadio.value,
				speed: speed
			};
			console.log(game);

			//document.getElementById('local-game-modal').hide();
			navigateTo("/local-game");
		});

		this.element.querySelector("#btn-play-tournament").addEventListener("click", async (event) => {
			event.preventDefault();
			const nickname = document.getElementById('input-nickname').value;
			const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
			const speed = document.getElementById('formSwitchCheckTournament').checked;
			const aiPlayers = Array.from(aiNicknames);

			const game = {
				Nickname: nickname,
				Color: colorRadio.value,
				Speed: speed,
				AiPlayers: aiPlayers
			};

			console.log(game);
			navigateTo("/tournament-game");
		});

		// Helper function to toggle visibility
		function toggleVisibility(activeList, buttonToActivate, lists, buttons) {
			lists.forEach(list => {
				if (list === activeList) {
					list.classList.remove('d-none');
					list.classList.add('d-flex');
				} else {
					list.classList.remove('d-flex');
					list.classList.add('d-none');
				}
			});

			buttons.forEach(button => {
				if (button === buttonToActivate) {
					button.classList.add('active');
				} else {
					button.classList.remove('active');
				}
			});
		}

		this.element.querySelector("#btn-toggle-blocked").addEventListener("click", async (event) => {
			event.preventDefault();

			var sideChat = document.getElementById('side-chat');
			var pendingList = document.getElementById('side-pending-list');
			var blockedList = document.getElementById('side-blocked-list');
			var friendlist = document.getElementById('side-friend-list');
			var btnBlocked = document.getElementById('btn-toggle-blocked');
			var btnFriends = document.getElementById('btn-toggle-friends');
			var btnPending = document.getElementById('btn-toggle-pending');
			toggleVisibility(blockedList, btnBlocked, [friendlist, pendingList, sideChat, blockedList], [btnFriends, btnPending, btnBlocked]);
			refreshList('blocked');
		});

		this.element.querySelector("#btn-toggle-friends").addEventListener("click", async (event) => {
			event.preventDefault();

			var sideChat = document.getElementById('side-chat');
			var pendingList = document.getElementById('side-pending-list');
			var blockedList = document.getElementById('side-blocked-list');
			var friendlist = document.getElementById('side-friend-list');
			var btnBlocked = document.getElementById('btn-toggle-blocked');
			var btnFriends = document.getElementById('btn-toggle-friends');
			var btnPending = document.getElementById('btn-toggle-pending');
			toggleVisibility(friendlist, btnFriends, [friendlist, pendingList, sideChat, blockedList], [btnFriends, btnPending, btnBlocked]);
			refreshList('friend');
		});

		this.element.querySelector("#btn-toggle-pending").addEventListener("click", async (event) => {
			event.preventDefault();

			var sideChat = document.getElementById('side-chat');
			var pendingList = document.getElementById('side-pending-list');
			var blockedList = document.getElementById('side-blocked-list');
			var friendlist = document.getElementById('side-friend-list');
			var btnBlocked = document.getElementById('btn-toggle-blocked');
			var btnFriends = document.getElementById('btn-toggle-friends');
			var btnPending = document.getElementById('btn-toggle-pending');
			toggleVisibility(pendingList, btnPending, [friendlist, pendingList, sideChat, blockedList], [btnFriends, btnPending, btnBlocked]);
			refreshList('pending');
		});

	}
}
