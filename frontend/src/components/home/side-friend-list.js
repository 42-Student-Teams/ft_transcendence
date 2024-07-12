import Component from "../../library/component.js";
import ProfilePicture1 from "../../assets/image/pp-6.jpg";


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
			<div  class="d-flex flex-grow-0 gap-3 pb-4">
				<input type="text" id="" class="form-control" placeholder="Username" />
				<button id="btn-add-friend" class="btn btn-success flex-fill"><i id="icon-send" class="ml-4 fa fa-user-plus "></i></button>
			</div>
			<div class="friends-list overflow-auto flex-grow-1">
				<div class="friend container py-3" >
					<div class="row">
						<div class="col-9 container user-info">
							<div class="row">
								<div class="col friend-image">
									<img class=" friend-img" src=${ProfilePicture1} />
								</div>
							<div class="col friend-info">
								<span>Lsaba-qu</span>
								<span class="friend-status">Online</span>
							</div>
						</div>
					</div>
					<div class="col-3 d-flex gap-2 friend-action">
						<button class="btn rounded"><i class="fa-solid fa-comment"></i></button>
						<button class="btnrounded"><i class="fa-solid fa-user-large-slash"></i></button>
					</div>
				</div>
			</div>
        `;

        this.element = document.getElementById("side-friend-list");
        this.element.innerHTML = view;
    }
}
