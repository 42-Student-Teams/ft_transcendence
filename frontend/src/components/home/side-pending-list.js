import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";
import ProfilePicture2 from "../../assets/image/pp-7.png";
import ProfilePicture3 from "../../assets/image/pp-8.jpg";


export default class SidePendingList extends Component {
    constructor() {
        super({ element: document.getElementById("side-pending-list") });
        this.render();
    }

    async render() {

        const view = /*html*/ `
			<div class="blocked-list flex-grow-1 overflow-auto">
				<div class="friend container py-3">
					<div class="row mr-4">
						<div class="col-8 container user-info">
							<div class="row">
								<div class="col friend-image">
									<img class="friend-img" src=${ProfilePicture1} />
								</div>
								<div class="col friend-info">
									<span>Lsaba-qu</span>
									<span class="friend-status">Blocked</span>
								</div>
							</div>
						</div>
						<div class="col-4 d-flex gap-2  friend-action">
							<button class="btn rounded btn-unblock"><i class="fa-solid fa-user-plus"></i></button>
						</div>
					</div>
				</div>
				<div class="friend container py-3 ">
					<div class="row mr-4">
						<div class="col-8 container user-info">
							<div class="row">
								<div class="col friend-image">
									<img class="friend-img" src=${ProfilePicture2} />
								</div>
								<div class="col friend-info">
									<span>Lsaba-qu</span>
									<span class="friend-status">Blocked</span>
								</div>
							</div>
						</div>
						<div class="col-4 d-flex gap-2  friend-action">
							<button class="btn rounded btn-unblock"><i class="fa-solid fa-user-plus"></i></button>
						</div>
					</div>
				</div>
				<div class="friend container py-3 ">
					<div class="row mr-4">
						<div class="col-8 container user-info">
							<div class="row">
								<div class="col friend-image">
									<img class="friend-img" src=${ProfilePicture3} />
								</div>
								<div class="col friend-info">
									<span>Lsaba-qu</span>
									<span class="friend-status">Blocked</span>
								</div>
							</div>
						</div>
						<div class="col-4 d-flex gap-2 friend-action">
							<button class="btn rounded btn-unblock"><i class="fa-solid fa-user-plus"></i></button>
						</div>
					</div>
				</div>
			</div>

			
        `;

        this.element = document.getElementById("side-pending-list");
        this.element.innerHTML = view;
		this.handleEvent();
    }

	async handleEvent() {
		this.element.querySelector(".btn-unblock").addEventListener("click", () => {

		});
	}
}
