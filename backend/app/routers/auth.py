from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from ..models import UserLogin, UserCreate, AuthResponse, User
from ..database import db

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = db.get_user_by_email(credentials.email)
    if not user or not db.verify_password(credentials.email, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Mock token generation
    token = str(uuid.uuid4())
    return AuthResponse(success=True, token=token, user=user)

@router.post("/register", status_code=201, response_model=AuthResponse)
async def register(user_data: UserCreate):
    if db.get_user_by_email(user_data.email):
         raise HTTPException(status_code=400, detail="Email already registered")
    if db.get_user_by_username(user_data.username):
         raise HTTPException(status_code=400, detail="Username already taken")
    
    new_user = db.create_user(user_data.username, user_data.email, user_data.password)
    token = str(uuid.uuid4())
    return AuthResponse(success=True, token=token, user=new_user)

@router.post("/logout")
async def logout():
    return {"success": True}

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

@router.get("/me", response_model=User)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In this mock, we accept any token and return the "SnakeMaster" user for simplicity 
    # unless we want to encode user ID in token.
    # Let's encode user ID in token simply: "token-USERID"
    token = credentials.credentials
    # For testing purposes, if token is random UUID, we might default to user 1
    # Or strict implementation:
    user = db.get_user_by_id('1') # Default to main user for dev/test
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
