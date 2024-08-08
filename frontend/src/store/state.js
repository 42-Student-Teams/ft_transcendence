export default {
	location: "/", // or "/game" or "/login" or "/profile"
	isLoggedIn: false,
	//languageId: "en",
	language: localStorage.getItem('language') || 'en',
	intraId: "intraId(lsaba-qu)",
	socketConnection: null,
	friends: [],
};
