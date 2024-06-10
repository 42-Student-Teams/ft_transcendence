function updateLocation(context, payload) {
	context.commit("updateLocation", payload);
}

function logIn(context) {
	context.commit("logIn");
}

function logOut(context) {
	context.commit("logOut");
}


function setLanguage(context, payload) {
    context.commit("setLanguage", payload);
	document.documentElement.lang = payload.languageId;
}

function setIntraId(context, payload) {
	context.commit("setIntraId", payload);
}

export default {
	updateLocation,
	logIn,
	logOut,
	setLanguage,
	setIntraId,
};
