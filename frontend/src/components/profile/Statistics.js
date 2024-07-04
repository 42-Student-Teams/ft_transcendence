import Component from "../../library/component.js";

export default class Statistics extends Component {
    constructor() {
        super({ element: document.getElementById("statistics") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
        <div class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex">
                    <div class="text-center mr-2">
                        <p class="mb-0 font-weight-bold">11W 9L</p>
                        <p class="mb-0">Last 20</p>
                    </div>
                    <div class="text-center mr-2">
                        <p class="mb-0 font-weight-bold">55%</p>
                        <p class="mb-0">Winrate</p>
                    </div>
                </div>
                <div class="d-flex">
                    <div class="text-center mr-2">
                        <img src="https://via.placeholder.com/40" alt="Avatar1" class="img-fluid mb-2">
                        <p class="mb-0 font-weight-bold text-success">65%</p>
                    </div>
                    <div class="text-center mr-2">
                        <img src="https://via.placeholder.com/40" alt="Avatar2" class="img-fluid mb-2">
                        <p class="mb-0 font-weight-bold text-success">100%</p>
                    </div>
                    <div class="text-center">
                        <img src="https://via.placeholder.com/40" alt="Avatar3" class="img-fluid mb-2">
                        <p class="mb-0 font-weight-bold text-danger">33%</p>
                    </div>
                </div>
            </div>
            <div class="progress mt-2 mb-2" style="height: 10px;">
                <div class="progress-bar bg-danger" style="width: 55%;"></div>
                <div class="progress-bar bg-success" style="width: 45%;"></div>
            </div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}
