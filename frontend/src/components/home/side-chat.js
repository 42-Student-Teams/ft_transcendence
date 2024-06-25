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
                    <div id="nav-chat" class="nav">
                            <div id="chat-container" class="container-fluid">
                                <div id="chat-screen-container" class="chat-screen">
                                  <div class="header">
                                    <div class="logo">Chatroom</div>
                                  </div>
                                  <div id="chat-messages" class="messages">
                                    <div class="message my-message">
                                      <div>
                                        <div class="chat-name">You</div>
                                        <div class="chat-text">Hello !</div>
                                      </div>
                                    </div>
                                    <div class="update">PolonaisTresSerieux92 joined the conversation</div>
                                    <div class="message other-message">
                                        <div>
                                            <div class="chat-name">PolonaisTresSerieux92</div>
                                            <div class="chat-text">Hi! How are you?</div>
                                        </div>
                                    </div>
                                    <div class="message my-message">
                                        <div>
                                            <div class="chat-name">You</div>
                                            <div class="chat-text">I'm good, thanks! How about you?</div>
                                        </div>
                                    </div>
                                    <div class="message other-message">
                                        <div>
                                            <div class="chat-name">PolonaisTresSerieux92</div>
                                            <div class="chat-text"> I'm doing well. Started a new project recently, so that's been taking up most of my time. It's exciting, though!</div>
                                        </div>
                                    </div>
                                    <div class="message my-message">
                                        <div>
                                            <div class="chat-name">You</div>
                                            <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                                        </div>
                                    </div>
                                    
                                  </div>
                                  <div id="chat-input-messages" class="typebox">
                                    <input type="text" id="message-input" placeholder="Message" />
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
