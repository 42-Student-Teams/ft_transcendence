import state from "../store/state.js";
import store from "../store/index.js";
import Home from "../views/home.js";
import Local from "../views/localGame.js";
import Login from "../views/login.js";
import Register from "../views/register.js";
import Tournament from "../views/tournament.js";
import Profile from "../views/profile.js";
import Settings from "../views/settings.js";
import OauthCallback from "../views/oauthcallback.js";
import {wsSend} from "./wsUtils.js";
import JoinTournament from "../views/tournamentList.js";
import TwoPlayerLocalGame from "../views/2playerLocal.js";

const routes = [
	{ path: "/", view: Home },
	{ path: "/login", view: Login },
	{ path: "/register", view: Register },
	{ path: "/tournament-game", view: Tournament },
	{ path: "/local-game", view: Local },
	{ path : "/2player-local", view: TwoPlayerLocalGame},
	{ path: "/profile", view: Profile },
	{ path: "/oauthcallback", view: OauthCallback },
	{ path: "/settings", view: Settings },
	{ path: "/join-tournament", view: JoinTournament },
	// { path: "/record", view: TournamentRecord },
];

const viewCache = {};

const pathToRegex = (path) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const navigateTo = (url) => {
	history.pushState(null, null, url);
	router();
};

const router = async () => {
	const potentialMatches = routes.map((route) => {
		return {
			route: route,
			result: location.pathname.match(pathToRegex(route.path)),
		};
	});

	let match = potentialMatches.find((potentialMatch) => potentialMatch.result !== null);

	if (!match) {
		match = {
			route: routes[0],
			result: [location.pathname],
		};
	}

	store.dispatch("updateLocation", { location: match.route.path });

	if (state.socket && state.socket.readyState === state.socket.OPEN) {
		wsSend('navigating_to', {
			'url': match.route.path
		});
	}
	window.route_path = match.route.path;
	if (!match.route.path.includes('local-game')) {
		if (state.gameSocket && state.gameSocket.readyState === state.gameSocket.OPEN) {
			console.log('Closing game socket');
			state.gameSocket.close();
		}
		console.log('Cleaning all game data');
		store.dispatch("setCurrentGameData", null);
		window.gameState = null;
		window.gameHtml = null;
		document.removeEventListener("keydown", document.handleKeyDown);
		document.removeEventListener("keyup", document.handleKeyUp);
	}

	if (!viewCache[match.route.view]) {
		console.log("new view created");
		viewCache[match.route.view] = new match.route.view();
	} else {
		viewCache[match.route.view].renderAll();
	}
};

export { navigateTo };
export default router;