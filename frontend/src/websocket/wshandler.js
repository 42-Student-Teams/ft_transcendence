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
  
    /* Updating friend status */
    if (msg_obj['type'] == 'friend_status_update') {
      const sideFriendList = document.querySelector('side-friend-list');
      if (sideFriendList) {
        sideFriendList.updateFriendStatus(msg_obj['username'], msg_obj['status']);
      }
    }
    // if (msg_obj.type === 'friend_status_update') {
    //     store.dispatch("updateFriendStatus", {
    //         username: msg_obj.username,
    //         status: msg_obj.status
    //     });
    // }

  }
  
  export { handleMessage };