import NavBar from '../components/home/navbar.js';
import { showToast } from "../utils/toastUtils.js";
import SideBlockedList from '../components/home/side-blocked-list.js';
import SideChat from '../components/home/side-chat.js';
import SideFriendList from '../components/home/side-friend-list.js';
import SidePendingList from '../components/home/side-pending-list.js';
import Component from "../library/component.js";
import { navigateTo } from "../utils/router.js";
import store from "../store/index.js";
import state from "../store/state.js";
import { MAX_AI_PLAYERS } from "../utils/enum.js";
import * as bootstrap from 'bootstrap';
import { home } from "../utils/langPack.js";


export default class Home extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.currentLang = store.state.language; // Ajout de la langue courante
		store.events.subscribe("stateChange", () => this.onStateChange()); // Abonnement aux changements d'état
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
		const langPack = home[this.currentLang]; // Utilisation du pack de langue pour la page d'accueil

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
                        <button type="button" id="btn-toggle-friends" class="btn btn-primary active">${langPack.friends}</button>
                        <button type="button" id="btn-toggle-pending" class="btn btn-primary">${langPack.pending}</button>
                        <button type="button" id="btn-toggle-blocked" class="btn btn-primary">${langPack.blocked}</button>
                    </div>
                    <div id="side-chat" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-friend-list" class="d-flex flex-column h-100 gap-3"></div>
                    <div id="side-blocked-list" class="d-none flex-column h-100 gap-3"></div>
                    <div id="side-pending-list" class="d-none flex-column h-100 gap-3"></div>
                  </div>
                </div>
                <div id="main-home" class="col d-flex flex-column justify-content-center align-items-center">
                    <div class="d-flex gap-4">
                        <button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#local-game-modal" type="button"><i class="fa-solid fa-dice-one"></i> ${langPack.online}
                        </button>
                         <button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#tournament-join-game-modal" type="button">
                            <i class="fa-solid fa-users"></i> ${langPack.joinTournament}
						</button>
						<button id="local-game-btn" class="btn btn-primary btn-game-init btn-lg" type="button">
                            <i class="fa-solid fa-users"></i> ${langPack.localGame}
						</button>
						<button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#local-game-modal" type="button">
							<i class="fa-solid fa-dice-one"></i> ${langPack.createGame} (J)
						</button>
						<button class="btn btn-primary btn-game-init btn-lg" type="button" id="join-game-btn"><i class="fa-solid fa-dice-one">
							</i> ${langPack.lookForGame} (J)
						</button>
					  	<button class="btn btn-primary btn-game-init btn-lg" data-bs-toggle="modal" data-bs-target="#tournament-game-modal" type="button">
					  		<i class="fa-solid fa-dice"></i> ${langPack.createTournament} (J)
						</button>
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
                    <h5 class="modal-title" id="modalVerticallyCenteredLabel">${langPack.settingsGameTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="p-3">
                        <div class="form-check form-switch">
                            <label class="form-check-label" for="formSwitchCheckLocal">${langPack.fastBallSpeed}</label>
                            <input class="form-check-input" type="checkbox" id="formSwitchCheckLocal" aria-describedby="speedBallCheckLocal">
                        </div>
                        <div id="speedBallCheckLocal" class="form-text ">${langPack.fastBallSpeedDescription}</div>
                    </div>
                    <div class="p-3">
                        <div class="form-check form-switch">
                            <label class="form-check-label" for="formAiCheckLocal">${langPack.aiOpponent}</label>
                            <input class="form-check-input" type="checkbox" id="formAiCheckLocal" aria-describedby="AiCheckLocal">
                        </div>
                        <div id="AiCheckLocal" class="form-text ">${langPack.aiOpponentDescription}</div>
                    </div>
                    <div class="p-3">
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="radioColorOptions" aria-describedby="inlineRadioLocalColors" id="radio-color-black" value="black" checked>
                          <label class="form-check-label" for="radio-local-color-black">${langPack.black}</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-local-color-blue" value="blue">
                          <label class="form-check-label" for="radio-color-blue">${langPack.blue}</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="radioColorOptions" id="radio-local-color-red" value="red">
                          <label class="form-check-label" for="radio-color-blue">${langPack.red}</label>
                        </div>
                        <div id="inlineRadioLocalColors" class="form-text ">${langPack.ballColorDescription}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">${langPack.cancel}</button>
                    <button id="btn-play-local" type="button" data-bs-dismiss="modal" class="btn btn-success">${langPack.play}</button>
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
			<h5 class="modal-title" id="modalVerticallyCenteredLabel">${langPack.settingsGameTitle}</h5>
			<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		</div>
		<div class="modal-body">
				<div class="p-3">
					<label for="input-Tournament" class="form-label">${langPack.nickname}</label>
					<input type="text" class="form-control" id="input-nickname" aria-describedby="nickName" required>
					<div id="nickName" class="form-text">${langPack.enterNicknameForTournament}</div>
				</div>
				<div class="p-3">
					<div class="form-check form-switch">
						<label class="form-check-label" for="formSwitchCheckTournament">${langPack.fastBallSpeed}</label>
						<input class="form-check-input" type="checkbox" id="formSwitchCheckTournament" aria-describedby="speedBallCheckTournament">
					</div>
					<div id="speedBallCheckTournament" class="form-text">${langPack.fastBallSpeedDescription}</div>
				</div>
				<div class="p-3">
					<div class="form-check form-check-inline">
					<input class="form-check-input" type="radio" name="radioColorOptions" aria-describedby="inlineRadioColorsTournament" id="radio-tournament-color-black" value="black" checked>
					<label class="form-check-label" for="radio-tournament-color-black">${langPack.black}</label>
					</div>
					<div class="form-check form-check-inline">
					<input class="form-check-input" type="radio" name="radioColorOptions" id="radio-tournament-color-blue" value="blue">
					<label class="form-check-label" for="radio-color-blue">${langPack.blue}</label>
					</div>
					<div class="form-check form-check-inline">
					<input class="form-check-input" type="radio" name="radioColorOptions" id="radio-tournament-color-red" value="red">
					<label class="form-check-label" for="radio-color-blue">${langPack.red}</label>
					</div>
					<div id="inlineRadioColorsTournament" class="form-text">${langPack.ballColorDescription}</div>
				</div>
				<div class="p-3 d-flex flex-column" id="ia-players">
					<label class="form-label">${langPack.aiPlayers}</label>
					<div id="no-ai-players" class="form-text">${langPack.noAiPlayersAdded}</div>
				</div>
				<div class="p-3">
					<label for="input-ai" class="form-label">${langPack.aiNickname}</label>
					<div class="d-flex gap-2 justify-content-between">
						<input type="text" class="form-control" id="input-ai-nickname" aria-describedby="ai-nickName" required>
						<button id="btn-add-ai-player" type="button" class="btn btn-add-ai" ><i class="fa-solid fa-plus"></i></button>
					</div>
					<div id="nickName" class="form-text">${langPack.enterNicknameForAi}</div>
				</div>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">${langPack.cancel}</button>
			<button id="btn-play-tournament" type="submit" data-bs-dismiss="modal" class="px-2 btn btn-success">${langPack.play}</button>
		</div>
		</form>
		</div>
	</div>
	</div>


	<!-- Modal Join Tournament -->	
	<div class="modal" id="tournament-join-game-modal" tabindex="-1">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<h5 class="modal-title" id="modalVerticallyCenteredLabel">${langPack.settingsGameTitle}</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="p-3">
							<label for="input-join-nickname" class="form-label">${langPack.nickname}</label>
							<input type="text" class="form-control" id="input-join-nickname" aria-describedby="nickName" required>
							<div id="nickNameJoin" class="form-text">${langPack.enterNicknameForTournament}</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">${langPack.cancel}</button>
						<button id="btn-join-tournament" type="submit" data-bs-dismiss="modal" class="px-2 btn btn-success">${langPack.next}</button>
					</div>
				</form>
			</div>
		</div>
	</div>
        `;
		this.element.innerHTML = view;
		this.handleEvent();
	}


	async handleEvent() {
		const langPack = home[this.currentLang];
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
			if (aiNicknames.size >= MAX_AI_PLAYERS) {
				showToast(`${langPack.aiMaxPlayers}`, "danger");
				aiNicknameInput.value = "";
				return;
			}

			if (nickname === "") {
				showToast(`${langPack.aiNicknameCannotBeEmpty}`, "danger");
				return;
			}

			if (aiNicknames.has(nickname)) {
				showToast(`${langPack.aiNicknameAlreadyUsed}`, "danger");
				aiNicknameInput.value = "";
				return;
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

		if (this.element.querySelector("#btn-play-local")) {

			this.element.querySelector("#btn-play-local").addEventListener("click", async (event) => {
				event.preventDefault();
				const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
				const speed = document.getElementById('formSwitchCheckLocal').checked;
				const ai = document.getElementById('formAiCheckLocal').checked;
				const game = {
					color: colorRadio.value,
					speed: speed,
					ai: ai,
					search_for_game: false,
				};
				if (state.currentGameData && 'opponent_username' in state.currentGameData) {
					game['opponent_username'] = state.currentGameData['opponent_username'];
				}
				store.dispatch("setCurrentGameData", game);
				//console.log(game);
				localStorage.setItem('local-game', JSON.stringify(game));
				navigateTo("/local-game");
			});
		}

		if (this.element.querySelector("#btn-play-tournament")) {
			this.element.querySelector("#btn-play-tournament").addEventListener("click", async (event) => {
				event.preventDefault();
				const nickname = document.getElementById('input-nickname').value;
				const colorRadio = document.querySelector('input[name="radioColorOptions"]:checked');
				const speed = document.getElementById('formSwitchCheckTournament').checked;
				const aiPlayers = Array.from(aiNicknames);

				// From here added code for the tournament toast
				if (!nickname) {
					showToast(`${langPack.emptyNicknameError}`, "danger");
					return;
				}

				if (aiNicknames.has(nickname)) {
					showToast(`${langPack.invalidNicknameInput}`, "danger");
					// clear the input field
					document.getElementById('input-nickname').value = "";
					return;
				}

				const game = {
					author_nickname: nickname,
					ball_color: colorRadio.value,
					fast: speed,
					bot_list: aiPlayers,
					name: `${nickname}'s tournament`,
					all_participants_count: 4,

				};

				try {
					const response = await this.postTournamentData(game);
					//clear all the ai players
					iaPlayersContainer.innerHTML = "";
					aiNicknames.clear();
					updateNoAiPlayersMessage();
					document.getElementById('input-nickname').value = "";
					if (response.status !== 200) {
						const errorData = await response.json();
						throw new Error(`${errorData.message}`);
					}
					//navigateTo("/tournament-game");
				} catch (error) {
					console.log(error.message);
					if (error.message === "User already has a tournament")
						showToast(`${langPack.userAlreadyHasTournament}`, "danger");
					else
						showToast(`${langPack.serverError}`, "danger");
				}
			});
		}

		if (this.element.querySelector("#btn-join-tournament")) {

			this.element.querySelector("#btn-join-tournament").addEventListener("click", async (event) => {
				event.preventDefault();
				const nickname = document.getElementById('input-join-nickname').value;

				// From here added code for the tournament toast
				if (!nickname) {
					showToast(`${langPack.emptyNicknameError}`, "danger");
					return;
				}

				const data = {
					nickname: nickname,
				};

				try {
					const response = await this.postJoinTournament(data);
					console.log(response);
					if (response.status !== 200)
					{
						const errorData = await response.json();
						throw new Error(`${errorData.message}`);
					}

					//navigateTo("/tournament-game");
				} catch (error) {
					console.log(error.message);
					if (error.message === "Bad nickname")
						showToast(`${langPack.badNicknameTournament}`, "danger");
					else if (error.message === "User already has a tournament")
						showToast(`${langPack.userAlreadyHasTournament}`, "danger");
					else
						showToast(`${langPack.serverError}`, "danger");
				}
			});
		}

		//if (document.querySelector("#local-game-btn")) {

		/*document.querySelector("#local-game-btn").addEventListener("click", (event) => {
			event.preventDefault();
			console.log('Navigating to local game');
		});*/
		//}

		if (this.element.querySelector("#local-game-btn")) {
			this.element.querySelector("#local-game-btn").addEventListener("click", async (event) => {
				event.preventDefault();
				navigateTo("/2player-local");
			});
		}
		// backend interaction, essaie
		// 	try {
		// 		// Make a real API call to post tournament data
		// 		const response = await this.postTournamentData(game);
		// 		if (response.ok) {
		// 			showToast("Tournament created successfully!", "success");
		// 			navigateTo("/tournament-game");
		// 		} else {
		// 			const errorData = await response.json();
		// 			showToast(errorData.message || "Error creating tournament.", "danger");
		// 		}
		// 	} catch (error) {
		// 		console.error("Error:", error);
		// 		showToast("Server error. Please try again.", "danger");
		// 	}
		// });

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



		if (this.element.querySelector("#btn-toggle-blocked")) {
			this.element.querySelector("#btn-toggle-blocked").addEventListener("click", async (event) => {
				event.preventDefault();

				var pendingList = document.getElementById('side-pending-list');
				var sideChat = document.getElementById('side-chat');
				var blockedList = document.getElementById('side-blocked-list');
				var friendlist = document.getElementById('side-friend-list');
				var btnBlocked = document.getElementById('btn-toggle-blocked');
				var btnFriends = document.getElementById('btn-toggle-friends');
				var btnPending = document.getElementById('btn-toggle-pending');
				toggleVisibility(blockedList, btnBlocked, [friendlist, pendingList, sideChat, blockedList], [btnFriends, btnPending, btnBlocked]);
			});
		}

		if (this.element.querySelector("#btn-toggle-friends")) {
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
			});
		}

		if (this.element.querySelector("#btn-toggle-pending")) {
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
			});
		}

		if (this.element.querySelector("#join-game-btn")) {
			this.element.querySelector("#join-game-btn").addEventListener("click", async (event) => {
				console.log('Join game button clicked');
				const game = {
					color: null,
					speed: null,
					ai: false,
					search_for_game: true,
				};
				store.dispatch("setCurrentGameData", game);
				navigateTo("/local-game");
			});
		}
	}


	async postTournamentData(gameData) {
		const langPack = home[store.state.language];
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/create_tournament`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(gameData)
			});
			return (response);
		} catch (error) {
			showToast(langPack.serverError, "danger");
			console.error(`Error:`, error);
		}
	}

	async postJoinTournament(gameData) {
		const langPack = home[store.state.language];
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/join_tournament`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(gameData)
			});
			return (response);
		} catch (error) {
			showToast(langPack.serverError, "danger");
			console.error(`Error:`, error);
		}
	}

	// // posting data tournament pour de vrai, esssaie
	// async postTournamentData(gameData) {
	//     const apiurl = 'https://localhost/backend'; // base URL for API
	//     const jwt = localStorage.getItem('jwt');

	//     try {
	//         const response = await fetch(`${apiurl}/tournament`, {
	//             method: 'POST',
	//             headers: {
	//                 'Authorization': `Bearer ${jwt}`,
	//                 'Content-Type': 'application/json'
	//             },
	//             body: JSON.stringify(gameData)
	//         });

	//         return response;
	//     } catch (error) {
	//         console.error("Error posting tournament data:", error);
	//         throw error;
	//     }
	// }

	async onStateChange() {
		if (this.currentLang !== store.state.language) {
			this.currentLang = store.state.language;
			this.render();
		}
	}
}