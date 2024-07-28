import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";


export default class SidePendingList extends Component {
    constructor() {
        super({ element: document.getElementById("side-pending-list") });
        this.pendingFriends = []; // Initialize pendingFriends as an empty array
        this.render();
    }

    async render() {

        const view = /*html*/ `
            <div id="friend-display" class="blocked-list flex-grow-1 overflow-auto">
            </div>
        `;

        this.element = document.getElementById("side-pending-list");
        this.element.innerHTML = view;
    	this.handleEvent();
    }

	async handleEvent() {
		try {
		  const jwt = localStorage.getItem("jwt");
		  const apiurl = process.env.API_URL;
		  const response = await fetch(`${apiurl}/pending_list`, {
			method: "GET",
			headers: {
			  Authorization: `Bearer ${jwt}`,
			  "Content-Type": "application/json",
			},
		  });
	
		  if (response.ok) {
			const data = await response.json();
			console.log(data);
			this.pendingFriends = data.friends || [];
			await this.renderPendingList();
		  } else {
			console.error("Failed to fetch pending list");
		  }
		} catch (error) {
		  console.error("Error fetching pending list:", error);
		}
	  }

    renderPendingList() {
        const friendDisplayElement = document.getElementById("friend-display");
        friendDisplayElement.innerHTML = ''; // Clear any existing content
		console.log('Pending:', this.pendingFriends);

        if (this.pendingFriends.length > 0) {

            this.pendingFriends.forEach((friend, index) => {
                const profilePicture = [ProfilePicture1, ProfilePicture2, ProfilePicture3][index % 3]; // Cycle through profile pictures
                const friendHtml = /*html*/ `
                    <div class="friend container py-3">
                        <div class="row mr-4">
                            <div class="col-8 container user-info">
                                <div class="row">
                                    <div class="col friend-image">
                                        <img class="friend-img" src=${profilePicture} />
                                    </div>
                                    <div class="col friend-info">
                                        <span>${friend.username}</span>
                                        <span class="friend-status">Pending</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4 d-flex gap-2 friend-action">
                                <button class="btn rounded btn-pending-friend" data-username="${friend.username}"><i class="fa-solid fa-user-plus"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                friendDisplayElement.insertAdjacentHTML('beforeend', friendHtml);
            });

            // Add event listeners to the buttons after rendering
            this.element.querySelectorAll('.btn-pending-friend').forEach(button => {
                button.addEventListener('click', (event) => this.handleAcceptFriend(event));
            });
        } else {
            friendDisplayElement.innerHTML = '<p>No pending friend requests.</p>';
        }
    }

    async handleAcceptFriend(event) {
        const button = event.currentTarget;
        const username = button.getAttribute('data-username');
		const friendContainer = button.closest('.friend'); // Get the parent container of the friend

        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL; // This should be replaced with the actual API URL
            const response = await fetch(`${apiurl}/accept_friend_request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'friend_username': username })
            });

            if (response.ok) {
                // Remove the friend container from the DOM
                friendContainer.remove();
            } else {
                console.error(`Failed to accept friend request for ${username}`);
            }
        } catch (error) {
            console.error(`Error accepting friend request for ${username}:`, error);
        }
    }
}
