import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class Tournament extends Component {
	constructor() {
		super({ element: document.getElementById("app") });

		// store.events.subscribe("languageIdChange", () => this.renderAll());

		this.render();
		this.components = {
			navBar: new NavBar(),
			// btnAuth0: new BtnAuth0(),
		};
	}

	async render() {

		const view = /*html*/ `
			<div class="h-100 d-flex flex-column">
				<div class="row chat-rm-margin">
			    	<nav class="navbar navbar-expand pl-4 bg-white shadow-sm" id="navBar"></nav>
			  	</div>
				<h1 class="pt-5 pb-5 text-center display-1">Lists of Tournaments</h1>

				<table class="container table table-hover">
				  <thead>
				    <tr>
				      <th scope="col">Host</th>
				      <th scope="col">Number of Players</th>
				      <th scope="col">Action</th>
				    </tr>
				  </thead>
				  <tbody>
				    <tr>
						<td>AlphaWolf</td>
						<td>3/4</td>
						<td>
							<button type="button" class="btn btn-add-ai">Join</button>
						</td>
						</tr>
						<tr>
						  <td>DragonSlayer</td>
						  <td>2/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>ShadowNinja</td>
						  <td>4/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>LunarKnight</td>
						  <td>1/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>FirePhoenix</td>
						  <td>3/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>ThunderStrike</td>
						  <td>2/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>BladeMaster</td>
						  <td>4/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>CrystalMage</td>
						  <td>3/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>SteelTitan</td>
						  <td>2/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>NightHunter</td>
						  <td>4/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>FrostQueen</td>
						  <td>1/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>StormRider</td>
						  <td>3/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>IronClaw</td>
						  <td>4/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>VenomFang</td>
						  <td>2/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>EchoWraith</td>
						  <td>3/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>SilentArrow</td>
						  <td>1/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>GoldenEagle</td>
						  <td>2/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>PhantomRogue</td>
						  <td>4/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>SolarFlare</td>
						  <td>3/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
						  </td>
						</tr>
						<tr>
						  <td>VoidWalker</td>
						  <td>1/4</td>
						  <td>
						    <button type="button" class="btn btn-add-ai">Join</button>
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

	}
}
