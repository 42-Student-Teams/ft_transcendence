import Component from "../../library/component.js";
import { showToast } from "../../utils/toastUtils.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";
import { home } from "/src/utils/langPack.js";
import store from "../../store/index.js";

export default class SideBlockedList extends Component {
    constructor() {
        super({ element: document.getElementById("side-blocked-list") });
        this.blocked = [];
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
            await this.getBlockedList();
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
        const langPack = home[this.currentLang];
        const blockDisplayElement = document.getElementById("block-display");
        blockDisplayElement.innerHTML = '';
        if (this.blocked.blocked_users.length > 0) {
            this.blocked.blocked_users.forEach((user, index) => {
                const profilePicture = [ProfilePicture1, ProfilePicture2, ProfilePicture3][index % 3];
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
                                        <span class="friend-status">${langPack.blocked}</span>
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

            this.element.querySelectorAll('.btn-unblock').forEach(button => {
                button.addEventListener('click', (event) => this.handleUnblockUser(event));
            });
        } else {
            blockDisplayElement.innerHTML = `<p>${langPack.noBlockedUsersFound}</p>`;
        }
    }

    async handleUnblockUser(event) {
        const langPack = home[this.currentLang];
        const button = event.currentTarget;
        const username = button.getAttribute('data-username');
        const userContainer = button.closest('.friend');

        console.log(`Unblocking: ${username}`);

        try {
            const jwt = localStorage.getItem('jwt');
            const apiurl = process.env.API_URL;

            const response = await fetch(`${apiurl}/unblock_user`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            if (response.ok) {
                userContainer.remove();
                showToast(langPack.userUnblockedSuccess.replace('{username}', username), "success");
            } else {
                console.error(`Failed to unblock user ${username}`);
                showToast(langPack.userUnblockFailed.replace('{username}', username), "danger");
            }
        } catch (error) {
            console.error(`Error unblocking user ${username}:`, error);
            showToast(langPack.userUnblockError.replace('{username}', username), "danger");
        }
    }
}