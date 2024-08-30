import {insertNewMessage} from "../utils/chatUtils.js";
import {openGameWebsocket} from "../utils/wsUtils.js"
import {showToast, showTournamentInvite} from "../utils/toastUtils.js";
import {updateFromSocket} from "../views/localGame.js";
import store from "/src/store/index.js";
import { home } from "../utils/langPack.js";
import {navigateTo} from "../utils/router.js";

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
        case 'game_bye':
            console.log('Received BYE');
            console.log(msg_obj);
            navigateTo('/');
            if ('match_key' in msg_obj) {
                console.log(`Hiding any ${msg_obj['match_key']} invites`);

                let selector = `.tournament-toast[data-match-key="${msg_obj['match_key']}"]`;
                let element = document.querySelector(selector);
                if (element) {
                    element.parentElement.removeChild(element);
                }
            }
            break;
        case 'dm':
            insertNewMessage(msg_obj['message'], msg_obj['author']);
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
        case 'tournament_game_invite':
            if (('match_key' in msg_obj) && ('tournament_id' in msg_obj)) {
                showTournamentInvite(msg_obj['match_key'], msg_obj['tournament_id']);
            }
            break;
        case 'friend_status_update':
            console.log('Dispatching friend status update event:', msg_obj.username, msg_obj.status);
            document.dispatchEvent(new CustomEvent('friendStatusUpdate', {
                detail: { username: msg_obj.username, status: msg_obj.status }
            }));
            // Mettre à jour le store
            store.dispatch("updateFriendStatus", {
                username: msg_obj.username,
                status: msg_obj.status
            });
        case 'toast':
            if (!('localization' in msg_obj)) {
                return;
            }
            console.log(`Got toast: ${msg_obj['localization']}`);
            const langPack = home[store.state.language];
            let localized_message = msg_obj['localization'];
            Object.keys(langPack).forEach(key => {
                const placeholder = `%${key}%`;
                localized_message = localized_message.replaceAll(placeholder, langPack[key]);
            });
            let toast_type = "success";
            if ('type' in msg_obj) {
                toast_type = msg_obj['type'];
            }
            let timeout = 5000;
            if ('timeout' in msg_obj) {
                timeout = parseInt(msg_obj['timeout']);
            }
            showToast(localized_message, toast_type, timeout);
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
        case 'game_bye':
            console.log('Received BYE');
            navigateTo('/');
            break;
        case 'start':
            console.log('start');
            let gameData = {
                                'game_type': msg_obj['game_type'],
                                'ball_color': msg_obj['ball_color'],
                                'fast': msg_obj['fast'],
                                'opponent_username': msg_obj['opponent'],
                                'author_username': msg_obj['author'],
                                'is_bot': msg_obj['is_bot'],
                                'author_nickname': msg_obj['author_nickname'],
                                'opponent_nickname': msg_obj['opponent_nickname'],
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