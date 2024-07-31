function handleMessage(msg) {
    console.log('Received socket message:');
    if (!('data' in msg)) {
        return;
    }
    let msg_obj = JSON.parse(msg['data']);
    console.log(msg);


    /* Updating chat messages */
    let chatContainer = document.getElementById("messages-container");
    if (!chatContainer) {
        return;
    }
    chatContainer.innerHTML += `<div class="message my-message">
            <div>
              <div class="chat-name">${msg_obj['author']}</div>
              <div class="chat-text ">${msg_obj['message']}</div>
            </div>
          </div>`;
}

export { handleMessage };