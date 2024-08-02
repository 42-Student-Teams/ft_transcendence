import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import state from "../../store/state.js";
import {env} from "process";
import {openCommWebsocket} from "../../utils/wsUtils.js";

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("formLogin") });
        this.render();
    }

    async render() {

        const view = /*html*/ `
            <form id="form-login">
                <div class="input-group mb-3">
                    <input id="login-username" type="text" class="form-control form-control-xl bg-light fs-6" placeholder="Login">
                </div>
                <div class="input-group mb-3">
                    <input id="login-password" type="password" class="form-control form-control-lg bg-light fs-6" placeholder="Password">
                </div>
                <div class="input-group mb-3">
                    <button id="login-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5">Login</button>
                </div>
            </form>
        `;

        this.element = document.getElementById("formLogin");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {

        this.element.querySelector("#login-submit").addEventListener("click", async (event) => {
            // Prevent Default Submit Behavior
            event.preventDefault();

            // Check Nickname is Empty or too long or non-English
            const username = this.element.querySelector("#login-username").value;
            const password = this.element.querySelector("#login-password").value;

            try {
                // Make the POST request with the login credentials
                const apiurl = "/backend"; //process.env.API_URL;


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

                // if (username.trim() !== "" && password.trim() !== "") {
                //     store.dispatch("logIn");
                //     navigateTo("/");
                // }
                if (response.ok) {
                    store.dispatch("logIn");
                    localStorage.setItem('jwt', jsonData.jwt);
                    openCommWebsocket();
                    console.log(store.state.socket);
                    navigateTo("/");
                }
                else {
                    console.error("Login failed:");
                    throw new Error("Login failed: Invalid username or password.");
                }
            } catch (error) {
                // Handle network or other errors here
                console.error("An error occurred:", error);
            }
        });
    }
}
