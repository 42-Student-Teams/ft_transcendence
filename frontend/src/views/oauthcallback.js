import Component from "../library/component.js";
import {loginOauth, registerUser, userExists, userIsOauth} from "../utils/apiutils.js";
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

                // TODO: we might actually return the username too..
                let regStatus = await loginOauth(tokenResponse['access_token']);
                stateMessage = `Registration status: ${regStatus}`;

                console.log(regStatus)

                console.log(`regStatus: ${JSON.stringify(regStatus)}`);

                // TODO: if logged in, also need jwt token
                if ('jwt' in regStatus) {
                    stateMessage = 'Logged in';
                    store.dispatch("logIn");
                    navigateTo("/");
                } else {
                    stateMessage = 'Error';
                }
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
