
import Component from "../library/component.js";
import NavBar from '../components/home/navbar.js';

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        this.components = {
			navBar: new NavBar(),
         };
    }

    async render() {

        const view = /*html*/ `
		<div class="h-100 d-flex flex-column bg-custom">
			<div class="row m-0">
    	    	<nav class="navbar navbar-expand bg-white shadow-sm w-100" id="navBar"></nav>
    		</div>
			<h1 class="text-center fs-1 m-5" id="title-2fa">Two-factor Authentification</h1>
			<div class="d-flex justify-content-center align-items-center">
				<div class="">
					<div class=" d-flex align-items-center justify-content-center p-3">
						<p>
							Help protect your account from unauthorized access by requiring a second authentification method in addition to your password
						</p>
					</div>
					<div id="display-2fa" class="row d-flex align-items-center justify-content-center">
						<label class="text-center h4 text-danger align-self-center pb-4">2fa is disabled</label>
						<div class="d-flex align-items-center justify-content-center gap-3">
							<button id="btn-enable-2fa" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#enable-2fa-modal">Enable</button>
							<button id="btn-disable-2fa" class="btn btn-danger disabled" data-bs-toggle="modal" data-bs-target="#disable-2fa-modal">Disable</button>
						</div>
					</div>
				</div>
			</div>
        </div>


		<!-- Modal Activate 2fa -->
        <div class="modal" id="enable-2fa-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <form id="activate-2fa-form">
                        <div class="modal-header">
                            <h5 class="modal-title">Activate 2FA</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="p-3">
                                <label for="activate-password" class="form-label">Enter your password to confirm that you want to enable two-factor authentification</label>
                                <input type="password" class="form-control" id="input-activate-password" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                            <button id="btn-modal-enable-2fa" type="submit" data-bs-dismiss="modal" class="btn btn-success">Activate</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

		<!-- Modal Disable 2fa -->
        <div class="modal" id="disable-2fa-modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <form id="disable-2fa-form">
                        <div class="modal-header">
                            <h5 class="modal-title">Disable 2FA</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="p-3">
                                <label for="activate-password" class="form-label">Enter your password to confirm that you want to disable two-factor authentification</label>
                                <input type="password" class="form-control" id="input-disable-password" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                            <button id="btn-modal-disable-2fa" type="submit" data-bs-dismiss="modal" class="btn btn-success">Activate</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;

		this.element.innerHTML = view;
		this.handleEvent();
    }

	async handleEvent() {
        const btnEnable2FA = document.getElementById("btn-enable-2fa");
        const btnDisable2FA = document.getElementById("btn-disable-2fa");
        const btnModalEnable = document.getElementById("btn-modal-enable-2fa");
        const btnModalDisable = document.getElementById("btn-modal-disable-2fa");

        btnModalEnable.addEventListener("click", (event) => {
            event.preventDefault();

			const inputPassword = document.getElementById("input-activate-password");

			inputPassword.value = '';

            // Toggle the buttons
            btnEnable2FA.classList.add("disabled");
            btnDisable2FA.classList.remove("disabled");

        });

        btnModalDisable.addEventListener("click", (event) => {
            event.preventDefault();

            const inputPassword = document.getElementById("input-disable-password");

            // Toggle the buttons
            btnDisable2FA.classList.add("disabled");
            btnEnable2FA.classList.remove("disabled");

			
			
            // Log or submit the payload
			console.log(inputPassword.value);
			inputPassword.value = '';
        });
    }
}