import Component from "../library/component.js";
// import LogoutButton from './main/logoutButton.js';

export default class Main extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        // this.components = {
        //     logoutButton: new LogoutButton(),
        // };
    }

    async render() {
        // const languageId = store.state.languageId;

        const view = /*html*/ `
		<div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card p-5">
                <h2 class="text-center">Welcome Back!</h2>
                <form>
                    <div class="form-group">
                        <input type="email" class="form-control" placeholder="get@tutorial.com">
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" placeholder="Password">
                    </div>
                    <p class="text-center">Or continue with</p>
                    <div class="form-group">
                        <button type="button" class="btn btn-block btn-custom"> 
                            <img src="assets/intra.png" alt="intra button" class="btn-intra">
                        </button>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Log in</button>
                </form>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}
