import imgPingPong from "../assets/image/ping-pong.png";
import BtnLoginInRegister from '../components/register/btn-login-in-register.js';
import FormRegister from '../components/register/form-register.js';
import Component from "../library/component.js";

export default class Register extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        this.render();
        this.components = { 
            btnLoginInRegister: new BtnLoginInRegister(),
            formRegister: new FormRegister()
        };
    }

    async render() {
        const view = /*html*/ `
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
           <div class="row border rounded-5 p-3 bg-white shadow box-area">
           <div class="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box" style="background: #D5D5D5;">
                <div class="featured-image mb-3">
                    <img src=${imgPingPong} class="img-fluid">
                </div>
           </div> 
           <div class="col-md-6 right-box">
              <div class="row align-items-center">
                    <div class="header-text mb-4">
                         <h2>Create Your Account</h2>
                    </div>
                    <div id="formRegister"></div>
                    <div id="btnLoginInRegister" class="row"></div>
              </div>
           </div> 
          </div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}
