import {handleMessage} from "../websocket/wshandler.js";
import store from "../store/index.js";

function openCommWebsocket() {
    /* open socket */
    let socket = new WebSocket(`wss://${window.location.host }/wss/comm/`);
    socket.onmessage = handleMessage;
    socket.addEventListener("open", (ev) => {
      socket.send(JSON.stringify({"jwt": localStorage.getItem('jwt')}));
    });
    store.dispatch("setWebSocket", socket);
}

export { openCommWebsocket };