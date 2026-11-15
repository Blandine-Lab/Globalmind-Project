from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=schemas.StatsOut)
def stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org = current_user.organization_id

    cam_q = (
        db.query(models.Camera)
        .join(models.Gateway, models.Camera.gateway_id == models.Gateway.id)
        .join(models.Site, models.Gateway.site_id == models.Site.id)
        .filter(models.Site.organization_id == org)
    )
    total = cam_q.count()
    online = cam_q.filter(models.Camera.status == "online").count()

    event_base = (
        db.query(models.Event)
        .join(models.Camera, models.Event.camera_id == models.Camera.id)
        .join(models.Gateway, models.Camera.gateway_id == models.Gateway.id)
        .join(models.Site, models.Gateway.site_id == models.Site.id)
        .filter(models.Site.organization_id == org)
    )
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    events_today = event_base.filter(models.Event.detected_at >= today_start).count()
    unreviewed = event_base.filter(models.Event.reviewed.is_(False)).count()

    return {
        "cameras_total": total,
        "cameras_online": online,
        "events_today": events_today,
        "events_unreviewed": unreviewed,
    }