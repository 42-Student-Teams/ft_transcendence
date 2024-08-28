import store from '../../store/index.js'
import Component from '../../library/component.js';
import * as bootstrap from 'bootstrap';

export default class ModalTournamentBracket extends Component {
	constructor() {
		super({ element: document.getElementById('modalTournamentBracket') });
	}

	async render() {
		// states
		const tournament = {
			p1: 'Player 1',
			p2: 'Player 2',
			p3: 'Player 3',
			p4: 'Player 4',
		};
		const score = {
			round1: [5, 10],
			round2: [3, 5],
			round3: [1, 2],
		};

		const winner = {
			round1: "Player 2",
			round2: "Player 4",
			round3: "Player 2",
		};

		const view = `
	<div class="modal" id="modalTournamentBracket" tabindex="-1">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Tournament Bracket</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="tournament-bracket">
						<div class="round round-1">
							<h6>Round 1</h6>
							<div class="match">
								<div>${tournament.p1} (${score.round1[0]})</div>
								<div>vs</div>
								<div>${tournament.p2} (${score.round1[1]})</div>
								<strong>Winner: ${winner.round1}</strong>
							</div>
							<div class="match">
								<div>${tournament.p3} (${score.round2[0]})</div>
								<div>vs</div>
								<div>${tournament.p4} (${score.round2[1]})</div>
								<strong>Winner: ${winner.round2}</strong>
							</div>
						</div>
						<div class="round round-2">
							<h6>Final</h6>
							<div class="match">
								<div>${winner.round1}</div>
								<div>vs</div>
								<div>${winner.round2}</div>
								<strong>Winner: ${winner.round3}</strong>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
       
    `;
		this.element = documentGetElementById('modalTournamentBracket');
		this.element.innerHTML = view;
	}

	async populateTournamentBracket() {
		this.render();

		const myModal = new bootstrap.Modal(document.getElementById('modalTournamentBracket'));
		myModal.show();
		await new Promise((resolve) => setTimeout(resolve, 2000));
		myModal.hide();
	}
}