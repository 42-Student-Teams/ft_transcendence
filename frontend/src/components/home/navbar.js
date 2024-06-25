import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import LogoutButton from "./btn-logout.js";

export default class Navbar extends Component {
    constructor() {
        super({ element: document.getElementById("navBar") });
        this.render();
        this.components = { 
        	logoutButton: new LogoutButton(),
        };
    }

    async render() {

        const view = /*html*/ `
            <a class="navbar-brand ps-3" href="#">Transcendence</a>
            <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i class="fas fa-bars"></i></button>
            <div class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></div>
            <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-user fa-fw"></i></a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a id="profile-link" class="dropdown-item">Profile</a></li>
                        <li><hr class="dropdown-divider" /></li>
                        <li id="btnLogout"></li>
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
			navigateTo("/profile");
		});

        this.element.querySelector("#sidebarToggle").addEventListener("click", () => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            // this.element.querySelector("#sidebarToggle").classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', this.element.querySelector("#sidebarToggle").classList.contains('sb-sidenav-toggled'));
        });
    }
}
