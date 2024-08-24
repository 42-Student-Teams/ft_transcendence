import Component from "../../library/component.js";
import { profile } from "../../utils/langPack.js";
import store from "../../store/index.js";
import { showToast } from "../../utils/toastUtils.js";

export default class ProfileInfo extends Component {
	constructor() {
		super({ element: document.getElementById("profileInfo") });
		this.currentLang = store.state.language;
		this.render();

		store.events.subscribe('stateChange', () => {
			if (this.currentLang !== store.state.language) {
				this.currentLang = store.state.language;
				this.render();
			}
		});
	}

	async render() {
		const langPack = profile[this.currentLang];
		const view = /*html*/ `
            

		
        `;
		this.element = document.getElementById("profileInfo");
		this.element.innerHTML = view;
		await this.handleEvent();
	}

	async handleEvent() {
		const langPack = profile[this.currentLang];
	}
}