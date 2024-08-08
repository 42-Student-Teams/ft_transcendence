import {handleMessage} from "../websocket/wshandler.js";
import {handleGameMessage} from "../websocket/wshandler.js";
import store from "../store/index.js";
import state from "../store/state.js";

function openCommWebsocket() {
    /* open socket */
    let socket = new WebSocket(`wss://${window.location.host }/wss/comm/`);
    socket.onmessage = handleMessage;
    socket.addEventListener("open", (ev) => {
        socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt')}));
    });
    store.dispatch("setWebSocket", socket);
}

export function openGameWebsocket(match_key) {
    let socket = new WebSocket(`wss://${window.location.host }/wss/game/`);
    socket.onmessage = handleGameMessage;
    socket.addEventListener("open", (ev) => {
        socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt'), "match_key": match_key}));
    });
    store.dispatch("setGameSocket", socket);

    // TODO: we also want an onclose, which redirects the user to /home
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
    socket.send(JSON.stringify(payload));
}

export { openCommWebsocket };
export { wsSend };