from fastapi import APIRouter, Depends
from app.auth.jwt import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/protected",
    tags=["Protected"]
)

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "id": current_user.id
    }
