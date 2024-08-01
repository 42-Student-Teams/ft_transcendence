
import Component from "../library/component.js";
import NavBar from '../components/home/navbar.js';

export default class Login extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        this.components = {
			navBar: new NavBar(),
         };
    }

    async render() {

        const view = /*html*/ `
		<div class="h-100 d-flex flex-column bg-custom">
			<div class="row m-0">
    	    	<nav class="navbar navbar-expand bg-white shadow-sm w-100" id="navBar"></nav>
    		</div>
			<div class="container-fluid">
				<form id="edit-profile-form">
            	    <div class="">
            	        <h5 class="-title">Edit Profile</h5>
            	    </div>
            	    <div class="">
            	        <div class="p-3">
            	            <label for="edit-profile-picture" class="form-label">Profile Picture</label>
            	            <input type="file" class="form-control" id="edit-profile-picture">
            	        </div>
            	        <div class="p-3">
            	            <label for="edit-username" class="form-label">Username</label>
            	            <input type="text" class="form-control" id="edit-username" required>
            	        </div>
            	        <div class="p-3">
            	            <label for="edit-email" class="form-label">Email</label>
            	            <input type="email" class="form-control" id="edit-email" required>
            	        </div>
            	    </div>
            	    <div class="">
            	        <button type="submit" class="btn btn-success">Save changes</button>
            	    </div>
            	</form>
			</div>
        </div>
        `;

        this.element.innerHTML = view;
    }
}



/*
 
*/ 