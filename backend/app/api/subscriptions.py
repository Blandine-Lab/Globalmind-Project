# backend/app/api/subscriptions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/me", tags=["subscriptions"])


@router.get("/subscriptions")
def list_my_subscriptions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the active/trial subscriptions for the current user.

    Pre-launch, a brand-new user with zero subscriptions receives
    trial subscriptions on all seeded services. Remove that fallback
    once billing is wired up.
    """

    subs = (
        db.query(models.Subscription)
        .filter(models.Subscription.user_id == current_user.id)
        .filter(models.Subscription.status.in_(("active", "trial")))
        .all()
    )

    if not subs:
        # Auto-trial: create a trial on every active service
        for svc in db.query(models.Service).filter_by(is_active=True).all():
            db.add(
                models.Subscription(
                    user_id=current_user.id,
                    service_id=svc.id,
                    status="trial",
                )
            )
        db.commit()
        subs = (
            db.query(models.Subscription)
            .filter(models.Subscription.user_id == current_user.id)
            .filter(models.Subscription.status.in_(("active", "trial")))
            .all()
        )

    out = []
    for sub in subs:
        svc = db.query(models.Service).filter_by(id=sub.service_id).first()
        if not svc or not svc.is_active:
            continue
        out.append(
            {
                "id": sub.id,
                "service_id": sub.service_id,
                "service_name": svc.name,
                "service_description": svc.description,
                "service_icon": svc.icon,
                "service_route": svc.route,
                "status": sub.status,
                "started_at": sub.started_at.isoformat() if sub.started_at else None,
                "expires_at": sub.expires_at.isoformat() if sub.expires_at else None,
            }
        )
    return out