import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";
import { showToast } from "../../utils/toastUtils.js";
import { home } from "/src/utils/langPack.js";
import store from "../../store/index.js";

export default class SidePendingList extends Component {
	constructor() {
		super({ element: document.getElementById("side-pending-list") });
		this.pendingFriends = [];
		this.currentLang = store.state.language;
		this.render();

		store.events.subscribe('stateChange', () => {
			if (this.currentLang !== store.state.language) {
				this.currentLang = store.state.language;
				this.render();
			}
		});
	}

	async render() {
		const langPack = home[this.currentLang];
		const view = /*html*/ `
            <div id="friend-display" class="blocked-list flex-grow-1 overflow-auto">
            </div>
        `;

		this.element = document.getElementById("side-pending-list");
		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {
		document.getElementById("btn-toggle-pending").addEventListener("click", async (event) => {
			event.preventDefault();
			await this.getPendingList();
		});
	}

	async getPendingList() {
		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/pending_list`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				this.pending = await response.json();
				this.renderPendingList();
			} else {
				console.error('Failed to fetch pending list');
			}
		} catch (error) {
			console.error('Error fetching pending list:', error);
		}
	}

	renderPendingList() {
		const langPack = home[this.currentLang];
		const friendDisplayElement = document.getElementById("friend-display");
		friendDisplayElement.innerHTML = '';

		if (this.pending.friends.length > 0) {
			this.pending.friends.forEach((friend, index) => {
				const profilePicture = [ProfilePicture1, ProfilePicture2, ProfilePicture3][index % 3];
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
                                        <span class="friend-status">${langPack.pending}</span>
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

			this.element.querySelectorAll('.btn-pending-friend').forEach(button => {
				button.addEventListener('click', (event) => this.handleAcceptFriend(event));
			});
		} else {
			friendDisplayElement.innerHTML = `<p>${langPack.noPendingFriendRequests}</p>`;
		}
	}

	async handleAcceptFriend(event) {
		const langPack = home[this.currentLang];
		const button = event.currentTarget;
		const username = button.getAttribute('data-username');
		const friendContainer = button.closest('.friend');

		try {
			const jwt = localStorage.getItem('jwt');
			const apiurl = process.env.API_URL;
			const response = await fetch(`${apiurl}/accept_friend_request`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${jwt}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 'friend_username': username })
			});

			if (response.ok) {
				friendContainer.remove();
				showToast(langPack.friendRequestAccepted.replace('{username}', username), 'success');
			} else {
                console.error(`Failed to accept friend request for ${username}`);
                showToast(langPack.friendRequestAcceptFailed.replace('{username}', username), 'danger');
            }
		} catch (error) {
            console.error(`Error accepting friend request for ${username}:`, error);
            showToast(langPack.friendRequestAcceptError.replace('{username}', username), 'danger');
        }
	}
}