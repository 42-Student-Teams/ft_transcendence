import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";
import Component from "../../library/component.js";
import { chatClear, fetchChatHistory } from "../../utils/chatUtils.js";
import { showToast } from "../../utils/toastUtils.js";
import store from "../../store/index.js";

export default class SideFriendList extends Component {
  constructor() {
    super({ element: document.getElementById("side-friend-list") });
    this.friends = []; // Initialize friends as an empty array
    this.render();
    
    // S'abonner aux changements d'état
    store.events.subscribe('stateChange', () => {
      this.updateFriendStatuses(store.state.friends);

    // Écouter les événements de mise à jour de statut d'ami
    document.addEventListener('friendStatusUpdate', (event) => {
      console.log('Received friendStatusUpdate event', event.detail);
      this.updateFriendStatus(event.detail.username, event.detail.status);
    });
  });

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
      <div id="friend-list-display" class="friends-list flex-grow-1 overflow-auto"></div>
      <!-- Modal -->
      <div class="modal" id="block-friend-modal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalVerticallyCenteredLabel">Block</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to block this <b>user</b> ?<br/>Blocking this user will also remove them from your friends list.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirm-block-button">Block</button>
            </div>
          </div>
        </div>
      </div>
    `;
	  this.element = document.getElementById("side-friend-list");
    this.element.innerHTML = view;
    await this.getFriendList();
    this.handleEvent();
  }

  async handleEvent() {

	document.getElementById("btn-toggle-friends").addEventListener("click", async (event) => {
		event.preventDefault();
		await this.getFriendList(); // Fetch and display the friend list
	  });

    this.element.querySelector("#btn-add-friend").addEventListener("click", async (event) => {
      event.preventDefault();
      const usernameInput = this.element.querySelector("#friend-username");
      const username = usernameInput.value.trim();
      if (username) {
        await this.addFriend(username);
        usernameInput.value = ''; // Clear input field after adding friend
      }
    });

    /* Here the user clicked on the chat icon next to a friend */
    this.element.addEventListener("click", (event) => {
      let button = event.target.closest(".btn-direct-message");
      if (button) {
        this.handleDirectMessage(event, button.getAttribute('data-username'));
      } else if (event.target.closest(".btn-unblock")) {
        this.handleBlockFriend(event);
      }
    });
  }

  async getFriendList() {
    try {
      const jwt = localStorage.getItem("jwt");
      const apiurl = process.env.API_URL;
      const response = await fetch(`${apiurl}/friend_list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          this.friends = data.friends || [];
          await this.renderFriendList();
        } else {
          console.error("Failed to fetch friend list:", data.message);
        }
      } else {
        console.error("Failed to fetch friend list");
      }
    } catch (error) {
      console.error("Error fetching friend list:", error);
    }
  }

  renderFriendList() {
    const friendDisplayElement = document.getElementById("friend-list-display");
    friendDisplayElement.innerHTML = ""; // Clear any existing content
    //console.log("Friends:", this.friends);

    if (this.friends.length > 0) {
      this.friends.forEach((friend, index) => {
        const profilePicture = [
          ProfilePicture1,
          ProfilePicture2,
          ProfilePicture3,
        ][index % 3]; // Cycle through profile pictures
      const statusClass = friend.status === 'Connected' ? 'status-connected' : 'status-offline';
      const friendHtml = /*html*/ `
        <div class="friend container py-3" data-username="${friend.username}">
          <div class="row mr-4">
            <div class="col-8 container user-info">
              <div class="row">
                <div class="col friend-image position-relative">
                  <img class="friend-img" src=${profilePicture} />
                  <span class="friend-status-indicator ${statusClass}"></span>
                </div>
                <div class="col friend-info">
                  <span>${friend.username}</span>
                  <span class="friend-status">${friend.status}</span>
                </div>
              </div>
            </div>
            <div class="col-4 d-flex gap-2 friend-action">
              <button id="message_button" class="btn-direct-message btn rounded" data-username="${friend.username}"><i class="fa-solid fa-comment"></i></button>
              <button class="btn rounded btn-block" data-username="${friend.username}"><i class="fa-solid fa-user-large-slash"></i></button>
            </div>
          </div>
        </div>
      `;
      friendDisplayElement.insertAdjacentHTML("beforeend", friendHtml);
    });

    this.element.querySelectorAll(".btn-block").forEach((button) => {
      button.addEventListener("click", (event) =>
        this.handleBlockFriend(event)
      );
    });
  } else {
    friendDisplayElement.innerHTML = "<p>No friends found.</p>";
  }
}

  updateFriendStatuses(friends) {
   friends.forEach(friend => {
        this.updateFriendStatus(friend.username, friend.status);
    });
  }

  updateFriendStatus(username, status) {
    console.log(`Updating status for ${username} to ${status}`);
    const friendElement = this.element.querySelector(`.friend[data-username="${username}"]`);
    if (friendElement) {
      const statusIndicator = friendElement.querySelector('.friend-status-indicator');
      const statusText = friendElement.querySelector('.friend-status');
      
      statusIndicator.classList.remove('status-connected', 'status-offline');
      statusIndicator.classList.add(status === 'Connected' ? 'status-connected' : 'status-offline');
      
      statusText.textContent = status;
    } else {
      console.log(`Friend element for ${username} not found`);
    }
  }

  async handleDirectMessage(event, friend_username) {
    const sideChat = document.getElementById("side-chat");
    sideChat.setAttribute('data-username', friend_username);
    const friendlist = document.getElementById("side-friend-list");
    const btnBlocked = document.getElementById("btn-toggle-blocked");
    const btnFriends = document.getElementById("btn-toggle-friends");

    if (sideChat.classList.contains("d-none")) {
      friendlist.classList.remove("d-flex");
      friendlist.classList.add("d-none");
      sideChat.classList.remove("d-none");
      sideChat.classList.add("d-flex");
      btnBlocked.classList.remove("active");
      btnFriends.classList.remove("active");
    }

    chatClear();
    await fetchChatHistory(friend_username);
  }

  async handleBlockFriend(event) {
    const button = event.currentTarget;
    const username = button.getAttribute('data-username');
    const friendContainer = button.closest('.friend');

    try {
      const jwt = localStorage.getItem('jwt');
      const apiurl = process.env.API_URL;
      const response = await fetch(`${apiurl}/block_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        showToast(`User ${username} blocked successfully.`, "success");
        console.log(`Successfully blocked friend ${username}`);
        friendContainer.remove();
      } else {
        showToast(`Failed to block user ${username}.`, "danger");
        console.error(`Failed to block friend ${username}`);
      }
    } catch (error) {
      showToast(`Error blocking user ${username}.`, "danger");
      console.error(`Error blocking friend ${username}:`, error);
    }
  }

  async addFriend(username) {
    try {
      const jwt = localStorage.getItem('jwt');
      const apiurl = process.env.API_URL;
      const response = await fetch(`${apiurl}/send_friend_request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'friend_username': username })
      });

      if (response.ok) {
        console.log(`Successfully sent friend request to ${username}`);
        showToast(`Friend request sent to ${username} successfully.`, "success");
        await this.getFriendList();
    } else {
        showToast(`Failed to send friend request to ${username}.`, "danger");
        console.error(`Failed to send friend request to ${username}`);
    }
} catch (error) {
    showToast(`Error sending friend request to ${username}.`, "danger");
    console.error(`Error sending friend request to ${username}:`, error);
  }
  }
}
