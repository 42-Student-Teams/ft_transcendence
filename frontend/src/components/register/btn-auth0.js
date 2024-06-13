import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";

export default class REgister extends Component {
	constructor() {
		super({ element: document.getElementById("btnAuth0") });
		this.render();
	}

	async render() {

		const view = /*html*/ `
            <button class="btn btn-lg btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} style="width:20px" class="me-2">
                <small>Sign In with 42</small>
			</button>
        `;

		this.element = document.getElementById("btnAuth0");
		this.element.innerHTML = view;
		// this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", () => {

			navigateTo("/login");
		});
	}
}
