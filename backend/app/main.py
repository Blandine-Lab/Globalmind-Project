from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, cameras, events, health, stats, subscriptions, vehicles, triage, pilulier
from app.core.config import settings
from app.database import Base, SessionLocal, engine
from app.services.seed import seed, seed_services, seed_vehicles

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed(db)
    seed_services(db)
    seed_vehicles(db)

app = FastAPI(title="Globalmind SmartWatch API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cameras.router)
app.include_router(events.router)
app.include_router(stats.router)
app.include_router(subscriptions.router)
app.include_router(vehicles.router)
app.include_router(health.router)
app.include_router(triage.router)
app.include_router(pilulier.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "product": "Globalmind SmartWatch"}