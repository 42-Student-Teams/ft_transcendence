import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";
import { generateRandomState } from "../../utils/generateRandomState.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnAuth0") });
		this.render();
	}

	async render() {
		const view = /*html*/ `
			<button class="btn btn-md btn-fortytwo w-100 fs-5">
                <img src=${btnLogo} style="width:20px" class="me-2">
                Sign In with 42
			</button>
        `;

		this.element = document.getElementById("btnAuth0");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", async () => {
			const { state, expirationTime } = generateRandomState();
        	sessionStorage.setItem('oauth_state', JSON.stringify({ state, expirationTime }));
			
			open(`${process.env.AUTHORIZATION_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI.replace('%IP%', process.env.BACKEND_IP)}&state=${state}&response_type=code`, "_self");
			//let token = await getAccessToken();
			//console.log('token: ', token);
		});
	}
}