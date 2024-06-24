import NavBar from '../components/home/navbar.js';
import SideChat from '../components/home/side-chat.js';
import Component from "../library/component.js";

export default class Home extends Component {
  constructor() {
    super({ element: document.getElementById("app") });
    this.render();

    this.components = {
      navBar: new NavBar(),
      sideChat: new SideChat(),
    };
  }

  async render() {
    // const languageId = store.state.languageId;

    const view = /*html*/ `
            <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark" id="navBar"></nav>
            <div id="layoutSidenav">
              <div id="layoutSidenav_nav"></div>
              <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Static Navigation</h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.html">Dashboard</a></li>
                            <li class="breadcrumb-item active">Static Navigation</li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">
                                <p class="mb-0">
                                    This page is an example of using static navigation. By removing the
                                    <code>.sb-nav-fixed</code>
                                    class from the
                                    <code>body</code>
                                    , the top navigation and side navigation will become static on scroll. Scroll down this page to see an example.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        `;
    this.element.innerHTML = view;

  }
}
