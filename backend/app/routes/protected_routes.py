from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user

# 👇 Only for type checking (no runtime import)
if TYPE_CHECKING:
    from app.models.user import User

router = APIRouter(
    prefix="/api/protected",
    tags=["Protected"]
)

@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": getattr(current_user, "is_admin", False),
    }
