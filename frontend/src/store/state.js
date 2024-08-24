export default {
	location: "/", // or "/game" or "/login" or "/profile"
	isLoggedIn: false,
	//languageId: "en",
	language: localStorage.getItem('language') || 'en',
	username: "",
	firstname: "",
	lastname: "",
	avatar: "",
	gamesPlayed: 0,
	gamesLossed: 0,
	gamesWon: 0,
	joinTournamentNickName: "",
	socketConnection: null,
	friends: [],
};
