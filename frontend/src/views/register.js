import imgPingPong from "../assets/image/ping-pong.png";
import BtnAuth0 from '../components/register/btn-auth0.js';
import Component from "../library/component.js";

export default class Register extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());
        this.render();
        this.components = { btnAuth0: new BtnAuth0() };
    }

    async render() {

        const view = /*html*/ `
		<div class="container d-flex justify-content-center  align-items-center min-vh-100">
           <div class="row border rounded-5 p-3 bg-white shadow box-area">
           <div class="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box" style="background: #D5D5D5;">
                <div class="featured-image mb-3">
                    <img src=${imgPingPong} class="img-fluid"">
                </div>
           </div> 
           <div class="col-md-6 right-box">
              <div class="row align-items-center">
                    <div class="header-text mb-4">
                         <h2>Register Account</h2>
                    </div>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control form-control-lg bg-light fs-6" placeholder="Login">
                    </div>
                    <div class="input-group mb-1">
                        <input type="password" class="form-control form-control-lg bg-light fs-6" placeholder="Password">
                    </div>
                    <div class="input-group mb-5 d-flex justify-content-between">
                        <div class="forgot">
                            <small><a href="#">Forgot Password?</a></small>
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <button class="btn btn-lg btn-primary w-100 fs-5">Login</button>
                    </div>
                    <div class="divider d-flex align-items-center my-4">
                        <p class="text-center mx-3 mb-0 divider-or">Or</p>
                    </div>
                    <div id="btnAuth0" class="input-group mb-3">
                    </div>
                    <div class="row">
                        <small>Don't have account? <a href="#">Sign Up</a></small>
                    </div>
              </div>
           </div> 
          </div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}
