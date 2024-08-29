import Component from "../../library/component.js";
import {insertNewMessage} from "../../utils/chatUtils.js";
import {wsSend} from "../../utils/wsUtils.js";
import { home } from "../../utils/langPack.js";
import store from "../../store/index.js";
import {navigateTo} from "../../utils/router.js";

export default class SideChat extends Component {
    constructor() {
        super({ element: document.getElementById("side-chat") });
        this.currentLang = store.state.language;
        this.render();

        store.events.subscribe('stateChange', () => {
            if (this.currentLang !== store.state.language) {
                this.currentLang = store.state.language;
                this.render();
            }
        });

        window.joinGame = function(button) {
            let author_name = document.getElementById("side-chat").getAttribute("data-username");
            console.log(`Fetching info about game request for author ${author_name}`);

            const jwt = localStorage.getItem("jwt");
            const apiurl = process.env.API_URL;

            fetch(`${apiurl}/match_available?author=${author_name}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch match request info');
                }
                return response.json();
            })
            .then(data => {
                if ('available' in data && data['available'] === 'true') {
                    console.log('Match available');
                    const game = {
                        color: null,
                        speed: null,
                        ai : false,
                        search_for_game: true,
                        joining_author: author_name,
                    };
                    store.dispatch("setCurrentGameData", game);
                    navigateTo("/local-game");
                } else {
                    button.innerText = 'Invitation expired';
                }
            })
            .catch(error => {
                console.error(error);
            });
        };
    }

    async render() {
        const langPack = home[this.currentLang];
        const view = /*html*/ `
            <div id="messages-container" class="gap-3 row chat-messages overflow-auto flex-grow-1">
                <!-- Messages go here -->
            </div>
            <div id="chat-input-messages" class="gap-4 d-flex flex-grow-0">
                <input type="text" id="message-input" class="form-control" placeholder="${langPack.messagePlaceholder}" />
                <button onclick="sendMessage()" id="send-message" class="btn btn-primary rounded-circle">
                    <i id="icon-send" class="fa-regular fa-paper-plane"></i>
                </button>
                <button onclick="sendInvite()" id="send-invite" class="btn btn-primary rounded-circle">
                    <i id="icon-send" class="fa-solid fa-gamepad"></i>
                </button>
            </div>
        `;
        this.element = document.getElementById("side-chat");
        this.element.innerHTML = view;
        document.getElementById("message-input").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                window.sendMessage();
            }
        });
        this.handleEvent();
    }

    async handleEvent() {
        window.sendMessage = (override_message=null) => {
            const langPack = home[this.currentLang];
            let msg = document.getElementById("message-input").value.trim();
            if (override_message) {
                msg = override_message;
            }
            if (msg.length == 0) {
                return;
            }
            let friend_name = document.getElementById("side-chat").getAttribute("data-username");
            console.log(`sending message '${msg}' to user ${friend_name}`);
            wsSend('direct_message', {"friend_username": friend_name, "message": msg});
            if (!override_message) {
                document.getElementById("message-input").value = '';
            }
            //chatInsertMessage(langPack.you, msg);
            insertNewMessage(msg, langPack.you);
        }

        window.sendInvite = () => {
            let friend_name = document.getElementById("side-chat").getAttribute("data-username");
            const game = {
					color: 'black',
					speed: false,
					ai: false,
					search_for_game: false,
                    opponent_username: friend_name,
				};
				store.dispatch("setCurrentGameData", game);
				localStorage.setItem('local-game', JSON.stringify(game));
				sendMessage('!match_request');
                navigateTo("/local-game");
        }
    }
}
