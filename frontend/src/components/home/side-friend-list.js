import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";

export default class SideFriendList extends Component {
    constructor() {
        super({ element: document.getElementById("side-friend-list") });
        this.friends = [];
        this.render();
        this.getFriends();
    }

    async render() {
        const view = /*html*/ `
            <div>
                <h1>You can add friends with their username.</h1>
            </div>
            <div class="d-flex flex-grow-0 gap-3 pb-4">
                <input type="text" id="friend-username" class="form-control" placeholder="Username" />
                <button id="btn-add-friend" class="btn btn-success flex-fill">
                    <i id="icon-send" class="ml-4 fa fa-user-plus"></i>
                </button>
            </div>
            <div id="friends-list" class="friends-list flex-grow-1 overflow-auto">
                <!-- Friends will be dynamically added here -->
            </div>
            <!-- Modal -->
            <div class="modal" id="block-friend-modal" tabindex="-1">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="modalVerticallyCenteredLabel">Block</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to block this <b>user</b> ?<br/>Blocking this user will also remove them from your friends list
                  </div>
                  <div class="modal-footer">
                   <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                    <button type="button" class="btn btn-danger">Block</button>
                  </div>
                </div>
              </div>
            </div>
        `;

        this.element.innerHTML = view;
        this.handleEvent();
    }

    async handleEvent() {
        const addFriendButton = this.element.querySelector("#btn-add-friend");
        addFriendButton.addEventListener("click", () => this.addFriend());

        // Event delegation for dynamic elements
        this.element.addEventListener("click", (event) => {
            if (event.target.closest(".btn-direct-message")) {
                this.handleDirectMessage(event);
            }
            if (event.target.closest(".btn-unblock")) {
                this.handleBlockUser(event);
            }
        });
    }

	async getFriends() {
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/friend_list`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				}
			});
			if (response.ok) {
				const data = await response.json();
				this.friends = data.friends;
				this.renderFriendsList(); 
			} else {
				console.error('Failed to fetch friends');
			}
		} catch (error) {
			console.error('Error fetching friends:', error);
		}
	}

    async addFriend() {
        const friendUsername = this.element.querySelector("#friend-username").value;
        if (!friendUsername) return;

        try {
            const jwt = localStorage.getItem('jwt');

			const apiurl = process.env.API_URL;
            const response = await fetch(`${apiurl}/send_friend_request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_username: friendUsername })
            });

			console.log(jwt);

            if (response.ok) {
                // await this.getFriends(); // Refresh the friends list
                this.element.querySelector("#friend-username").value = ''; // Clear input
            } else {
                console.error('Failed to add friend');
                // You might want to show an error message to the user here
            }
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    }

    renderFriendsList() {
        const friendsList = this.element.querySelector("#friends-list");
        friendsList.innerHTML = this.friends.map(friend => `
            <div class="friend container py-3">
                <div class="row mr-4">
                    <div class="col-8 container user-info">
                        <div class="row">
                            <div class="col friend-image">
                                <img class="friend-img" src="${friend.profile_picture || 'default_profile_picture.jpg'}" />
                            </div>
                            <div class="col friend-info">
                                <span>${friend.username}</span>
                                <span class="friend-status-${friend.status.toLowerCase()}">${friend.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-4 d-flex gap-2 friend-action">
                        <button class="btn-direct-message btn rounded"><i class="fa-solid fa-comment"></i></button>
                        <button class="btn rounded btn-unblock" data-bs-toggle="modal" data-bs-target="#block-friend-modal"><i class="fa-solid fa-user-large-slash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    handleDirectMessage(event) {
        event.preventDefault();
        const sideChat = document.getElementById('side-chat');
        const friendlist = document.getElementById('side-friend-list');
        const btnBlocked = document.getElementById('btn-toggle-blocked');
        const btnFriends = document.getElementById('btn-toggle-friends');

        console.log("Direct messages")
        if (sideChat.classList.contains('d-none')) {
            friendlist.classList.remove('d-flex');
            friendlist.classList.add('d-none');
            sideChat.classList.remove('d-none');
            sideChat.classList.add('d-flex');
            btnBlocked.classList.remove('active');
            btnFriends.classList.remove('active');
        }
    }

    // handleBlockUser(event) {
    //     // Logic for blocking a user
    //     console.log("Block user clicked");
    //     // You might want to implement the actual blocking logic here
    // }
}