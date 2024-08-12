import Component from "../../library/component.js";

export default class FriendProfileInfo extends Component {
    constructor() {
        super({ element: null });
        this.friendUsername = null;
        this.friendData = null;
    }

    setFriendUsername(username) {
        console.log("Setting friend username:", username);
        this.friendUsername = username;
        this.fetchFriendData();
    }

    async fetchFriendData() {
        if (!this.friendUsername) {
            console.error("No friend username set");
            return;
        }

        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL;
            console.log(`Fetching data for ${this.friendUsername} from ${apiurl}/get_userProfile`);
            const response = await fetch(`${apiurl}/get_userProfile?username=${this.friendUsername}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                this.friendData = await response.json();
                console.log("Friend data received:", this.friendData);
                this.render();
            } else {
                console.error('Failed to fetch friend data:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching friend data:', error);
        }
    }

    render() {
        this.element = document.getElementById("friendProfileInfo");
        if (!this.element) {
            console.error("Element 'friendProfileInfo' not found");
            return;
        }

        if (!this.friendData) {
            this.element.innerHTML = '<p>Loading friend profile...</p>';
            return;
        }

        const view = /*html*/ `
        <div class="card shadow-sm rounded mb-4">
            <div class="d-flex flex-column align-items-center p-4">
            <img 
            src="${this.friendData.avatar || '/static/default_avatar.png'}" 
            alt="Profile" 
            class="img-fluid rounded-circle mb-3" 
            id="friend-profile-picture"
            onerror="this.onerror=null; this.src='/src/assets/image/pp1.png';">
                    <h5 class="mb-1 font-weight-bold">${this.friendData.prenom} ${this.friendData.nom}</h5>
                    <p class="text-muted mb-2">${this.friendData.username}</p>
                </div>
                <div class="w-100 border-top mt-2 pt-3">
                    <div class="text-center">
                        <h6 class="mb-0">Wins: ${this.friendData.parties_gagnees}</h6>
                        <h6 class="text-muted mb-0">Losses: ${this.friendData.parties_jouees - this.friendData.parties_gagnees}</h6>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.element = document.getElementById("friendProfileInfo")
        this.element.innerHTML = view;
    }
}