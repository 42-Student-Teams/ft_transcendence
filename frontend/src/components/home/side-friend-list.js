import Component from "../../library/component.js";
import SideChat from './side-chat.js';
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";

export default class SideFriendList extends Component {
    constructor() {
        super({ element: document.getElementById("side-friend-list") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div>
                <h1>You can add friends with their username.</h1>
            </div>
            <div class="d-flex flex-grow-0 gap-3 pb-4">
                <input type="text" id="friend-username-input" class="form-control" placeholder="Username" />
                <button id="btn-add-friend" class="btn btn-success flex-fill">
                    <i id="icon-send" class="ml-4 fa fa-user-plus"></i>
                </button>
            </div>
            <div class="friends-list flex-grow-1 overflow-auto">
                <!-- Friends list will be dynamically loaded here -->
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
        // await this.loadFriends(); // Charger les amis lors de l'initialisation
        this.handleEvent();
    }

    // async loadFriends() {
    //     try {
    //         const response = await fetch('http://localhost:8069/backend/get_friends/', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         });
    //         const data = await response.json();
    //         if (data.status === 'success') {
    //             data.friends.forEach(friend => {
    //                 this.addFriendToList(friend.username, friend.status, friend.profile_picture);
    //             });
    //         } else {
    //             console.error(data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    addFriendToList(friendUsername, status = 'Offline', profilePicture = null) {
        const friendsList = this.element.querySelector('.friends-list');
        const newFriendElement = document.createElement('div');
        newFriendElement.className = 'friend container py-3';
        newFriendElement.innerHTML = `
            <div class="row mr-4">
                <div class="col-8 container user-info">
                    <div class="row">
                        <div class="col friend-image">
                            <img class="friend-img" src="${profilePicture || ProfilePicture1}" />
                        </div>
                        <div class="col friend-info">
                            <span>${friendUsername}</span>
                            <span class="friend-status-${status.toLowerCase()}">${status}</span>
                        </div>
                    </div>
                </div>
                <div class="col-4 d-flex gap-2 friend-action">
                    <button class="btn-direct-message btn rounded"><i class="fa-solid fa-comment"></i></button>
                    <button class="btn rounded" data-bs-toggle="modal" data-bs-target="#block-friend-modal"><i class="fa-solid fa-user-large-slash"></i></button>
                </div>
            </div>
        `;
        friendsList.appendChild(newFriendElement);
        this.attachDirectMessageEvent(newFriendElement.querySelector('.btn-direct-message'));
    }

    async handleEvent() {
        const addFriendButton = this.element.querySelector("#btn-add-friend");
        const friendUsernameInput = this.element.querySelector("#friend-username-input");

        addFriendButton.addEventListener("click", async (event) => {
            event.preventDefault();
            const friendUsername = friendUsernameInput.value.trim();
            
            if (friendUsername) {
                try {
                    const response = await fetch('http://localhost:8069/backend/add_friend/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            friend_username: friendUsername
                        })
                    });
                    const data = await response.json();
                    console.log(data);
                    if (data.status === 'success') {
                        alert(data.message);
                        this.addFriendToList(friendUsername);
                        print (friendUsername);
                        friendUsernameInput.value = ''; // Clear input after success
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while adding friend');
                }
            } else {
                alert('Please enter a username');
            }
        });

        this.attachAllDirectMessageEvents();
    }

    attachAllDirectMessageEvents() {
        const directMessageButtons = this.element.querySelectorAll(".btn-direct-message");
        directMessageButtons.forEach(button => this.attachDirectMessageEvent(button));
    }



    attachDirectMessageEvent(button) {
        button.addEventListener("click", (event) => {
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

                const friendElement = event.target.closest('.friend');
                const friendUsername = friendElement.querySelector('.friend-info span').textContent;
                const sideChartInstance = new SideChat(friendUsername);
                sideChartInstance.initializeChat();
            }
        });
    }
}