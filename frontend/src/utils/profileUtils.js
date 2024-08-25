import store from "../store/index.js";


export function getProfile() {

	console.log("profileUtils.js - getProfile - store.state : ", store.state.firstname, store.state.lastname, store.state.avatar);
	if (store.state.firstname != ""
		&& store.state.lastname != ""
		&& store.state.avatar != ""
	) {
		const userProfile = {
			username: store.state.username,
			firstname: store.state.firstname,
			lastname: store.state.lastname,
			avatar: store.state.avatar,
			gamesPlayed: store.state.gamesPlayed,
			gamesLossed: store.state.gamesLossed,
			gamesWon: store.state.gamesWon,
		};
		return userProfile;
	}
	return null;
}

export function setProfile (profile){
	store.dispatch("setUsername", { username: profile.username });
	store.dispatch("setFirstName", { firstname: profile.nom });
	store.dispatch("setLastName", { lastname: profile.prenom });
	store.dispatch("setAvatar", { avatar: profile.avatar });
	store.dispatch("setGamesPlayed", { gamesPlayed: profile.parties_jouees });
	store.dispatch("setGamesLossed", { gamesLossed: profile.parties_perdues });
	store.dispatch("setGamesWon", { gamesWon: profile.parties_gagnees });
}


export function updateProfile(profile) {

	console.log("profileUtils.js - updateProfile - profile : ", profile);
	if (profile.firstname !== store.state.firstname
		|| profile.lastName !== store.state.lastname
		|| profile.avatar !== store.state.avatar
	) {
		store.dispatch("setFirstName", { firstname: profile.firstname });
		store.dispatch("setLastName", { lastname: profile.lastname });
		store.dispatch("setAvatar", { avatar: profile.avatar });
		return true;
	}
	return false;
}


export function clearEditModalInputs(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = '';
        }
    });
}