import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnAuth0") });
		this.render();
	}

	async render() {

		const view = /*html*/ `
            <a href="${process.env.LOGIN_URL}" class="btn btn-md btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} style="width:20px" class="me-2">
                Sign In with 42
			</a>
        `;

		this.element = document.getElementById("btnAuth0");
		this.element.innerHTML = view;
	}

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", () => {

			navigateTo("/login");
		});
	}
}
