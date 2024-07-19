import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { registerUser } from "../../utils/apiutils.js";

export default class FormRegister extends Component {
    constructor() {
        super({ element: document.getElementById("formRegister") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <form id="form-register">
                <div class="input-group mb-3">
                    <input id="register-firstname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="First Name">
                </div>
                <div class="input-group mb-3">
                    <input id="register-lastname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Last Name">
                </div>
                <div class="input-group mb-3">
                    <input id="register-username" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Username">
                </div>
                <div class="input-group mb-3">
                    <input id="register-email" type="email" class="form-control form-control-lg bg-light fs-6" placeholder="Email">
                </div>
                <div class="input-group mb-3">
                    <input id="register-password" type="password" class="form-control form-control-lg bg-light fs-6" placeholder="Password">
                </div>
                <div class="input-group mb-3">
                    <button id="register-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5">Register</button>
                </div>
            </form>
        `;
        this.element = document.getElementById("formRegister");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#register-submit").addEventListener("click", async (event) => {
            event.preventDefault();
            const firstname = document.getElementById("register-firstname").value;
            const lastname = document.getElementById("register-lastname").value;
            const username = document.getElementById("register-username").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            let response = await registerUser(username, password);
            if (response.ok) {
                console.log('Successfully created account');
                store.dispatch("logIn");
                navigateTo("/");
            } else {
                console.error("Registration failed:");
            }
        });
    }
}
