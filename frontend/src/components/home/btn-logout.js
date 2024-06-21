import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import store from "..//../store/index.js";

export default class LogoutButton extends Component {
	constructor() {
		super({ element: document.getElementById("btnLogout") });
		this.render();
	}

	async render() {

		// With api call


		const view = /*html*/ `
			<a href="" class="dropdown-item" role="button">
        		Logout
        	</a>
        `;
		// const view = /*html*/ `
		// 	<a href="${process.env.LOGOUT_URL}" class="dropdown-item" role="button">
        // 		Logout
        // 	</a>
        // `;

		this.element = document.getElementById("btnLogout");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("a").addEventListener("click", () => {
			event.preventDefault();
			store.dispatch("logout");
			navigateTo("/login");
		});
	}
}
