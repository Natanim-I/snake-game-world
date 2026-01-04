from fastapi import APIRouter, HTTPException, Depends
from ..models import User, UserUpdate
from ..database import db
from .auth import security, get_me

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.patch("/me", response_model=dict)
async def update_profile(updates: UserUpdate, user: User = Depends(get_me)):
    updated_user = await db.update_user(user.id, updates.model_dump(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": updated_user}

