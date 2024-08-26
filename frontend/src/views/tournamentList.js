import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class Tournament extends Component {
	constructor() {
		super({ element: document.getElementById("app") });

		// store.events.subscribe("languageIdChange", () => this.renderAll());

		this.render();
		this.components = {
			navBar: new NavBar(),
		};
	}

	async render() {

		const view = /*html*/ `
        <div class="h-100 d-flex flex-column">
            <div class="row chat-rm-margin">
                <nav class="navbar navbar-expand pl-4 bg-white shadow-sm" id="navBar"></nav>
            </div>
            <h1 class="pt-5 pb-5 text-center display-4">Lists of Tournaments</h1>
            <table class="container table table-hover">
                <thead>
                    <tr>
                        <th scope="col">Host</th>
                        <th scope="col">Number of Players</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="loader">
                        <td colspan="3" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		const loader = this.element.querySelector("#loader");
		const tbody = this.element.querySelector("tbody");
		const players = await this.fetchPlayers();

		loader.style.display = 'none';
		tbody.innerHTML = ''; 


		players.forEach(player => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
                <td>${player.name}</td>
                <td>${player.nb_players}</td>
                <td>
                    <button type="button" class="btn btn-add-ai">Join</button>
                </td>
            `;
			tbody.appendChild(tr);

			const joinButton = tr.querySelector(".btn.btn-add-ai");
            joinButton.addEventListener("click", () => {
                console.log(`Join button clicked for host: ${player.name}`);
                // Add your logic here to handle the join event
            });
		});
	}

	async fetchPlayers() {
		// Simulate a fake API call
		return new Promise(resolve => {
			setTimeout(() => {
				resolve([
					{ name: 'PhantomRogue', nb_players: '4/4' },
					{ name: 'SolarFlare', nb_players: '3/4' },
					{ name: 'VoidWalker', nb_players: '1/4' }
				]);
			}, 1000);
		});
	}
}
