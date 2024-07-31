import Component from "../../library/component.js";
import state from "../../store/state.js";
import {chatInsertMessage, fetchChatHistory} from "../../utils/chatUtils.js";
import {get_messages} from "../../utils/apiutils.js";

export default class SideChat extends Component {
    constructor() {
        super({ element: document.getElementById("side-chat") });
        this.render();
    }

    async render() {

        const view = /*html*/ `
            <div id="messages-container" class="gap-3 row chat-messages overflow-auto flex-grow-1">
              <!-- Messages go here -->
            </div>
            <div id="chat-input-messages" class="gap-4 d-flex flex-grow-0">
              <input type="text" id="message-input" class="form-control" placeholder="Message" />
              <button onclick="sendMessage()" id="send-message" class="btn btn-primary rounded-circle"><i id="icon-send" class=" fa-regular fa-paper-plane"></i></button>
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
        window.fetchChatHistory = fetchChatHistory;
        window.sendMessage = function () {
            //alert('lol');
            //console.log(store.state.socket);
            let msg = document.getElementById("message-input").value.trim();
            if (msg.length == 0) {
                return;
            }
            let friend_name = document.getElementById("side-chat").getAttribute("data-username");
            console.log(`sending message '${msg}' to user ${friend_name}`);
            state.socket.send(JSON.stringify({"func": "direct_message", "friend_username": friend_name, "message": msg}));
            document.getElementById("message-input").value = '';
            chatInsertMessage("You", msg);
        }
    }
}
