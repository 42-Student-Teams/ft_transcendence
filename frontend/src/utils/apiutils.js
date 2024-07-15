import store from "../store/index.js";
import {navigateTo} from "./router.js";

async function registerUser(firstname, lastname, username, email, password, isoauth=false) {
    try {
        const data = {
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            password: password,
            isoauth: isoauth
        };
        const apiurl = process.env.API_URL;
        const response = await fetch(`${apiurl}/create_user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },body: JSON.stringify(data)
        });

        return (response);
    } catch (error) {
        console.error("An error occurred:", error);
        return ({ok: false});
    }
}

async function userExists(username) {
    try {
        const data = {
            username: username
        };
        const apiurl = process.env.API_URL;
        const response = await fetch(`${apiurl}/user_exists`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },body: JSON.stringify(data)
        });

        return (response.json()['status']);
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

async function userIsOauth(username) {
    try {
        const data = {
            username: username
        };
        const apiurl = process.env.API_URL;
        const response = await fetch(`${apiurl}/user_isoauth`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },body: JSON.stringify(data)
        });

        return (response.json()['status']); // TODO: check this
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

export { registerUser };
export { userExists };
export  { userIsOauth };