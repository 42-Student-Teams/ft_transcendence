import os
from socketio_server import app

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://127.0.0.1:8069")
    uvicorn.run(app, host="127.0.0.1", port=8069) # lance le serveur socket.io sur le port 8069
