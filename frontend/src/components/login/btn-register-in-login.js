import Component from "../../library/component.js";
import { navigateTo } from "../../utils/router.js";

export default class BtnRegisterInLogin extends Component {
    constructor() {
        super({ element: document.getElementById("btnRegisterInLogin") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <small>Don't have account ?
                <a href="/register" data-link>Sign up</a>
            </small>
        `;

        this.element = document.getElementById("btnRegisterInLogin");
        this.element.innerHTML = view;
    }
}