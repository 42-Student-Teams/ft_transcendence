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

function updateFriendStatus(state, payload) {
    if (!state.friends) {
        state.friends = [];
    }
    const friendIndex = state.friends.findIndex(friend => friend.username === payload.username);
    if (friendIndex !== -1) {
        state.friends[friendIndex].status = payload.status;
    }
    return state;
}


export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setWebSocket,
	updateFriendStatus,
	// setIntraId,
};
