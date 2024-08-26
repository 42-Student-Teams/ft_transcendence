import {get_messages} from "./apiutils.js";
import { home } from "/src/utils/langPack.js";
import store from "../store/index.js";

function chatInsertMessage(from, content, atEnd=true, isFirst=false, id=null) {
    const langPack = home[store.state.language];

    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    let firstMarker = "";
    if (isFirst) {
        firstMarker = 'first="true"';
    }
    let msgId = "";
    if (id) {
        msgId = `id="${id}"`;
        //console.log('got id ' + msgId);
    }
    let fromLocalized = from;
    if (from == "You") {
        fromLocalized = langPack.you;
    }
    let msgHtml = `<div ${msgId} class="message my-message" ${firstMarker}>
            <div>
              <div class="chat-name">${fromLocalized}</div>
              <div class="chat-text "></div>
            </div>
          </div>`;
    if (content.startsWith('!match_request')) {
        if (from == "You") {
            msgHtml = `<div ${msgId} class="message my-message" ${firstMarker}>
            <div>
              <div class="chat-name">${fromLocalized}</div>
              <div class="chat-text ">${langPack.youInvitedForGame}</div>
            </div>
          </div>`;
        } else {
            msgHtml = `<div ${msgId} class="message my-message" ${firstMarker}>
            <div>
              <div class="chat-name">${fromLocalized}</div>
              <div class="chat-text ">${langPack.youWereInvited}</div>
              <button class="btn-primary" onclick="window.joinGame(this)">Join</button>
            </div>
          </div>`;
        }
    }
    if (atEnd) {
        chatContainer.innerHTML += msgHtml;
    } else {
        chatContainer.innerHTML = msgHtml + chatContainer.innerHTML;
    }
    if (!content.startsWith('!match_request')) {
        document.getElementById(id).querySelector('.chat-text').innerText = content;
    }
}

async function fetchChatHistory(friend_username) {
    const langPack = home[store.state.language];
    if (document.getElementById("fetch-chat-button")) {
        document.getElementById("fetch-chat-button").remove();
    }
    let firstMsgId = null;
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    let msgs = chatContainer.querySelectorAll("div");
    if (msgs.length > 0) {
        if (msgs[0].hasAttribute("id")) {
            firstMsgId = msgs[0].id;
        }
    }
    let message_response = await get_messages(friend_username, 5, firstMsgId);
    console.log(message_response);
    if (message_response['status'] == 'success' && 'messages' in message_response) {
      message_response['messages'].forEach((message) => {
          //console.log(`${message['id']} vs ${firstMsgId}`);
          if (parseInt(message['id']) == parseInt(firstMsgId)) {
              return;
          }
        let author = message['author_username'];
        if (author != friend_username) {
          author = "You";
        }
        chatInsertMessage(author, message['content'], false, false, message['id']);
      });


        if (!message_response['got_all']) {
            chatContainer.innerHTML = ` <button class="btn btn-primary" id="fetch-chat-button" onclick="window.fetchChatHistory('${friend_username}')">${langPack.chatLoadMore}</button>  ${chatContainer.innerHTML}`;
        }
    } else {
      chatInsertMessage(langPack.failedLoadingChat, "", false);
    }
}

function chatClear() {
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    console.log("Clearing chat component");
    chatContainer.innerHTML = "";
}

export { chatInsertMessage };
export { fetchChatHistory };
export { chatClear };