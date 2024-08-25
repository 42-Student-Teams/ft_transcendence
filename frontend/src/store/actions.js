import state from "./state.js";

function updateLocation(context, payload) {
	context.commit("updateLocation", payload);
}

function logIn(context) {
	context.commit("logIn");
}

function logOut(context) {
    if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({func: 'logout'}));
    }
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

function setJoinTournamentNickName(context, payload) {
    context.commit("setJoinTournamentNickName", payload);
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

function updateFriendStatus(context, payload) {
    context.commit("updateFriendStatus", payload);
}

export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setIntraId,
	setJoinTournamentNickName,
	setWebSocket,
	updateFriendStatus,
	setGameSocket,
	setCurrentGameData,
	setGameRequestId,
};
