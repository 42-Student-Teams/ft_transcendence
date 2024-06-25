import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'room_chat'
        self.room_group_name = 'chat_%s' % self.room_name

        self.username = self.scope['query_string'].decode().split('=')[1]

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Notify the group that the user has joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': f'{self.username} has joined the chat',
                'username': 'System',
                'join': True
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Notify the group that the user has left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': f'{self.username} has left the chat',
                'username': 'System',
                'leave': True
            }
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        typing = text_data_json.get('typing', False)
        username = text_data_json.get('username', self.username)

        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username
                }
            )
        elif typing is not None:
            # Send typing status to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_typing',
                    'typing': typing,
                    'username': username
                }
            )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))

    async def chat_typing(self, event):
        typing = event['typing']
        username = event['username']

        # Send typing status to WebSocket
        await self.send(text_data=json.dumps({
            'typing': typing,
            'username': username
        }))
