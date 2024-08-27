import 'bootstrap/dist/css/bootstrap.css';
import "./assets/css/style.css";
import store from "./store/index.js";
import { tokenExpired } from "./utils/jwtUtils.js";
import router, { navigateTo } from "./utils/router.js";
import { openCommWebsocket } from "./utils/wsUtils.js";
import { setProfile } from "./utils/profileUtils.js";

// load components

window.addEventListener("popstate", (event) => {
	//console.groupCollapsed("EVENT: popstate");
	//console.log(" - window.location.pathname=", window.location.pathname);
	// if (store.state.location === "/game") {
	// 	event.preventDefault();
	// 	//console.log("leave game");
	// 	store.dispatch("leaveGame");
	// }
	// if (window.location.pathname === "/game") {
	// 	event.preventDefault();
	// 	navigateTo("/");
	// 	return;
	// }
	//console.groupEnd();
	// Route to the previous page
	router();
});

document.addEventListener("DOMContentLoaded", async () => {
	setupNavigation();

	console.log("app.js - document.addEventListener - store.state.isLoggedIn : ", store.state.isLoggedIn);

	if (!store.state.isLoggedIn) {
		try {
			await authStatus();
		} catch (error) {
			navigateTo("/login");
			return;
		}
	}

	


	handleDefaultRoute();
});

function setupNavigation() {
	document.body.addEventListener("click", (event) => {
		const targetElement = event.target.closest("[data-link]");

		if (targetElement) {
			event.preventDefault();
			navigateTo(targetElement.getAttribute("href"));
		}
	});
}


async function setUserProfile() {
	try {
		const jwt = localStorage.getItem('jwt');
		const apiurl = process.env.API_URL;
		const response = await fetch(`${apiurl}/get_user_profile`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error("Failed to get profile");
		}

		await setProfile(data);
	} catch (error) {
		console.error('Error fetching user profile:', error);
	}
}

async function authStatus() {
	try {
		const jwt = localStorage.getItem('jwt');
		const apiurl = process.env.API_URL;
		const response = await fetch(`${apiurl}/get_logged_in_status`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			}
		});
		if (response.ok) {
			store.dispatch("logIn");
			await setUserProfile();
			navigateTo("/");
		} else {
			throw new Error("Not logged in");
		}
	} catch (error) {
		console.error('Error fetching auth status:', error);
	}
}

// todo somewhere here: openCommWebsocket

function handleDefaultRoute() {
	if (tokenExpired()) {
		navigateTo("/login");
	} else {
		openCommWebsocket();
		if (!store.state.gameStatus === "playing" && ["/game"].includes(window.location.pathname)) {
			navigateTo("/");
		} else if (!store.state.joinNickname && ["/join-tournament"].includes(window.location.pathname)) {
			navigateTo("/");
		}
		else {
			router();
		}
	}
}