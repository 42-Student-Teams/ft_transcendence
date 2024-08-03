import json

from asgiref.sync import async_to_sync

from backend.models import JwtUser

from backend.models import Message

from backend.util import timestamp_now

from backend.consumers.consumer_util import WsConsumerCommon


class GameConsumer(WsConsumerCommon):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.funcs = {
            'ping': self.ping,
        }


    def subscribe_to_groups(self):
        if self.user is None:
            return
        print(f'SUBSCRIBE: {self.user.username}', flush=True)
        if len(self.subscribed_groups) > 0:
            return
        async_to_sync(self.channel_layer.group_add)(
            self.user.username, self.channel_name
        )
        self.subscribed_groups.append(self.user.username)
        friends = self.user.friends.all()
        for friend in friends:
            async_to_sync(self.channel_layer.group_add)(
                friend.username, self.channel_name
            )
            self.subscribed_groups.append(friend.username)


    def ping(self, msg_obj):
        self.send(text_data=json.dumps({'pong': 'pong'}))

    def direct_message(self, msg_obj):
        print(f"Got message command: to: {msg_obj.get('friend_username')}, message: {msg_obj.get('message')}", flush=True)
        friend_username = msg_obj.get('friend_username')
        if friend_username is None or msg_obj.get('message') is None:
            return
        friend = JwtUser.objects.get(username=friend_username)
        if friend is None:
            return
        blocked = self.user.blocked_users.filter(username=friend_username)
        if len(blocked) > 0:
            print(f'BLOCKED: {friend_username}, not sending message', flush=True)
            return
        Message.objects.create(author=self.user, recipient=friend, content=msg_obj.get('message'), timestamp=timestamp_now())
        msg_obj['author'] = self.user.username
        print(f"Relaying message {msg_obj.get('message')} to channel", flush=True)
        print('Groups I\'m in:', flush=True)
        print(self.subscribed_groups, flush=True)
        async_to_sync(self.channel_layer.group_send)(
            friend.username, {"type": "channel_dm", "msg_obj": msg_obj}
        )

    def channel_dm(self, event):
        print("Got dm on channel", flush=True)
        msg_obj = event["msg_obj"]
        if msg_obj.get('friend_username') == self.user.username:
            # it could contain more fields, which is not desirable
            sanitized_msg_obj = {
                'type': 'dm',
                'author': msg_obj.get('author'),
                'message': msg_obj.get('message'),
            }
            self.send(text_data=json.dumps(sanitized_msg_obj));
