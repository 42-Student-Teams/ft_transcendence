import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";

export default class SideFriendList extends Component {
  constructor() {
    super({ element: document.getElementById("side-friend-list") });
    this.friends = []; // Initialize friends as an empty array
    this.render();
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
      <div id="friend-list-display" class="friends-list flex-grow-1 overflow-auto">
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

    this.element = document.getElementById("side-friend-list");
    this.element.innerHTML = view;
    this.handleEvent();
    this.getFriendList();
  }

  async handleEvent() {
    const directMessageButtons = this.element.querySelectorAll(
      ".btn-direct-message"
    );
    directMessageButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const sideChat = document.getElementById("side-chat");
        const friendlist = document.getElementById("side-friend-list");
        const btnBlocked = document.getElementById("btn-toggle-blocked");
        const btnFriends = document.getElementById("btn-toggle-friends");

        console.log("Direct messages");
        if (sideChat.classList.contains("d-none")) {
          friendlist.classList.remove("d-flex");
          friendlist.classList.add("d-none");
          sideChat.classList.remove("d-none");
          sideChat.classList.add("d-flex");
          btnBlocked.classList.remove("active");
          btnFriends.classList.remove("active");
        }
      });
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

      console.log("Response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Friends Data received:", data);
        this.friends = data.friends || []; // Ensure it's an array
        this.renderFriendList();
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
    console.log("Friends:", this.friends);

    if (this.friends.length > 0) {
      this.friends.forEach((friend, index) => {
        const profilePicture = [
          ProfilePicture1,
          ProfilePicture2,
          ProfilePicture3,
        ][index % 3]; // Cycle through profile pictures
        const friendHtml = /*html*/ `
          <div class="friend container py-3" data-username="${friend.username}">
            <div class="row mr-4">
              <div class="col-8 container user-info">
                <div class="row">
                  <div class="col friend-image">
                    <img class="friend-img" src=${profilePicture} />
                  </div>
                  <div class="col friend-info">
                    <span>${friend.username}</span>
                    <span class="friend-status">${friend.status}</span>
                  </div>
                </div>
              </div>
              <div class="col-4 d-flex gap-2 friend-action">
                <button class="btn-direct-message btn rounded"><i class="fa-solid fa-comment"></i></button>
                <button class="btn rounded btn-block" data-username="${friend.username}"><i class="fa-solid fa-user-large-slash"></i></button>
              </div>
            </div>
          </div>
        `;
        friendDisplayElement.insertAdjacentHTML("beforeend", friendHtml);
      });

      // Add event listeners to the buttons after rendering
      this.element.querySelectorAll(".btn-block").forEach((button) => {
        button.addEventListener("click", (event) =>
          this.handleBlockFriend(event)
        );
      });
    } else {
      friendDisplayElement.innerHTML = "<p>No friends found.</p>";
    }
  }

  async handleBlockFriend(event) {
    const button = event.currentTarget;
    const username = button.getAttribute("data-username");
    const friendContainer = button.closest(".friend"); // Get the parent container of the friend

    try {
      const jwt = localStorage.getItem("jwt");
      const apiurl = process.env.API_URL; // This should be replaced with the actual API URL
      const response = await fetch(`${apiurl}/block_user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        console.log(`Successfully unblocked friend ${username}`);
        // Remove the friend container from the DOM
        friendContainer.remove();
      } else {
        console.error(`Failed to unblock friend ${username}`);
      }
    } catch (error) {
      console.error(`Error unblocking friend ${username}:`, error);
    }
  }

  async addFriend(username) {
    try {
      const jwt = localStorage.getItem("jwt");
      const apiurl = process.env.API_URL; // This should be replaced with the actual API URL
      const response = await fetch(`${apiurl}/add_friend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friend_username: username }),
      });

      if (response.ok) {
        console.log(`Successfully added friend ${username}`);
        // Optionally, update the friend list after adding a new friend
        await this.getFriendList();
      } else {
        console.error(`Failed to add friend ${username}`);
      }
    } catch (error) {
      console.error(`Error adding friend ${username}:`, error);
    }
  }
}
