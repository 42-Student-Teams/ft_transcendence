import NavBar from '../components/home/navbar.js';
import SideChat from '../components/home/side-chat.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      sideChat: new SideChat(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
            <div class="container-fluid">
              <div class="row">
                <nav class="navbar navbar-expand navbar-dark bg-success" id="navBar"></nav>
              </div>
            </div>
            <div class="container-fluid h-100">
              <div class="row h-100">
              <div class="col-3 h-100 bg-primary pb-4">
              <div id="chat-screen-container" class="chat-screen  h-100">
                    <div class="header">
                      <div class="logo">Chatroom</div>
                    </div>
                    <div id="chat-messages" class="messages overflow-auto">
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text">Hello !</div>
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
                    </div>
                    <div id="chat-input-messages" class="typebox">
                      <input type="text" id="message-input" placeholder="Message" />
                      <button id="send-message"><i id="icon-send" class="fa-regular fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
                <div class="col-9 bg-success h-100">
                  <!-- Content for the second column -->
                  <div class="h-100 d-flex flex-column justify-content-center align-items-center">
                    <h3>Column 2 Content</h3>
                    <p>This column takes up 9 units of the grid.</p>
                  </div>
                </div>
              </div>
            </div>
        `;
    this.element.innerHTML = view;

  }
}
