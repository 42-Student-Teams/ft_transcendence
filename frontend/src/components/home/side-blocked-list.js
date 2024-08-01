import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";

export default class SideBlockedList extends Component {
    constructor() {
        super({ element: document.getElementById("side-blocked-list") });
        this.blocked = []; // Initialize blocked users as an empty array
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div id="block-display" class="blocked-list flex-grow-1 overflow-auto">
            </div>
        `;

        this.element = document.getElementById("side-blocked-list");
        this.element.innerHTML = view;
        this.handleEvent();
    }

	async handleEvent() {
		document.getElementById("btn-toggle-blocked").addEventListener("click", async (event) => {
			event.preventDefault();
			await this.getBlockedList(); // Fetch and display the blocked list
		  });
    }

	async getBlockedList() {
		try {
		  const jwt = localStorage.getItem('jwt');
		  const apiurl = process.env.API_URL;
		  const response = await fetch(`${apiurl}/block_list`, {
			method: 'GET',
			headers: {
			  'Authorization': `Bearer ${jwt}`,
			  'Content-Type': 'application/json'
			}
		  });
	
		  if (response.ok) {
			this.blocked = await response.json();

			this.renderBlockedList();
		  } else {
			console.error('Failed to fetch blocked list');
		  }
		} catch (error) {
		  console.error('Error fetching blocked list:', error);
		}
	  }

    renderBlockedList() {
        const blockDisplayElement = document.getElementById("block-display");
        blockDisplayElement.innerHTML = ''; // Clear any existing content
        if (this.blocked.blocked_users.length > 0) {
            this.blocked.blocked_users.forEach((user, index) => {
                const profilePicture = [ProfilePicture1, ProfilePicture2, ProfilePicture3][index % 3]; // Cycle through profile pictures
                const userHtml = /*html*/ `
                    <div class="friend container py-3" data-username="${user.username}">
                        <div class="row mr-4">
                            <div class="col-8 container user-info">
                                <div class="row">
                                    <div class="col friend-image">
                                        <img class="friend-img" src=${profilePicture} />
                                    </div>
                                    <div class="col friend-info">
                                        <span>${user.username}</span>
                                        <span class="friend-status">Blocked</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4 d-flex gap-2 friend-action">
                                <button class="btn rounded btn-unblock" data-username="${user.username}"><i class="fa-solid fa-user-xmark"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                blockDisplayElement.insertAdjacentHTML('beforeend', userHtml);
            });

            // Add event listeners to the buttons after rendering
            this.element.querySelectorAll('.btn-unblock').forEach(button => {
                button.addEventListener('click', (event) => this.handleUnblockUser(event));
            });
        } else {
            blockDisplayElement.innerHTML = '<p>No blocked users found.</p>';
        }
    }

    async handleUnblockUser(event) {
        const button = event.currentTarget;
        const username = button.getAttribute('data-username');
        const userContainer = button.closest('.friend'); // Get the parent container of the user

        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL; // This should be replaced with the actual API URL
            const response = await fetch(`${apiurl}/unblock_user`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            if (response.ok) {
                // Remove the user container from the DOM
                userContainer.remove(); 
                // Optionally, add the user back to the friends list
                // You could call a method here to update the friends list if needed
            } else {
                console.error(`Failed to unblock user ${username}`);
            }
        } catch (error) {
            console.error(`Error unblocking user ${username}:`, error);
        }
    }
}
