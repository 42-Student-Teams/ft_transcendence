import {get_messages } from "./apiutils.js";
import { home } from "/src/utils/langPack.js";
import store from "../store/index.js";


async function fetchChatHistoryChunk(friendUsername, firstMsgId) {
    const langPack = home[store.state.language];
    const message_response = await get_messages(friendUsername, 5, firstMsgId);
    //console.log(message_response);
    const collectedMessages = [];
    if (message_response['status'] === 'success' && 'messages' in message_response) {
        for (const message of message_response['messages']) {
            if (firstMsgId && parseInt(message['id']) === parseInt(firstMsgId)) {
                continue; // Skip if it's the same as the first message ID
            }

            let author = message['author_username'];
            if (author !== friendUsername) {
                author = langPack.you;
            }

            collectedMessages.push({
                author: author,
                content: message['content'],
                messageId: `msg-${message['id']}`,
            });
        }

        return {
            status: 'success',
            messages: collectedMessages,
            gotAll: message_response['got_all'],
        };
    }
}

function message_to_dom(message, first) {
    const langPack = home[store.state.language];

    let elem = document.createElement('div');
    elem.id = message.messageId;
    elem.classList.add('message');
    elem.classList.add('my-message');
    let innerDiv = document.createElement('div');
    elem.appendChild(innerDiv);
    let chatName = document.createElement('div');
    chatName.classList.add('chat-name');
    chatName.innerText = message.author;
    innerDiv.appendChild(chatName);
    let chatText = document.createElement('div');
    chatText.classList.add('chat-text');
    if (message.content === '!match_request') {
        if (message.author === langPack.you) {
            chatText.innerText = langPack.youInvitedForGame;
            innerDiv.appendChild(chatText);
        } else {
            chatText.innerText = langPack.youWereInvited;
            innerDiv.appendChild(chatText);
            let joinButton = document.createElement('button');
            joinButton.classList.add('btn-primary');
            joinButton.onclick = function () {window.joinGame(this)};
            joinButton.innerText = langPack.join;
            innerDiv.appendChild(joinButton);
        }
    } else {
        chatText.innerText = message.content;
        innerDiv.appendChild(chatText);
    }
    return (elem);
}

function insertChatHistoryChunk(messages, containsFirst, friendUsername) {
    const langPack = home[store.state.language];
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    for (let i = 0; i < messages.length; i++) {
        let msg = messages[i];
        let is_last = i == messages.length - 1 && containsFirst;
        if (document.getElementById(msg.messageId)) {
            continue;
        }
        let msg_dom = message_to_dom(msg, is_last);
        if (chatContainer.children.length === 0) {
            chatContainer.appendChild(msg_dom);
        } else {
            chatContainer.insertBefore(msg_dom, chatContainer.children[0]);
        }
    }

    if (containsFirst) {
        return;
    }
    let new_load_more = document.createElement("button");
    new_load_more.classList.add("btn");
    new_load_more.classList.add("btn-primary");
    new_load_more.id = "fetch-chat-button";
    new_load_more.innerText = langPack.chatLoadMore;
    new_load_more.onclick = async function () {
        let oldest_message = null;
        let chatContainer = document.getElementById("messages-container");
        if (!chatContainer) {
            return;
        }
        let oldest_id = null;
        if (chatContainer.children.length > 0) {
            let all_msgs = chatContainer.querySelectorAll('.message');
            for (let i = 0; i < all_msgs.length; i++) {
                let msg_div = all_msgs[i];
                if (msg_div.id === 'msg-new') {
                    continue;
                }
                if (oldest_id == null || parseInt(msg_div.id.split('-')[1]) < oldest_id) {
                    oldest_id = parseInt(msg_div.id.split('-')[1]);
                }
            }
        }
        let chunk = await fetchChatHistoryChunk(friendUsername, oldest_id);
        console.log('got chunk');
        console.log(chunk);
        if (chunk) {
            insertChatHistoryChunk(chunk.messages, chunk.gotAll, friendUsername);
            console.log(this);
            chatContainer.removeChild(this);
        }
    };
    if (chatContainer.children.length === 0) {
        chatContainer.appendChild(new_load_more);
    } else {
        chatContainer.insertBefore(new_load_more, chatContainer.children[0]);
    }
}

function insertNewMessage(content, from) {
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    let msg = {
        author: from,
        content: content,
        messageId: 'msg-new'
    };
    let msg_dom = message_to_dom(msg, false);
    chatContainer.appendChild(msg_dom);
}

function chatClear() {
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    console.log("Clearing chat component");
    chatContainer.innerHTML = "";
}

export { chatClear };
export { fetchChatHistoryChunk };
export { insertChatHistoryChunk };
export { insertNewMessage };