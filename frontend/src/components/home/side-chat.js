import Component from "../../library/component.js";

export default class SideChat extends Component {
  constructor(friendUsername) {
      super({ element: document.getElementById("side-chat") });
      this.friendUsername = friendUsername;
      this.socket = null;
      this.render();
  }

  async render() {
      const view = /*html*/ `
          <div class="gap-3 row chat-messages overflow-auto flex-grow-1">
              <!-- Messages will be dynamically loaded here -->
          </div>
          <div id="chat-input-messages" class="gap-4 d-flex flex-grow-0">
              <input type="text" id="message-input" class="form-control" placeholder="Message" />
              <button id="send-message" class="btn btn-primary rounded-circle"><i id="icon-send" class="fa-regular fa-paper-plane"></i></button>
          </div>
      `;

      this.element = document.getElementById("side-chat");
      this.element.innerHTML = view;
      this.initializeChat();
  }

  initializeChat() {
    this.socket = new WebSocket(`ws://localhost:8069/ws/chat/${this.friendUsername}/?username=${this.currentUsername}`);

    this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.addMessage(data.username, data.message);
    };

    this.socket.onclose = () => {
        console.error('Chat socket closed unexpectedly');
    };

    document.querySelector("#send-message").addEventListener("click", () => {
        const messageInputDom = document.querySelector("#message-input");
        const message = messageInputDom.value;
        this.socket.send(JSON.stringify({
            'username': this.currentUsername, // Send the actual username
            'message': message
        }));
        messageInputDom.value = '';
    });
}

addMessage(username, message) {
  const messagesContainer = this.element.querySelector('.chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', username === this.currentUsername ? 'my-message' : 'other-message');
  messageElement.innerHTML = `
      <div>
          <div class="chat-name">${username}</div>
          <div class="chat-text">${message}</div>
      </div>
  `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
}
}
