from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

def setup_module(module):
    # Reset mock database for tests
    db.users = []
    db.leaderboard = []
    db.active_games = []
    db.initialize_mock_data()

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Game World API"}

def test_login_success():
    response = client.post(
        "/auth/login",
        json={"email": "master@snake.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "master@snake.com"

def test_login_failure():
    response = client.post(
        "/auth/login",
        json={"email": "master@snake.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_leaderboard():
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_leaderboard_filter():
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert all(entry["mode"] == "walls" for entry in data)

def test_submit_score():
    # Submit score requires token
    token = "mock-token"
    headers = {"Authorization": f"Bearer {token}"}
    score_data = {"score": 200, "mode": "walls"}
    
    response = client.post("/leaderboard", json=score_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["rank"] == 4 # Rank depends on existing mock data

def test_get_active_games():
    response = client.get("/games/active")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_get_me_unauthenticated():
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_get_me_authenticated():
    response = client.get("/auth/me", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "1" # Mock helper returns user 1
