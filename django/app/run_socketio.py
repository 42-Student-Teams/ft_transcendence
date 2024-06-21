
import os
import uvicorn

if __name__ == "__main__":
    print("Starting server on http://0.0.0.0:8000")
    uvicorn.run("app.asgi:application", host="0.0.0.0", port=8000, reload=True)
