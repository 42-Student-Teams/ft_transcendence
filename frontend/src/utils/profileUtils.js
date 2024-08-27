import store from "../store/index.js";


export async function getProfile() {

	try {
		const jwt = localStorage.getItem('jwt');
		const apiurl = process.env.API_URL;
		const response = await fetch(`${apiurl}/get_user_profile`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${jwt}`,
				'Content-Type': 'application/json'
			}
		});

		
		if (!response.ok) {
			throw new Error("Failed to get profile");
		}
		const data = await response.json();
		await setProfile(data);
	} catch (error) {
		console.error('Error fetching user profile:', error);
	}
}

export async function setProfile(profile) {
	store.dispatch("setUsername", { username: profile.username });
	store.dispatch("setFirstName", { firstname: profile.nom });
	store.dispatch("setLastName", { lastname: profile.prenom });
	store.dispatch("setAvatar", { avatar: profile.avatar });
	store.dispatch("setGamesPlayed", { gamesPlayed: profile.parties_jouees });
	store.dispatch("setGamesLossed", { gamesLossed: profile.parties_perdues });
	store.dispatch("setGamesWon", { gamesWon: profile.parties_gagnees });
}


export function updateProfile(profile) {
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