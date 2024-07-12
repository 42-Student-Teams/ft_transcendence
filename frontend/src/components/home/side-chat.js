import Component from "../../library/component.js";

export default class SideChat extends Component {
    constructor() {
        super({ element: document.getElementById("side-chat") });
        this.render();
    }

    async render() {

        const view = /*html*/ `
            <div class="gap-3 row custom-chat overflow-auto flex-grow-1">
              <div class="message my-message ">
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
        `;

        this.element = document.getElementById("side-chat");
        this.element.innerHTML = view;
    }
}
