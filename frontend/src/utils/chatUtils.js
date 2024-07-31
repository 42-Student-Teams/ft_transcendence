import {get_messages} from "./apiutils.js";

function chatInsertMessage(from, content, atEnd=true, isFirst=false, id=null) {
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
        console.log('got id ' + msgId);
    }
    let msgHtml = `<div ${msgId} class="message my-message" ${firstMarker}>
            <div>
              <div class="chat-name">${from}</div>
              <div class="chat-text ">${content}</div>
            </div>
          </div>`;
    if (atEnd) {
        chatContainer.innerHTML += msgHtml;
    } else {
        chatContainer.innerHTML = msgHtml + chatContainer.innerHTML;
    }
}

async function fetchChatHistory(friend_username) {
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
          console.log(`${message['id']} vs ${firstMsgId}`);
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
            chatContainer.innerHTML = ` <button id="fetch-chat-button" onclick="window.fetchChatHistory('${friend_username}')">Load more</button>  ${chatContainer.innerHTML}`;
        }
    } else {
      chatInsertMessage("Error, failed loading messages", "", false);
    }
}

export { chatInsertMessage };
export { fetchChatHistory };