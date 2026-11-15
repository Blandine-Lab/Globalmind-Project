from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[schemas.EventOut])
def list_events(
    camera_id: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Event)
        .join(models.Camera, models.Event.camera_id == models.Camera.id)
        .join(models.Gateway, models.Camera.gateway_id == models.Gateway.id)
        .join(models.Site, models.Gateway.site_id == models.Site.id)
        .filter(models.Site.organization_id == current_user.organization_id)
        .order_by(models.Event.detected_at.desc())
    )
    if camera_id:
        q = q.filter(models.Event.camera_id == camera_id)
    return q.all()