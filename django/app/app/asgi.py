"""
ASGI config for app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django
import socketio
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

# Crée une instance de serveur socket.io
sio = socketio.AsyncServer(async_mode='asgi')
django_asgi_app = get_asgi_application()

# Crée une application ASGI avec le serveur socket.io et l'application Django
application = socketio.ASGIApp(sio, django_asgi_app)

@sio.event
async def connect(sid, environ):
    print('Client connected:', sid)

@sio.event
async def disconnect(sid):
    print('Client disconnected:', sid)

@sio.event
async def message(sid, data):
    print('Message from {}: {}'.format(sid, data))
    await sio.emit('message', {'username': data['username'], 'message': data['message']}, to=sid)