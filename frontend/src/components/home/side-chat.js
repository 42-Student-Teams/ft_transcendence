import Component from "../../library/component.js";

export default class SideChat extends Component {
    constructor() {
        super({ element: document.getElementById("layoutSidenav_nav") });
        this.render();
    }

    async render() {

        const view = /*html*/ `

                <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                    <div class="sb-sidenav-menu">
                        <div class="nav">
                            <div class="sb-sidenav-menu-heading text-align">Chat</div>
                            <div class="container-fluid">
                                <div></>
                                
                                
                            </div>
                        </div>
                    </div>
                </nav>
        `;

        this.element = document.getElementById("layoutSidenav_nav");
        this.element.innerHTML = view;
    }
}
