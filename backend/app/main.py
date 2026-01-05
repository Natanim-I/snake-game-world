import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
from .routers import auth, leaderboard, games, users
from .db.session import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("snake-game")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    logger.info("Starting up application...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # We don't raise here to allow the app to start and serve a debug message
    yield
    # Shutdown: cleanup if needed
    logger.info("Shutting down application...")

app = FastAPI(
    title="Snake Game World API",
    description="API for Snake Game World application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - be more permissive for production debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(games.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/api")
async def root():
    return {"message": "Welcome to Snake Game World API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Debug routes endpoint
@app.get("/api/debug/routes")
async def list_routes():
    return [{"path": route.path, "name": route.name, "methods": list(route.methods)} for route in app.routes]

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
logger.info(f"Static directory identified: {static_dir}")

if os.path.exists(static_dir):
    logger.info("Static directory found. Serving frontend and SPA routing.")
    
    # Catch-all for SPA must be registered LAST
    # However, mounting static must happen BEFORE catch-all but AFTER API
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    # Serve index.html for root
    @app.get("/")
    async def serve_root():
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse({"error": "index.html not found"}, status_code=404)

    # SPA catch-all
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Skip API paths
        if full_path.startswith("api"):
            logger.warning(f"API path {full_path} not found in routers, falling through to 404")
            return JSONResponse({"detail": "Not Found"}, status_code=404)

        # If it's a file request (has an extension), try to serve the file
        if "." in full_path.split("/")[-1]:
            file_path = os.path.join(static_dir, full_path)
            if os.path.exists(file_path):
                return FileResponse(file_path)
        
        # Default to index.html for SPA routing
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return JSONResponse({"detail": "Not Found"}, status_code=404)
else:
    logger.warning("Static directory NOT found. Only API endpoints are available.")
    @app.get("/")
    async def root_no_static():
        return {"message": "API is running. Static files directory not found."}

# Global 404 handler for non-GET methods or when SPA catch-all is skipped
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    logger.warning(f"404 Not Found: {request.method} {request.url.path} - {exc.detail}")
    return JSONResponse(
        status_code=404,
        content={"detail": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)



