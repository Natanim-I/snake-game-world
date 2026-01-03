from fastapi import APIRouter, HTTPException, Depends
from ..models import User, UserUpdate
from ..database import db
from .auth import security

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.patch("/me", response_model=dict)
async def update_profile(updates: UserUpdate, token=Depends(security)):
    user_id = '1' # Mock user
    updated_user = db.update_user(user_id, updates.model_dump(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": updated_user}
