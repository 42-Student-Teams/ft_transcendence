import {chatInsertMessage} from "../utils/chatUtils.js";

function handleMessage(msg) {
    console.log('Received socket message:');
    if (!('data' in msg)) {
        return;
    }
    let msg_obj = JSON.parse(msg['data']);
    console.log(msg);


    /* Updating chat messages */
    if (msg_obj['type'] == 'dm') {
        chatInsertMessage(msg_obj['author'], msg_obj['message']);
    }
}

export { handleMessage };