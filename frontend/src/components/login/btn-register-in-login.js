import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";
import { login } from '../../utils/langPack.js';
import store from "../../store/index.js";

export default class Login extends Component {
	constructor() {
		super({ element: document.getElementById("btnRegisterInLogin") });
		store.events.subscribe("stateChange", () => this.render());
		this.render();
	}

	async render() {
		const languageId = store.state.languageId;
    	const translations = login[languageId];

		const view = /*html*/ `
      <small>${translations.noAccount}
        <a href="">${translations.signUp}</a>
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
