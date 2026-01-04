"""Integration tests for user endpoints"""
import pytest

@pytest.mark.asyncio
async def test_update_profile_authenticated(client, auth_token, test_user, db_session):
    """Test updating user profile with authentication"""
    response = await client.patch(
        "/users/me",
        json={
            "username": "updateduser"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "updateduser"
    
    # Verify in database
    await db_session.refresh(test_user)
    assert test_user.username == "updateduser"

@pytest.mark.asyncio
async def test_update_profile_email(client, auth_token, test_user, db_session):
    """Test updating user email"""
    response = await client.patch(
        "/users/me",
        json={
            "email": "newemail@example.com"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "newemail@example.com"
    
    # Verify in database
    await db_session.refresh(test_user)
    assert test_user.email == "newemail@example.com"

@pytest.mark.asyncio
async def test_update_profile_unauthenticated(client):
    """Test updating profile without authentication"""
    response = await client.patch(
        "/users/me",
        json={
            "username": "newusername"
        }
    )
    
    assert response.status_code == 401  # HTTPBearer returns 401 when no credentials
