import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      // sideChat: new SideChat(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
          <div class="h-100 d-flex flex-column">
            <div class="row">
              <nav class="navbar navbar-expand navbar-dark bg-dark pl-4" id="navBar"></nav>
            </div>
            <div class="flex-grow-1 d-flex">
              <div class="row flex-grow-1 h-100">
                <div class="col bg-dark h-100 d-flex flex-column">
                  <div class="d-flex flex-column h-100 gap-2 p-4 overflow-auto">
                    <div class="header-text">
                      <div class="logo text-white">Chatroom</div>
                    </div>
                    <div class="custom-chat overflow-auto flex-grow-1">
                      <div class="message my-message pl-2">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Hello !</div>
                        </div>
                      </div>
                      <div class="message other-message">
                        <div>
                          <div class="chat-name">PolonaisTresSerieux92</div>
                          <div class="chat-text text-white text-white">Hi! How are you?</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white text-white">I'm good, thanks! How about you?</div>
                        </div>
                      </div>
                      <div class="message other-message">
                        <div>
                          <div class="chat-name">PolonaisTresSerieux92</div>
                          <div class="chat-text text-white"> I'm doing well. Started a new project recently, so that's been taking up most of my time. It's exciting, though!</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text text-white">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                        </div>
                      </div>
                      <!-- More messages here -->
                    </div>
                    <div id="chat-input-messages" class="gap-4 d-flex flex-grow-0">
                      <input type="text" id="message-input" class="form-control" placeholder="Message" />
                      <button id="send-message" class="btn btn-primary"><i id="icon-send" class="ml-4 fa-regular fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
                <div class="col bg-success d-flex flex-column justify-content-center align-items-center">
                  <!-- Content for the second column -->
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
