import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from .routers import auth, leaderboard, games, users
from .db.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="Snake Game World API",
    description="API for Snake Game World application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:8080",
    "http://localhost:5173", # Default Vite port just in case
    "http://127.0.0.1:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(games.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/api")
async def root():
    return {"message": "Welcome to Snake Game World API"}

# Mount static files
# Static directory will be in the project root after build
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    # Serve index.html for the root and any other routes not handled by API
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If the path looks like a file (has an extension), don't serve index.html
        if "." in full_path.split("/")[-1]:
            # Try to serve from static directly if not under /static prefix
            file_path = os.path.join(static_dir, full_path)
            if os.path.exists(file_path):
                return FileResponse(file_path)
            
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    async def root_no_static():
        return {"message": "API is running. Static files directory not found."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)


