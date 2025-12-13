from fastapi import FastAPI

from app.database import Base, engine

# ✅ IMPORT MODELS FIRST (CRITICAL)
from app.models.user import User
from app.models.sweet import Sweet

# ✅ CREATE TABLES AFTER MODELS ARE REGISTERED
Base.metadata.create_all(bind=engine)

# ✅ IMPORT ROUTERS
from app.routes.auth_routes import router as auth_router
from app.routes.protected_routes import router as protected_router
from app.routes.sweet_routes import router as sweet_router

app = FastAPI(title="Sweet Shop Management System")

app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(sweet_router)

@app.get("/")
def root():
    return {"message": "Sweet Shop API running"}
