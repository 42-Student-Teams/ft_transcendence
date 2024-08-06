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
    context.commit("setLanguage", payload);
	document.documentElement.lang = payload.languageId;
}

function setIntraId(context, payload) {
	context.commit("setIntraId", payload);
}

function setWebSocket(context, payload) {
	context.commit("setWebSocket", payload);
}

function setGameSocket(context, payload) {
	context.commit("setGameSocket", payload);
}

function setCurrentGameData(context, payload) {
	context.commit("setCurrentGameData", payload);
}

function setGameRequestId(context, payload) {
	context.commit("setGameRequestId", payload);
}

export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setIntraId,
	setWebSocket,
	setGameSocket,
	setCurrentGameData,
	setGameRequestId,
};
