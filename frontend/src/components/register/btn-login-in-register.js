import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";

export default class Register extends Component {
	constructor() {
		super({ element: document.getElementById("btnLoginInRegister") });
		this.render();
	}

	async render() {

		const view = /*html*/ `
            <small>Already have an account ?
				<a href="/login" data-link>Login</a>
			</small>
        `;

		this.element = document.getElementById("btnLoginInRegister");
		this.element.innerHTML = view;
	}
}
