import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { openCommWebsocket } from "../../utils/wsUtils.js";
import { addInputEventListeners, showError, resetErrors } from "../../utils/formValidation.js";

export default class FormLogin extends Component {
    constructor() {
        super({ element: document.getElementById("formLogin") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
        <form id="form-login" novalidate>
            <div class="input-group mb-3">
                <input id="login-username" type="text" class="form-control rounded bg-light fs-6" placeholder="Login">
                <div id="error-login-username" class="invalid-feedback">Please enter a valid username.</div>
            </div>
            <div class="input-group mb-3">
                <input id="login-password" type="password" class="form-control rounded bg-light fs-6" placeholder="Password">
                <div id="error-login-password" class="invalid-feedback">Password must be at least 6 characters.</div>
            </div>
            <div class="input-group mb-3">
                <button id="login-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5 rounded">Login</button>
            </div>
        </form>
    `;

        this.element = document.getElementById("formLogin");
        this.element.innerHTML = view;

        // Add input event listeners for validation
        const fields = ["username", "password"];
        addInputEventListeners('login', fields);

        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#login-submit").addEventListener("click", async (event) => {
            event.preventDefault();

            // Reset previous errors
            resetErrors('login', ["username", "password"]);

            const username = this.element.querySelector("#login-username").value.trim();
            const password = this.element.querySelector("#login-password").value.trim();

            let valid = true;
            if (!username) {
                showError('login', 'username');
                valid = false;
            }
            if (password.length < 6) {
                showError('login', 'password');
                valid = false;
            }

            if (!valid) {
                return;
            }

            try {
                // Make the POST request with the login credentials
                const apiurl = process.env.API_URL;

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
                    localStorage.setItem('jwt', jsonData.jwt);
                    openCommWebsocket();
                    console.log(store.state.socket);
                    navigateTo("/");
                } else {
					showError('login', 'username'); // Optionally show general error
                    //console.error("Login failed:");
                    //throw new Error("Login failed: Invalid username or password.");
                }
            } catch (error) {
				showError('login', 'username'); // Optionally show general error
                //console.error("An error occurred:", error);
            }
        });
    }
}