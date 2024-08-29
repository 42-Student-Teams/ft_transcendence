import {handleMessage} from "../websocket/wshandler.js";
import {handleGameMessage} from "../websocket/wshandler.js";
import store from "../store/index.js";
import state from "../store/state.js";

function openCommWebsocket() {
    if (!localStorage.getItem('jwt')) {
        return;
    }
    /* open socket */
    let socket = new WebSocket(`wss://${window.location.host }/wss/comm/`);
    socket.onmessage = handleMessage;
    socket.addEventListener("open", (ev) => {
        try {
            socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt')}));
        } catch(err) {
            console.log('Failed to send WS.');
        }
    });
    store.dispatch("setWebSocket", socket);
}

export function openGameWebsocket(match_key) {
    console.log(`Opening game socket for key ${match_key}`);
    let socket = new WebSocket(`wss://${window.location.host }/wss/game/`);
    socket.onmessage = handleGameMessage;
    socket.addEventListener("open", (ev) => {
        try {
            socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt'), "match_key": match_key}));
        } catch(err) {
            console.log('Failed to send WS.');
        }
    });
    store.dispatch("setGameSocket", socket);
}

function wsSend(func, content, socket=null) {
    if (func == null) {
        console.error("func cannot be null");
        return;
    }
    let payload = {"func": func};
    for (const [key, value] of Object.entries(content)) {
        payload[key] = value;
    }
    if (socket == null) {
        socket = state.socket;
    }

    try {
        socket.send(JSON.stringify(payload));
    } catch(err) {
        console.log('Failed to send WS.');
    }
}

export { openCommWebsocket };
export { wsSend };