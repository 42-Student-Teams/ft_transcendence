import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { handleMessage } from "../../websocket/wshandler.js";
import { login } from "/src/utils/langPack.js";

export default class FormLogin extends Component {
    constructor() {
        super({ element: document.getElementById("formLogin") });
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }

    async render() {
        const langPack = login[this.currentLang];
        const view = /*html*/ `
            <form id="form-login">
                <div class="input-group mb-3">
                    <input id="login-username" type="text" class="form-control form-control-xl bg-light fs-6" placeholder="${langPack.username}">
                </div>
                <div class="input-group mb-3">
                    <input id="login-password" type="password" class="form-control form-control-lg bg-light fs-6" placeholder="${langPack.password}">
                </div>
                <div class="input-group mb-3">
                    <button id="login-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5">${langPack.loginButton}</button>
                </div>
            </form>
        `;

        this.element = document.getElementById("formLogin");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#login-submit").addEventListener("click", async (event) => {
            event.preventDefault();

            const username = this.element.querySelector("#login-username").value;
            const password = this.element.querySelector("#login-password").value;

            try {
                const apiurl = "/backend";
                const data = {
                    username: username,
                    password: password,
                    oauth_token: null
                };

                const response = await fetch(`${apiurl}/login`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const jsonData = await response.json();

                if (response.ok) {
                    store.dispatch("logIn");
                    localStorage.setItem('jwt', jsonData.jwt);
                    let socket = new WebSocket(`wss://${window.location.host}/wss/comm/`);
                    socket.onmessage = handleMessage;
                    socket.addEventListener("open", (ev) => {
                        socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt')}));
                    });
                    store.dispatch("setWebSocket", socket);
                    navigateTo("/");
                } else {
                    console.error("Login failed:");
                    throw new Error("Login failed: Invalid username or password.");
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        });
    }

    onStateChange() {
        if (this.currentLang !== store.state.language) {
            this.currentLang = store.state.language;
            this.render();
        }
    }
}