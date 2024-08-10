import {chatInsertMessage} from "../utils/chatUtils.js";
import {openGameWebsocket} from "../utils/wsUtils.js"
import state from "../store/state.js";
import store from "../store/index.js";
import {updateFromSocket} from "../views/localGame.js";

function handleMessage(msg) {
    console.log('Received socket message:');
    if (!('data' in msg)) {
        return;
    }
    let msg_obj = JSON.parse(msg['data']);
    console.log(msg);

    if (!('type' in msg_obj)) {
        return;
    }

    switch(msg_obj['type']) {
        case 'dm':
            chatInsertMessage(msg_obj['author'], msg_obj['message']);
            break;
        /* 3) get an id to check against when we get an acknowledgement which isn't against a bot */
        /* Happens when requesting a match vs a player, which has to yet to be matched */
        case 'match_request_id':
            if ('id' in msg_obj) {
                store.dispatch("setGameRequestId", msg_obj['id']);
            }
            break;
        /* 3.5) Happens immediately when playing against bot, or after an opponent got matched */
        case 'game_acknowledgement':
            if (('match_key' in msg_obj)) {
                openGameWebsocket(msg_obj['match_key']);
            }
            break;
        default:
            return;
    }
}

function handleGameMessage(msg) {
    //console.log('Received socket game message:');
    if (!('data' in msg)) {
        return;
    }
    let msg_obj = JSON.parse(msg['data']);
    //console.log(msg);

    if (!('type' in msg_obj)) {
        return;
    }

    switch(msg_obj['type']) {
        case 'start':
            console.log('start');
            let gameData = {
                                'game_type': msg_obj['game_type'],
                                'ball_color': msg_obj['ball_color'],
                                'fast': msg_obj['fast'],
                                'opponent_username': msg_obj['opponent'],
                                'is_bot': msg_obj['is_bot']
                                };
            // This might actually not be needed, since we pass gameData directly to startGame
            store.dispatch("setCurrentGameData", gameData);
            window.startGame(gameData);
            break;
        case 'relay_from_controller':
            updateFromSocket(msg_obj);
            break;
        default:
            return;
    }
}

export { handleMessage };
export { handleGameMessage };