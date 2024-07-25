import Component from "../../library/component.js";
import store from "..//../store/index.js";
import { navigateTo } from "../../utils/router.js";


export default class Navbar extends Component {
    constructor() {
        super({ element: document.getElementById("navBar") });
        this.render();
    }

    async render() {

        const view = /*html*/ `
            <a id="home-page" class="navbar-brand ps-3">Transcendence</a>
            <div class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></div>
            <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="true"><i class="fas fa-user fa-fw"></i></a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li>
							<a href="" id="profile-link" role="button" class="dropdown-item">Profile</a>
						</li>
                        <li>
							<hr class="dropdown-divider" />
						</li>
                        <li id="btnLogout">
							<a href="" class="dropdown-item" role="button">Logout</a>
						</li>
                    </ul>
                </li>
            </ul>
			
        `;

        this.element = document.getElementById("navBar");
        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        this.element.querySelector("#profile-link").addEventListener("click", () => {
			event.preventDefault();
			console.log("Hello2");
			navigateTo("/profile");
		});

		this.element.querySelector("#home-page").addEventListener("click", () => {
			event.preventDefault();
			console.log("Hello");
			navigateTo("/");
		});

		this.element.querySelector("#btnLogout").addEventListener("click", () => {
			event.preventDefault();
			store.dispatch("logout");
			navigateTo("/login");
		});

    }
}
