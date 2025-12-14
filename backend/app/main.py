from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

#  Import DB objects
from app.database import Base, engine

#  IMPORT MODELS (THIS IS THE FIX)
from app.models import user, sweet   # adjust names if needed

# Import routers
from app.routes.auth_routes import router as auth_router
from app.routes.protected_routes import router as protected_router
from app.routes.sweet_routes import router as sweet_router

# ------------------------------------------------------------------
# App instance
# ------------------------------------------------------------------
app = FastAPI(title="Sweet Shop Management System")

# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Create DB tables
# ------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------------
# Register routers
# ------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(sweet_router)

# ------------------------------------------------------------------
# Health check
# ------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Sweet Shop API running"}
