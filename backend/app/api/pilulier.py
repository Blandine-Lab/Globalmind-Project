# backend/app/api/pilulier.py
"""
Pilulier (rappels de médicaments).

Endpoints (gated by require_service("health")):
    GET    /api/pilulier/medications                       -> liste des médicaments
    POST   /api/pilulier/medications                       -> ajouter un médicament
    DELETE /api/pilulier/medications/{id}                  -> supprimer + prises
    POST   /api/pilulier/medications/{id}/take             -> enregistrer une prise
    GET    /api/pilulier/intakes/today                     -> prises du jour
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_service
from app.database import get_db

router = APIRouter(prefix="/api/pilulier", tags=["pilulier"])


def _validate_time_str(t: str) -> None:
    """Raise 422 si t n'est pas au format HH:MM valide."""
    parts = t.split(":")
    if len(parts) != 2:
        raise HTTPException(422, f"Horaire invalide : {t}. Format attendu HH:MM")
    try:
        hh, mm = int(parts[0]), int(parts[1])
    except ValueError:
        raise HTTPException(422, f"Horaire invalide : {t}")
    if not (0 <= hh <= 23 and 0 <= mm <= 59):
        raise HTTPException(422, f"Horaire invalide : {t}")


@router.get("/medications", response_model=list[schemas.MedicationOut])
def list_medications(
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Medication)
        .filter(models.Medication.user_id == current_user.id)
        .order_by(models.Medication.created_at.desc())
        .all()
    )


@router.post(
    "/medications",
    response_model=schemas.MedicationOut,
    status_code=201,
)
def create_medication(
    payload: schemas.MedicationIn,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    if not payload.name or not payload.name.strip():
        raise HTTPException(422, "Le nom du medicament est obligatoire")
    if not payload.times:
        raise HTTPException(422, "Au moins un horaire est requis")

    # Validation format HH:MM
    for t in payload.times:
        _validate_time_str(t)

    # Deduplication + tri alphabetique des horaires
    unique_times = sorted(set(t.strip() for t in payload.times))

    med = models.Medication(
        user_id=current_user.id,
        name=payload.name.strip()[:150],
        dosage=(payload.dosage or "").strip()[:50] or None,
        times=",".join(unique_times),
        notes=(payload.notes or "").strip() or None,
        is_active=True,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.delete("/medications/{medication_id}", status_code=204)
def delete_medication(
    medication_id: str,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    med = (
        db.query(models.Medication)
        .filter(
            models.Medication.id == medication_id,
            models.Medication.user_id == current_user.id,
        )
        .first()
    )
    if not med:
        raise HTTPException(404, "Medicament introuvable")

    # Cascade manuel : supprimer les prises liées
    db.query(models.MedicationIntake).filter(
        models.MedicationIntake.medication_id == medication_id
    ).delete(synchronize_session=False)

    db.delete(med)
    db.commit()
    return None


@router.post(
    "/medications/{medication_id}/take",
    response_model=schemas.MedicationIntakeOut,
    status_code=201,
)
def take_medication(
    medication_id: str,
    payload: schemas.MedicationIntakeIn,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    med = (
        db.query(models.Medication)
        .filter(
            models.Medication.id == medication_id,
            models.Medication.user_id == current_user.id,
        )
        .first()
    )
    if not med:
        raise HTTPException(404, "Medicament introuvable")

    _validate_time_str(payload.scheduled_time)

    intake = models.MedicationIntake(
        user_id=current_user.id,
        medication_id=medication_id,
        scheduled_time=payload.scheduled_time,
    )
    db.add(intake)
    db.commit()
    db.refresh(intake)
    return intake


@router.get(
    "/intakes/today",
    response_model=list[schemas.MedicationIntakeOut],
)
def list_today_intakes(
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return (
        db.query(models.MedicationIntake)
        .filter(
            models.MedicationIntake.user_id == current_user.id,
            models.MedicationIntake.taken_at >= today_start,
        )
        .order_by(models.MedicationIntake.taken_at.desc())
        .all()
    )