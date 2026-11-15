# app/api/cameras.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_service
from app.database import get_db

router = APIRouter(prefix="/api/cameras", tags=["cameras"])


@router.get("", response_model=list[schemas.CameraOut])
def list_cameras(
    current_user=Depends(require_service("surveillance")),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Camera)
        .join(models.Gateway, models.Camera.gateway_id == models.Gateway.id)
        .join(models.Site, models.Gateway.site_id == models.Site.id)
        .filter(models.Site.organization_id == current_user.organization_id)
        .order_by(models.Camera.created_at)
        .all()
    )