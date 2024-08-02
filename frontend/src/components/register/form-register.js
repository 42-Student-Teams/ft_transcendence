import Component from "../../library/component.js";
import { addInputEventListeners, handleEvent, resetErrors, showError } from "../../utils/formValidation.js";
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
            <style>
                .invalid-feedback {
                    font-size: 0.75em; 
                    color: #dc3545; 
                    display: none; 
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
                    <input id="form-register-firstname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="First Name" required>
                    <div id="error-firstname" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="form-register-lastname" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Last Name" required>
                    <div id="error-lastname" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="form-register-username" type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Username" required>
                    <div id="error-username" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="form-register-email" type="email" class="form-control form-control-lg bg-light fs-6" placeholder="Email" required>
                    <div id="error-email" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <input id="form-register-password" type="password" class="form-control form-control-lg bg-light fs-6" placeholder="Password" required>
                    <div id="error-password" class="invalid-feedback">Invalid input, try again</div>
                </div>
                <div class="input-group mb-3">
                    <button id="form-register-submit" type="submit" class="btn btn-md btn-primary w-100 fs-5">Register</button>
                </div>
            </form>
        `;
        this.element.innerHTML = view;

        const fields = ["firstname", "lastname", "username", "email", "password"];
        addInputEventListeners('form-register', fields);

        handleEvent(
            'form-register',
            fields,
            (field, value) => {
                if (!value) return false;
                if (field === 'email' && !value.includes('@')) return false;
                return true;
            },
            async (data) => {
                try {
                    const apiurl = "/backend"; //process.env.API_URL;
                    const response = await fetch(`${apiurl}/create_user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        store.dispatch("logIn");
                        const jsonData = await response.json();
                        localStorage.setItem('jwt', jsonData.jwt);
                        navigateTo("/");
                    } else {
                        showError('form-register', 'registration');
                    }
                } catch (error) {
                    showError('form-register', 'registration');
                    console.error("An error occurred:", error);
                }
            }
        );
    }
}
