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

//profile

function setUsername(state, payload) {
	state.username = payload.username;
	return state;
}

function setFirstName(state, payload) {
	state.firstname = payload.firstname;
	return state;
}

function setLastName(state, payload) {
	state.lastname = payload.lastname;
	return state;
}

function setAvatar(state, payload) {
	state.avatar = payload.avatar;
	return state;
}

function setGamesPlayed(state, payload) {
	state.gamesPlayed = payload.gamesPlayed;
	return state;
}

function setGamesLossed(state, payload) {
	state.gamesLossed = payload.gamesLossed;
	return state;
}

function setGamesWon(state, payload) {
	state.gamesWon = payload.gamesWon;
	return state;
}


// main

function setLanguage(state, payload) {
    state.language = payload;
    return state;
}

function setJoinTournamentNickName(state, payload) {
    state.joinNickname = payload;
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
	setJoinTournamentNickName,
	setUsername,
	setFirstName,
	setLastName,
	setAvatar,
	setGamesPlayed,
	setGamesLossed,
	setGamesWon
};
