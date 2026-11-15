# app/api/vehicles.py
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_service
from app.database import get_db

router = APIRouter(prefix="/api", tags=["vehicles"])


# ─── Dashboard endpoints (user JWT via require_service("tracking")) ─────

@router.get("/vehicles", response_model=list[schemas.VehicleOut])
def list_vehicles(
    current_user=Depends(require_service("tracking")),
    db: Session = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
    vehicles = (
        db.query(models.Vehicle)
        .filter(models.Vehicle.organization_id == current_user.organization_id)
        .order_by(models.Vehicle.created_at)
        .all()
    )
    # Auto-offline: any vehicle that hasn't pinged in 5 min
    changed = False
    for v in vehicles:
        if (
            v.status == "online"
            and v.last_seen_at
            and v.last_seen_at < cutoff
        ):
            v.status = "offline"
            changed = True
    if changed:
        db.commit()
    return vehicles


@router.get("/vehicles/{vehicle_id}", response_model=schemas.VehicleOut)
def get_vehicle(
    vehicle_id: str,
    current_user=Depends(require_service("tracking")),
    db: Session = Depends(get_db),
):
    v = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.id == vehicle_id,
            models.Vehicle.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not v:
        raise HTTPException(404, "Vehicle not found")
    return v


@router.post("/vehicles/{vehicle_id}/engine-cut")
def toggle_engine(
    vehicle_id: str,
    current_user=Depends(require_service("tracking")),
    db: Session = Depends(get_db),
):
    v = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.id == vehicle_id,
            models.Vehicle.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not v:
        raise HTTPException(404, "Vehicle not found")
    v.engine_enabled = not v.engine_enabled
    db.commit()
    return {"engine_enabled": v.engine_enabled}


# ─── Tracker ping (device auth — no user JWT) ───────────────────────────

@router.post("/tracker/position", tags=["tracker"])
def tracker_ping(
    payload: schemas.TrackerPingIn,
    x_tracker_token: str = Header(..., alias="X-Tracker-Token"),
    db: Session = Depends(get_db),
):
    """Physical GPS tracker posts here. Auth via per-device token, not JWT."""
    v = (
        db.query(models.Vehicle)
        .filter(models.Vehicle.tracker_token == x_tracker_token)
        .first()
    )
    if not v:
        raise HTTPException(401, "Invalid tracker token")

    v.last_lat = payload.lat
    v.last_lng = payload.lng
    v.last_speed_kmh = payload.speed_kmh
    v.last_battery_pct = payload.battery_pct
    v.last_seen_at = datetime.now(timezone.utc)
    v.status = "online"
    db.commit()
    return {"ok": True, "vehicle_id": v.id}