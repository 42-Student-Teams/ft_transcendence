import state from "./state.js";

function updateLocation(context, payload) {
	context.commit("updateLocation", payload);
}

function logIn(context) {
	context.commit("logIn");
}

function logOut(context) {
	localStorage.clear();
	context.commit("logOut");
}


function setLanguage(context, payload) {
    localStorage.setItem('language', payload);
    context.commit("setLanguage", payload);
    document.documentElement.lang = payload;
}

function setIntraId(context, payload) {
	context.commit("setIntraId", payload);
}

function setWebSocket(context, payload) {
	context.commit("setWebSocket", payload);
}

export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setIntraId,
	setWebSocket,
};
