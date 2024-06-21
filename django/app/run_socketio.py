import os
import uvicorn

if __name__ == "__main__":
    print("Starting server on http://localhost:8069")
    uvicorn.run("app.asgi:application", host="localhost", port=8069, reload=True)
