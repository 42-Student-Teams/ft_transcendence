import {handleMessage} from "../websocket/wshandler.js";
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