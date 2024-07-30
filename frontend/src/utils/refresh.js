import SideFriendList from '../components/home/side-friend-list.js';
import SidePendingList from '../components/home/side-pending-list.js';
import SideBlockedList from '../components/home/side-blocked-list.js';

const listMap = {
  friend: SideFriendList,
  pending: SidePendingList,
  blocked: SideBlockedList,
};

export function refreshList(listName) {
  const ListComponent = listMap[listName];

  if (ListComponent) {
    const listInstance = new ListComponent();
    listInstance.render();
    console.log(`Refreshing ${listName} list`);
  } else {
    console.error(`Unknown list name: ${listName}`);
  }
}
