import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import "./assets/css/style.css";
import store from "./store/index.js";
import router, { navigateTo } from "./utils/router.js";

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

	try {
        const isLoggedIn = await checkAuthStatus();
        if (isLoggedIn) {
            // L'utilisateur est connecté, vous pouvez le rediriger vers la page d'accueil ou une autre page appropriée
            navigateTo("/");
        } else {
            // L'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
            navigateTo("/login");
        }
    } catch (error) {
        console.error("Error checking authentication status:", error);
        navigateTo("/login");
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

async function setUserInfo() {
	const response = await fetch("/api/v1/user", {
		method: "GET",
		credentials: "include",
	});

	const data = await response.json();

	store.dispatch("setIntraId", { intraId: data.user.intraId });
	// store.dispatch("setLanguage", { languageId: data.preferred_language });
}

async function checkAuthStatus() {
	const response = await fetch("/api/check-login", {
		credentials: "include",
	});

	const data = await response.json();

	if (data.isLoggedIn) {
		store.dispatch("logIn");
		await setUserInfo();
		navigateTo("/");
		console.log("login state: redirect to /");
	} else {
		throw new Error("Not logged in");
	}
}

function handleDefaultRoute() {
	if (!store.state.gameStatus === "playing" && ["/game"].includes(window.location.pathname)) {
		navigateTo("/");
	} else {
		router();
	}
}
