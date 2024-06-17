import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnRegisterInLogin") });
		this.render();
	}

	async render() {

		const view = /*html*/ `
            <small>Don't have account ?
                <a href="">Sign Up</a>
            </small>
        `;

		this.element = document.getElementById("btnRegisterInLogin");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("a").addEventListener("click", () => {
			event.preventDefault();
			navigateTo("/register");
		});
	}
}
