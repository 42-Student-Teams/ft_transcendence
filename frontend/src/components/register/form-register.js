import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";

export default class FormRegister extends Component {
    constructor() {
        super({ element: document.getElementById("formRegister") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <style>
                .invalid-feedback {
                    font-size: 0.75em; 
                    color: #dc3545; 
                    display: block; 
                }
                .input-group .form-control {
                    border-radius: 0.5rem !important; 
                }
                .input-group .input-group-prepend .input-group-text,
                .input-group .input-group-append .input-group-text {
                    border-radius: 0 !important; 
                    border-left: none; 
                }
                .is-invalid {
                    border-color: #dc3545 !important; 
                }
            </style>
            <form id="form-register" novalidate>
                <div class="input-group mb-3">
                    <input id="register-firstname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="First Name" required>
                    <div id="error-firstname" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="register-lastname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Last Name" required>
                    <div id="error-lastname" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="register-username" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Username" required>
                    <div id="error-username" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="register-email" type="email" class="form-control form-control-lg bg-light fs-6" placeholder="Email" required>
                    <div id="error-email" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="register-password" type="password" class="form-control form-control-lg bg-light fs-6" placeholder="Password" required>
                    <div id="error-password" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <button id="register-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5">Register</button>
                </div>
            </form>
        `;
        this.element.innerHTML = view;
        this.addInputEventListeners();
        this.handleEvent();
    }

    addInputEventListeners() {
        const inputFields = ["firstname", "lastname", "username", "email", "password"];
        inputFields.forEach(field => {
            const inputElement = document.getElementById(`register-${field}`);
            inputElement.addEventListener("input", () => {
                if (inputElement.classList.contains("is-invalid")) {
                    inputElement.classList.remove("is-invalid");
                }
                const errorElement = document.getElementById(`error-${field}`);
                errorElement.style.display = "none";
            });
        });
    }

    async handleEvent() {
        const form = document.getElementById('form-register');
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const firstname = document.getElementById("register-firstname").value;
            const lastname = document.getElementById("register-lastname").value;
            const username = document.getElementById("register-username").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            this.resetErrors();

            let hasError = false;

            if (!firstname) {
                this.showError("firstname");
                hasError = true;
            }
            if (!lastname) {
                this.showError("lastname");
                hasError = true;
            }
            if (!username) {
                this.showError("username");
                hasError = true;
            }
            if (!email || !email.includes('@')) {
                this.showError("email");
                hasError = true;
            }
            if (!password) {
                this.showError("password");
                hasError = true;
            }

            if (hasError) return;

            try {
                const data = {
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    email: email,
                    password: password
                };
                const apiurl = process.env.API_URL;
                const response = await fetch(`${apiurl}/create_user`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    store.dispatch("logIn");
                    navigateTo("/");
                } else {
                    this.showError("registration");
                }
            } catch (error) {
                this.showError("registration");
                console.error("An error occurred:", error);
            }
        });
    }

    resetErrors() {
        const errorFields = ["firstname", "lastname", "username", "email", "password"];
        errorFields.forEach(field => {
            const inputElement = document.getElementById(`register-${field}`);
            inputElement.classList.remove("is-invalid");
            const errorElement = document.getElementById(`error-${field}`);
            errorElement.style.display = "none";
        });
    }

    showError(field) {
        const inputElement = document.getElementById(`register-${field}`);
        inputElement.classList.add("is-invalid");
        const errorElement = document.getElementById(`error-${field}`);
        errorElement.style.display = "block";
    }
}
