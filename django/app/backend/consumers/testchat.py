import json
from channels.generic.websocket import WebsocketConsumer



class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print('someone connected', flush=True)
        self.accept()

    def disconnect(self, close_code):
        print('someone disconnected', flush=True)

    def receive(self, text_data):
        print(text_data, flush=True)
        print(dir(text_data), flush=True)
        print(text_data.upper(), flush=True)
        self.send(text_data=json.dumps({
            'message': 'lololol'
        }))
        return
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.send(text_data=json.dumps({
            'message': message
        }))
