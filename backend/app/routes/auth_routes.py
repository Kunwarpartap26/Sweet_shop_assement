from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user():
    return {"message": "User registered"}
