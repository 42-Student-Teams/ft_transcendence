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
    context.commit("setLanguage", payload);
	document.documentElement.lang = payload.languageId;
}

function setIntraId(context, payload) {
	context.commit("setIntraId", payload);
}

function setWebSocket(context, payload) {
	context.commit("setWebSocket", payload);
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
	setWebSocket,
	updateFriendStatus,
};
