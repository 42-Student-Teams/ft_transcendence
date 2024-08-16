import imgPingPong from "../assets/image/ping-pong.png";
import BtnAuth0 from '../components/login/btn-auth0.js';
import BtnRegisterInLogin from '../components/login/btn-register-in-login.js';
import FormLogin from '../components/login/form-login.js';
import Component from "../library/component.js";
import store from "../store/index.js";

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("app") });
        this.render();
        this.components = { 
            btnAuth0: new BtnAuth0(),
            btnRegisterInLogin: new BtnRegisterInLogin(),
            formLogin: new FormLogin()
         };
    }

    async render() {
        const view = /*html*/ `
        <div class="d-flex flex-column min-vh-100">
            <div class="container flex-grow-1 d-flex justify-content-center align-items-center">
               <div class="row border rounded-5 p-3 bg-white shadow box-area">
               <div class="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box" style="background: #D5D5D5;">
                    <div class="featured-image mb-3">
                        <img src="${imgPingPong}" class="img-fluid" alt="Ping Pong">
                    </div>
               </div> 
               <div class="col-md-6 right-box">
                  <div class="row align-items-center">
                        <div class="header-text mb-4">
                             <h2>Login</h2>
                        </div>
                        <div id="formLogin"></div>
                        <div class="divider d-flex align-items-center my-4">
                            <p class="text-center mx-3 mb-0 divider-or">Or</p>
                        </div>
                        <div id="btnAuth0" class="input-group mb-3"></div>
                        <div id="btnRegisterInLogin" class="row"></div>
                  </div>
               </div> 
              </div>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}