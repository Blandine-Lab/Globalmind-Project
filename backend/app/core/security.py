# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from types import SimpleNamespace

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.core.config import settings
from app.database import get_db

# ─── Password hashing + local token creation (legacy HS256) ─────────────


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except ValueError:
        return False


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


# ─── Dual-mode verification: ES256/RS256 via JWKS + HS256 fallback ──────

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _jwks_client() -> jwt.PyJWKClient:
    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    return jwt.PyJWKClient(jwks_url)


def _decode_token(token: str) -> dict:
    try:
        header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(401, f"Malformed token: {exc}")

    alg = header.get("alg", "")
    if alg.startswith(("ES", "RS", "PS")) or "kid" in header:
        try:
            signing_key = _jwks_client().get_signing_key_from_jwt(token).key
            return jwt.decode(
                token,
                signing_key,
                algorithms=["ES256", "ES384", "RS256", "RS384"],
                audience=settings.supabase_jwt_aud or None,
                options={"verify_aud": bool(settings.supabase_jwt_aud)},
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.InvalidTokenError as exc:
            raise HTTPException(401, f"Invalid token: {exc}")

    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(401, f"Invalid token: {exc}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> SimpleNamespace:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Token has no 'sub' claim")

    app_meta = payload.get("app_metadata") or {}
    org_id = (
        app_meta.get("organization_id")
        or payload.get("organization_id")
        or payload.get("org_id")
        or "default"
    )

    return SimpleNamespace(
        id=user_id,
        sub=user_id,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        organization_id=org_id,
        is_active=True,
    )


# ─── Service gating ─────────────────────────────────────────────────────

TRIAL_SERVICE_IDS = ("surveillance", "tracking", "health")


def _ensure_trial_subscriptions(db: Session, user_id: str) -> None:
    """Give a brand-new user trial access to every seeded service.

    Idempotent: does nothing if the user already owns at least one row.
    Remove once real billing replaces the trial model.
    """
    existing = (
        db.query(models.Subscription)
        .filter(models.Subscription.user_id == user_id)
        .count()
    )
    if existing > 0:
        return

    known_ids = {
        row[0]
        for row in db.query(models.Service.id)
        .filter(models.Service.is_active.is_(True))
        .all()
    }
    for sid in TRIAL_SERVICE_IDS:
        if sid in known_ids:
            db.add(models.Subscription(user_id=user_id, service_id=sid, status="trial"))
    db.commit()


def require_service(service_id: str):
    """Dependency factory — gate an endpoint on an active subscription.

    Usage:
        @router.get("/api/cameras")
        def list_cameras(
            current_user=Depends(require_service("surveillance")),
            db: Session = Depends(get_db),
        ):
            ...
    """

    def _dep(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        _ensure_trial_subscriptions(db, current_user.id)

        active = (
            db.query(models.Subscription)
            .filter(
                models.Subscription.user_id == current_user.id,
                models.Subscription.service_id == service_id,
                models.Subscription.status.in_(("active", "trial")),
            )
            .first()
        )
        if active:
            return current_user

        raise HTTPException(
            status_code=403,
            detail=f"Service '{service_id}' non souscrit",
        )

    return _dep