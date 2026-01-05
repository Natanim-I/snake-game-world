"""Integration tests for authentication endpoints"""
import pytest

@pytest.mark.asyncio
async def test_register_new_user(client):
    """Test user registration"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["token"] is not None
    assert data["user"]["username"] == "newuser"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["highScore"] == 0
    assert data["user"]["gamesPlayed"] == 0

@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    """Test registration with duplicate email"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "anotheruser",
            "email": "test@example.com",  # Same as test_user
            "password": "password123"
        }
    )
    
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_register_duplicate_username(client, test_user):
    """Test registration with duplicate username"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "testuser",  # Same as test_user
            "email": "different@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    """Test successful login"""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["token"] is not None
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_invalid_email(client):
    """Test login with invalid email"""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_invalid_password(client, test_user):
    """Test login with invalid password"""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_me_authenticated(client, auth_token):
    """Test getting current user with valid token"""
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    """Test getting current user without token"""
    response = await client.get("/api/auth/me")
    
    assert response.status_code == 401  # HTTPBearer returns 401 when no credentials

@pytest.mark.asyncio
async def test_get_me_invalid_token(client):
    """Test getting current user with invalid token"""
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

@pytest.mark.asyncio
async def test_logout(client):
    """Test logout endpoint"""
    response = await client.post("/api/auth/logout")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

