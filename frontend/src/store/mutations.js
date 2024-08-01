// routing
function updateLocation(state, payload) {
	state.location = payload.location;
	return state;
}

// login
function logIn(state) {
	state.isLoggedIn = true;
	return state;
}

function logOut(state) {
	state.isLoggedIn = false;
	return state;
}

function setIntraId(state, payload) {
	state.intraId = payload.intraId;
	return state;
}

// main

function setLanguage(state, payload) {
    state.language = payload;
    return state;
}

function setWebSocket(state, payload) {
	state.socket = payload;
	return state;
}


export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setWebSocket,
	// setIntraId,
};
