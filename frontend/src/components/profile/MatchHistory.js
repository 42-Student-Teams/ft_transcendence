import Component from "../../library/component.js";

export default class MatchHistory extends Component {
    constructor() {
        super({ element: document.getElementById("matchHistory") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
        <div class="card p-3 flex-grow-1 d-flex flex-column">
            <div class="card-content flex-grow-1 d-flex flex-column">
                <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex flex-column align-items-center">
                            <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
                            <small class="text-muted">01/01/2023 10:00 AM</small>
                        </div>
                        <div class="text-center">
                            <h6 class="mb-0">Victory</h6>
                            <p class="mb-0">100-43</p>
                        </div>
                        <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
                    </div>
                    <div class="border-top my-2"></div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex flex-column align-items-center">
                            <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
                            <small class="text-muted">02/01/2023 11:00 AM</small>
                        </div>
                        <div class="text-center">
                            <h6 class="mb-0">Victory</h6>
                            <p class="mb-0">19-13</p>
                        </div>
                        <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
                    </div>
                    <div class="border-top my-2"></div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex flex-column align-items-center">
                            <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
                            <small class="text-muted">03/01/2023 12:00 PM</small>
                        </div>
                        <div class="text-center">
                            <h6 class="mb-0">Defeat</h6>
                            <p class="mb-0">9-13</p>
                        </div>
                        <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
                    </div>
                    <div class="border-top my-2"></div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex flex-column align-items-center">
                            <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
                            <small class="text-muted">04/01/2023 01:00 PM</small>
                        </div>
                        <div class="text-center">
                            <h6 class="mb-0">Victory</h6>
                            <p class="mb-0">13-2</p>
                        </div>
                        <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
                    </div>
                    <div class="border-top my-2"></div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex flex-column align-items-center">
                            <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
                            <small class="text-muted">05/01/2023 02:00 PM</small>
                        </div>
                        <div class="text-center">
                            <h6 class="mb-0">Defeat</h6>
                            <p class="mb-0">8-14</p>
                        </div>
                        <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
                    </div>
                </div>
            </div>
        </div>
        `;

        this.element = document.getElementById("matchHistory");
        this.element.innerHTML = view;
    }
}


// debut de preparation pour l'integration de la partie backend avec create match
// import Component from "../../library/component.js";

// export default class MatchHistory extends Component {
//     constructor() {
//         super({ element: document.getElementById("matchHistory") });
//         this.render();
//     }

//     async render() {
//         const view = /*html*/ `
//         <div class="card p-3 flex-grow-1 d-flex flex-column">
//             <div class="card-content flex-grow-1 d-flex flex-column">
//                 <div class="card-body p-0 flex-grow-1 d-flex flex-column justify-content-between">
//                     ${this.createMatch("Victory", "100-43", "01/01/2023 10:00 AM")}
//                     <div class="border-top my-2"></div>
//                     ${this.createMatch("Victory", "19-13", "02/01/2023 11:00 AM")}
//                     <div class="border-top my-2"></div>
//                     ${this.createMatch("Defeat", "9-13", "03/01/2023 12:00 PM")}
//                     <div class="border-top my-2"></div>
//                     ${this.createMatch("Victory", "13-2", "04/01/2023 01:00 PM")}
//                     <div class="border-top my-2"></div>
//                     ${this.createMatch("Defeat", "8-14", "05/01/2023 02:00 PM", true)}
//                 </div>
//             </div>
//         </div>
//         `;

//         this.element.innerHTML = view;
//     }

//     createMatch(result, score, date, isLast = false) {
//         return `
//         <div class="d-flex justify-content-between align-items-center mb-2">
//             <div class="d-flex flex-column align-items-center">
//                 <img src="https://via.placeholder.com/60" alt="Profile" class="img-fluid rounded mb-1">
//                 <small class="text-muted">${date}</small>
//             </div>
//             <div class="text-center">
//                 <h6 class="mb-0">${result}</h6>
//                 <p class="mb-0">${score}</p>
//             </div>
//             <img src="https://via.placeholder.com/60" alt="Second Image" class="img-fluid rounded">
//         </div>
//         `;
//     }
// }