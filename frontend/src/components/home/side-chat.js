import Component from "../../library/component.js";

export default class SideChat extends Component {
    constructor() {
        super({ element: document.getElementById("layoutSidenav_nav") });
        this.render();
    }

    async render() {

        const view = /*html*/ `

            <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div class="sb-sidenav-menu">
                    <div class="nav">
                            <div class="container-fluid">
                                <div class="d.none chat-screen">
                                  <div class="header">
                                    <div class="logo">Chatroom</div>
                                  </div>
                                  <div class="messages">
                                    <div class="message my-message">
                                      <div>
                                        <div class="chat-name">You</div>
                                        <div class="chat-text">Hi</div>
                                      </div>
                                    </div>
                                    <div class="update">Abc joined the conversation</div>
                                    <div class="message other-message">
                                        <div>
                                            <div class="chat-name">Abc</div>
                                            <div class="chat-text">Hi</div>
                                        </div>
                                    </div>
                                  </div>
                                  <div class="typebox">
                                    <input type="text" id="message-input" placeholder="Enter message" />
                                    <button id="send-message"><i id="icon-send" class="fa-regular fa-paper-plane"></i></button>
                                  </div>
                                </div>
                            </div>
                    </div>
                </div>
            </nav>
        `;

        this.element = document.getElementById("layoutSidenav_nav");
        this.element.innerHTML = view;
    }
}
