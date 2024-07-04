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
            <div class="container-fluid">
              <div class="row">
                <nav class="navbar navbar-expand navbar-dark bg-dark" id="navBar"></nav>
              </div>
            </div>
            <div class="container-fluid h-100">
              <div class="row h-100">
                <div id="chat-big-div" class="col-3 container">
                  <div id="chat-screen-container" class="chat-screen row row-cols-1">
                    <div class="header col">
                      <div class="logo">Chatroom</div>
                    </div>
                    <div id="chat-messages" class="col overflow-auto">
                      <div class="message my-message">
                        <div>
                          <div class="chat-name">You</div>
                          <div class="chat-text">Hello !</div>
                        </div>
                      </div>
                      <div class="message other-message">
                            <div>
                                <div class="chat-name">PolonaisTresSerieux92</div>
                                <div class="chat-text">Hi! How are you?</div>
                            </div>
                        </div>
                        <div class=" message my-message">
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
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                        <div class="message my-message">
                            <div>
                                <div class="chat-name">You</div>
                                <div class="chat-text">Wow, that’s really impressive. Greening up the city sounds like a fantastic idea. If you need any help or volunteers, let me know.</div>
                            </div>
                        </div>
                      </div>
                    <div id="chat-input-messages" class="col typebox">
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
