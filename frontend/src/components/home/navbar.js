import Component from "../../library/component.js";
import LogoutButton from './btn-logout.js';

export default class Navbar extends Component {
	constructor() {
		super({ element: document.getElementById("navBar") });
		this.render();
		this.components = { 
			logoutButton: new LogoutButton(),
		};
	}

	async render() {

		// With api call
		const view = /*html*/ `
			<div class="navbar navbar-expand navbar-dark bg-dark">
                <a class="navbar-brand">Transcendence</a>
                <div class="dropdown text-center">
                  <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
				  <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" class="rounded-circle">
                  </a>
                  <ul class=" dropdown-menu text-small">
                	<li>
                        <a class="dropdown-item" href="#">Settings</a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">Profile</a>
                    </li>
                    <li>
                        <hr class="dropdown-divider" />
                    </li>
                    <li id="btnLogout"></li>
                  </ul>
                </div>
            </div>
        `;

		this.element = document.getElementById("navBar");
		this.element.innerHTML = view;
	}
}
