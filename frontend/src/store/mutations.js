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
	state.languageId = payload.languageId;
	return state;
}

function setWebSocket(state, payload) {
	state.socket = payload;
	return state;
}

function setGameSocket(state, payload) {
	state.gameSocket = payload;
	return state;
}

function setCurrentGameData(state, payload) {
	state.currentGameData = payload;
	return state;
}

function setGameRequestId(state, payload) {
	state.gameRequestId = payload;
	return state;
}


export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setWebSocket,
	setGameSocket,
	setCurrentGameData,
	setGameRequestId,
	// setIntraId,
};
