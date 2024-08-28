import * as bootstrap from 'bootstrap';
import {home} from "./langPack.js";
import store from "../store/index.js";
import {navigateTo} from "./router.js";
import store from "..//store/index.js";

export function showToast(message, type) {
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not defined');
        return;
    }

    // Définir l'icône et les classes Bootstrap en fonction du type de toast
    const iconHTML = type === 'success'
        ? '<i class="fas fa-check-circle text-success me-2"></i>'
        : '<i class="fas fa-exclamation-circle text-danger me-2"></i>';

    const toastHTML = `
        <div class="position-fixed top-50 start-50 translate-middle p-3" style="z-index: 1055;">
            <div class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${iconHTML}<span>${message}</span>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
    `;
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);

    const toastElement = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toastElement.show();

    setTimeout(() => {
        document.body.removeChild(toastContainer);
    }, 5000);
}

export function showTournamentInvite(match_key, tournament_id) {
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not defined');
        return;
    }

	const langPack = toast[store.state.language];

    // Définir l'icône et les classes Bootstrap en fonction du type de toast
    const iconHTML = '<i class="fas fa-gamepad text-success me-2"></i>';

    const toastHTML = `
        <div class="position-fixed top-50 start-50 translate-middle p-3" style="z-index: 1055;">
            <div data-bs-autohide="false" class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${iconHTML}<span>${langpack.tournamentReady}</span>
                    </div>
                    <!--<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>-->
                    <button onclick="document.acceptInvite()" type="button" class="btn-primary m-auto" data-bs-dismiss="toast" aria-label="Close">${langpack.accept}</button>
                    <button onclick="document.rejectInvite()" type="button" class="btn-primary m-auto" data-bs-dismiss="toast" aria-label="Close">${langpack.quitTournament}</button>
                </div>
            </div>
        </div>
    `;
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);

    document.tournament_match_key = match_key;
    document.tournament_id = tournament_id;

    document.acceptInvite = function() {
        console.log('Accepted invite');
        const game = {
            color: null,
            speed: null,
            ai: false,
            search_for_game: false,
            tournament_id: document.tournament_id,
            match_key: document.tournament_match_key,
        };
        store.dispatch("setCurrentGameData", game);
        navigateTo("/local-game");
    }

    document.rejectInvite = function() {
        console.log('Rejected invite');

		const langPack = home[store.state.language];

		  const jwt = localStorage.getItem('jwt');
		  const apiurl = process.env.API_URL;


          fetch(`${apiurl}/quit_tournament`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({match_key: document.tournament_match_key, tournament_id: document.tournament_id})
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Or handle the response as needed
            })
            .catch(error => {
                showToast(langPack.serverError, "danger");
                console.error('Error:', error);
            });
    }

    const toastElement = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toastElement.show();
}

window.lol = showTournamentInvite;