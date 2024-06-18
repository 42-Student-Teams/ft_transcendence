import os
import django
import socketio
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

sio = socketio.Server(async_mode='asgi')
django_asgi_app = get_asgi_application()
app = socketio.ASGIApp(sio, django_asgi_app)

@sio.event
def connect(sid, environ):
    print('Client connected:', sid)

@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)

@sio.event
def message(sid, data):
    print('Message from {}: {}'.format(sid, data))
    sio.send({'message': data['message']})
