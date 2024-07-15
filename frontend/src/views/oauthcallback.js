import Component from "../library/component.js";
import {registerUser, userExists, userIsOauth} from "../utils/apiutils.js";
import store from "../store/index.js";
import {navigateTo} from "../utils/router.js";

async function getAccessToken(code) {
    const url = process.env.TOKEN_URL;
    const params = {
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching access token:', error);
    }
}


export async function getUserInfo(accessToken) {
    const url = '/api/v2/me';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

export default class OauthCallback extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        this.components = { 

         };
    }

    async render() {
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        const storedStateData = JSON.parse(sessionStorage.getItem('oauth_state'));
        let stateMessage = 'Invalid state parameter.';

        if (storedStateData) {
            const { state: storedState, expirationTime } = storedStateData;
            const currentTime = Date.now();

            if (state === storedState && currentTime < expirationTime) {
                stateMessage = 'State parameter matches and is valid.';
                const tokenResponse = await getAccessToken(urlParams.get('code'));
                console.log(tokenResponse);
                const userInfo = await getUserInfo(tokenResponse['access_token']);
                console.log(userInfo);
                console.log('----------');
                console.log(await userExists(userInfo['info']));
                console.log('----------');

                let userDoesExist = await userExists(userInfo['info']);
                let userDoesIsOauth = await userIsOauth(userInfo['info']);

                // TODO: if logged in, also need jwt token
                if (userDoesExist && !userDoesIsOauth) {
                    stateMessage = 'User exists and is not oauth.';
                } else if (userDoesExist && userDoesIsOauth) {
                    stateMessage = 'Welcome back, logging in.';
                    //store.dispatch("logIn");
                    //navigateTo("/");
                } else {
                    let regStatus = await registerUser(null, null, userInfo['info'], userInfo['email'], userInfo['password'], true);
                    stateMessage = `Registration status: ${regStatus}`;
                    //store.dispatch("logIn");
                    //navigateTo("/");
                }
                /* TODO: check if we actually got userInfo and not some error */
                /*if () {
                    let response = await registerUser(firstname, lastname, username, email, password);
                    if (response.ok) {
                        console.log('Successfully created account');
                        store.dispatch("logIn");
                        navigateTo("/");
                    } else {
                        console.error("Registration failed:");
                    }
                }*/
            } else if (currentTime >= expirationTime) {
                stateMessage = 'State parameter has expired.';
            }
        }

        const view = /*html*/ `
            <p>Please wait...</p>
            <p>State: ${state}</p>
            <p>${stateMessage}</p>
        `;

        this.element.innerHTML = view;


    }
}
