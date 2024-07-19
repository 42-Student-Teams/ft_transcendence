import store from "../store/index.js";
import {navigateTo} from "./router.js";

async function registerUser(username, password) {
    try {
        const data = {
            username: username,
            password: password
        };
        const apiurl = process.env.API_URL;

        const response = await fetch(`${apiurl}/create_user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },body: JSON.stringify(data)
        });

        console.log(`url: ${apiurl}/create_user - response: ${response}`);

        return (response);
    } catch (error) {
        console.error("An error occurred:", error);
        return ({ok: false});
    }
}

async function loginOauth(oauth_token) {
    try {
        const data = {
            oauth_token: oauth_token
        };
        const apiurl = process.env.API_URL;
        const response = await fetch(`${apiurl}/login_oauth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },body: JSON.stringify(data)
        });

        //return (response);
        const result = await response.json();
        return result;
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
export { loginOauth }