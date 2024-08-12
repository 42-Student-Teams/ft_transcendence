import Component from "../../library/component.js";

export default class FriendProfileInfo extends Component {
    constructor() {
        super({ element: document.getElementById("friendProfileInfo") });
        this.friendUsername = null;
    }

    setFriendUsername(username) {
        this.friendUsername = username;
        this.render();
    }

    async render() {
        if (!this.friendUsername) {
            console.error("Friend username not set");
            return;
        }

        try {
            const jwt = localStorage.getItem("jwt");
            const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/get_userProfile?username=${this.friendUsername}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch friend profile');
            }

            const data = await response.json();
            console.log("Profil data:", data);

            const view = /*html*/ `
            <div class="card shadow-sm rounded mb-4">
                <div class="d-flex flex-column align-items-center p-4">
                    <img src="https://via.placeholder.com/80" alt="${data.username}" class="img-fluid rounded-circle mb-3" style="width: 80px; height: 80px;">
                    <h5 class="mb-1">${data.prenom} ${data.nom}</h5>
                    <p class="text-muted mb-2">@${data.username}</p>
                    <p class="text-muted mb-2">Status: ${data.status}</p>
                    <div class="w-100 border-top mt-3 pt-3">
                        <div class="text-center">
                            <h6 class="mb-0">Wins: ${data.parties_gagnees}</h6>
                            <h6 class="text-muted mb-0">Total Games: ${data.parties_jouees}</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;
            this.element.innerHTML = view;
        } catch (error) {
            console.error("Error fetching friend profile:", error);
            this.element.innerHTML = "<p>Error loading friend profile</p>";
        }
    }
}