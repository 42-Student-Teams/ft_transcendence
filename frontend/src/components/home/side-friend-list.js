import Component from "../../library/component.js";
import { chatClear, fetchChatHistory } from "../../utils/chatUtils.js";
import { showToast } from "../../utils/toastUtils.js";
import store from "../../store/index.js";
import FriendProfileInfo from "../profile/FriendProfileInfo.js";

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
    this.element.addEventListener("click", async (event) => {
      const profileImage = event.target.closest(".view-profile");
      if (profileImage) {
        const username = profileImage.getAttribute('data-username');
        await this.handleViewProfile(username);
      } else {
        let button = event.target.closest(".btn-direct-message");
        if (button) {
          this.handleDirectMessage(event, button.getAttribute('data-username'));
        } else if (event.target.closest(".btn-block")) {
          this.handleBlockFriend(event);
        }
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
          console.log("Friends data:", this.friends)
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
    friendDisplayElement.innerHTML = "";
  
    if (this.friends.length > 0) {
      this.friends.forEach((friend) => {
        console.log("Rendering friend:", friend);
       
        const statusClass = friend.status === 'Connected' ? 'status-connected' : 'status-offline';
        
        // const defaultAvatarPath = '/static/default.png';

        console.log("Avatar path:", friend.avatar);
        // console.log("Default avatar path:", defaultAvatarPath);
        const friendHtml = /*html*/ `
          <div class="friend container py-3" data-username="${friend.username}">
            <div class="row align-items-center">
              <div class="col-8 user-info">
                <div class="d-flex align-items-center">
                  <div class="friend-image position-relative me-3">
                  <img 
                      class="friend-img rounded-circle view-profile" 
                      src="${friend.avatar}" 
                      width="50" 
                      height="50" 
                      data-username="${friend.username}" 
                      style="cursor: pointer;" 
                      onerror="this.onerror=null; this.src='app/media/default_avatar.png';"
                    />
                    <span class="friend-status-indicator ${statusClass}"></span>
                  </div>
                  <div class="friend-info">
                    <div>${friend.username}</div>
                    <small class="friend-status">${friend.status}</small>
                  </div>
                </div>
              </div>
              <div class="col-4 d-flex justify-content-end gap-2">
                <button class="btn btn-icon btn-direct-message" data-username="${friend.username}" title="Message">
                  <i class="fas fa-comment"></i>
                </button>
                <button class="btn btn-icon btn-block" data-username="${friend.username}" title="Block">
                  <i class="fas fa-user-slash"></i>
                </button>
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
        console.log(`Successfully added friend ${username}`);
        await this.getFriendList();
      } else {
        console.error(`Failed to add friend ${username}`);
      }
    } catch (error) {
      console.error(`Error adding friend ${username}:`, error);
    }
  }

//   async handleViewProfile(username) {
//     console.log("Handling view profile for:", username);
//     // Importer dynamiquement le composant FriendProfile
//     const { default: FriendProfile } = await import('/src/views/friendProfile.js');
    
//     // Créer une nouvelle instance de FriendProfile
//     const friendProfileView = new FriendProfile();
    
//     // Définir le nom d'utilisateur de l'ami
//     friendProfileView.setFriendUsername(username);
    
//     // Obtenir l'élément racine de l'application
//     const appElement = document.getElementById("app");
    
//     // Vider le contenu actuel de l'app
//     appElement.innerHTML = '';
    
//     // Ajouter la vue rendue à l'élément app
//     appElement.appendChild(friendProfileView.element);
// }
  async handleViewProfile(username) {
    console.log("Handling view profile for:", username);
    const { default: FriendProfile } = await import('/src/views/friendProfile.js');
    
    const friendProfileView = new FriendProfile();
    friendProfileView.setFriendUsername(username);
}


}
