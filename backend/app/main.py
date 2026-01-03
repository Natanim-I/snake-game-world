from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, games, users

app = FastAPI(
    title="Snake Game World API",
    description="API for Snake Game World application",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:8080",
    "http://localhost:5173", # Default Vite port just in case
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(games.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Game World API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
