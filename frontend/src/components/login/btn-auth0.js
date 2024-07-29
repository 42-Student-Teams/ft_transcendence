import btnLogo from "../../assets/image/42-logo.png";
import Component from "../../library/component.js";
import { generateRandomState } from "../../utils/randomState.js";
import { login } from '../../utils/langPack.js';
import store from "../../store/index.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnAuth0") });
		store.events.subscribe("stateChange", () => this.render());
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;
    	const translations = login[languageId]; 
    
    const view = /*html*/ `
      <button class="btn btn-md btn-fortytwo w-100 fs-5">
        <img src=${btnLogo} style="width:20px" class="me-2">
        ${translations.signInWith42}
      </button>
    `;
    this.element = document.getElementById("btnAuth0");
    this.element.innerHTML = view;
    this.handleEvent();
  }

	async handleEvent() {
		this.element.querySelector("button").addEventListener("click", () => {
			const { state, expirationTime } = generateRandomState();
        	sessionStorage.setItem('oauth_state', JSON.stringify({ state, expirationTime }));
			open(`${process.env.AUTHORIZATION_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}&response_type=code`, "_self");
		});
	}
}
