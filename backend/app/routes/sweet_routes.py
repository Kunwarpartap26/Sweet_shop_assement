from fastapi import HTTPException, Depends, status
from app.auth.dependencies import get_current_user
from app.models.user import User
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sweet import Sweet

router = APIRouter(
    prefix="/api/sweets",
    tags=["Sweets"]
)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_sweet(sweet: dict, db: Session = Depends(get_db)):
    new_sweet = Sweet(
        name=sweet["name"],
        category=sweet["category"],
        price=sweet["price"],
        quantity=sweet["quantity"]
    )

    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)

    return new_sweet
@router.get("")
def get_sweets(db: Session = Depends(get_db)):
    sweets = db.query(Sweet).all()
    return sweets
from sqlalchemy import or_

@router.get("/search")
def search_sweets(query: str, db: Session = Depends(get_db)):
    sweets = db.query(Sweet).filter(
        or_(
            Sweet.name.ilike(f"%{query}%"),
            Sweet.category.ilike(f"%{query}%")
        )
    ).all()

    return sweets
from fastapi import HTTPException

@router.put("/{sweet_id}")
def update_sweet(
    sweet_id: int,
    updated_data: dict,
    db: Session = Depends(get_db)
):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()

    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    sweet.name = updated_data["name"]
    sweet.category = updated_data["category"]
    sweet.price = updated_data["price"]
    sweet.quantity = updated_data["quantity"]

    db.commit()
    db.refresh(sweet)

    return sweet
@router.delete("/{sweet_id}", status_code=status.HTTP_200_OK)
def delete_sweet(
    sweet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 🔒 Admin check
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()

    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found",
        )

    db.delete(sweet)
    db.commit()

    return {"message": "Sweet deleted successfully"}
