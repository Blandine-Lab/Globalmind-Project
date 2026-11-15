# backend/app/api/health.py
from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import require_service
from app.database import get_db
from app.services.bp_predictor import get_predictor
from app.services.signal_quality import check_finger_quality, compute_bias, apply_calibration

router = APIRouter(prefix="/api/health", tags=["health"])

MIN_FS = 15
MAX_FS = 500
MIN_DURATION_S_CAPTURE = 8.0
MAX_DURATION_S_CAPTURE = 120.0

def _to_out(m: models.Measurement) -> schemas.BpMeasurementOut:
    try:
        warnings = json.loads(m.warnings) if m.warnings else []
    except (TypeError, json.JSONDecodeError):
        warnings = []
    return schemas.BpMeasurementOut(
        systolic_mmHg=m.systolic_mmHg,
        diastolic_mmHg=m.diastolic_mmHg,
        std_mmHg=m.std_mmHg or 0.0,
        n_windows=m.n_windows or 0,
        warnings=warnings,
        model_info={"source": m.source},
        measured_at=m.created_at,
        heart_rate_bpm=m.heart_rate_bpm,
        heart_rate_confidence=None,
        stress_score=m.stress_score,
        respiratory_rate_bpm=m.respiratory_rate_bpm,
        hrv_rmssd=m.hrv_rmssd,
        spo2=m.spo2,
    )

@router.post("/measure", response_model=schemas.BpMeasurementOut)
def measure_bp(
    payload: schemas.BpMeasurementIn,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    n = len(payload.ppg_samples)
    if n == 0:
        raise HTTPException(422, "ppg_samples is empty")

    if not (MIN_FS <= payload.fs <= MAX_FS):
        raise HTTPException(422, f"fs must be in [{MIN_FS}, {MAX_FS}] Hz")

    duration_s = n / payload.fs
    if duration_s < MIN_DURATION_S_CAPTURE:
        raise HTTPException(422, f"Capture too short: {duration_s:.1f}s")
    if duration_s > MAX_DURATION_S_CAPTURE:
        raise HTTPException(413, f"Capture too long: {duration_s:.1f}s")

    quality = check_finger_quality(payload.ppg_samples, payload.fs)
    if not quality["ok"]:
        raise HTTPException(422, quality["reason"])

    # 🎯 Ajout du warning si la qualité est moyenne
    extra_warnings = []
    if quality["quality"] < 50:
        extra_warnings.append("signal_quality_low")

    predictor = get_predictor()
    try:
        result = predictor.predict_systolic(
            payload.ppg_samples, 
            payload.blue_samples, 
            fs_in=payload.fs
        )
    except ValueError as e:
        raise HTTPException(422, str(e))

    calib = db.query(models.Calibration).filter(models.Calibration.user_id == current_user.id).order_by(models.Calibration.created_at.desc()).first()
    needs_recalib = False
    
    if calib:
        age_days = (datetime.now(timezone.utc) - calib.created_at).days
        if age_days > 7:
            needs_recalib = True
            calib = None

    cam_sys = result["systolic_mmHg"]
    cam_dia = result.get("diastolic_mmHg") or 0.0
    
    final_sys, final_dia = apply_calibration(cam_sys, cam_dia, calib)

    measurement = models.Measurement(
        user_id=current_user.id,
        systolic_mmHg=final_sys,
        diastolic_mmHg=final_dia,
        std_mmHg=result["std_mmHg"],
        n_windows=result["n_windows"],
        warnings=json.dumps(list(set(result["warnings"] + extra_warnings))), # 🎯 Mis à jour
        source="ppg",
        heart_rate_bpm=result.get("heart_rate_bpm"),
        stress_score=result.get("stress_score"),
        respiratory_rate_bpm=result.get("respiratory_rate_bpm"),
        hrv_rmssd=result.get("hrv_rmssd"),
        spo2=result.get("spo2"),
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    return schemas.BpMeasurementOut(
        systolic_mmHg=measurement.systolic_mmHg,
        diastolic_mmHg=measurement.diastolic_mmHg,
        std_mmHg=measurement.std_mmHg or 0.0,
        n_windows=measurement.n_windows or 0,
        warnings=list(set(result["warnings"] + extra_warnings)), # 🎯 Mis à jour
        model_info={
            **result["model"],
            "quality": quality["quality"],
            "calibrated": calib is not None,
            "needs_recalib": needs_recalib,
            "cam_sys_raw": cam_sys,
            "cam_dia_raw": cam_dia
        },
        measured_at=measurement.created_at,
        heart_rate_bpm=result.get("heart_rate_bpm"),
        heart_rate_confidence=result.get("heart_rate_confidence"),
        stress_score=result.get("stress_score"),
        respiratory_rate_bpm=result.get("respiratory_rate_bpm"),
        hrv_rmssd=result.get("hrv_rmssd"),
        spo2=result.get("spo2"),
    )

@router.post("/calibrate")
def calibrate_bp(
    payload: schemas.CalibrationIn,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    try:
        pairs_dict = [p.model_dump() for p in payload.pairs]
        result = compute_bias(pairs_dict)
    except ValueError as e:
        raise HTTPException(422, str(e))
    
    new_calib = models.Calibration(
        user_id=current_user.id,
        bias_sys=result["bias_sys"],
        bias_dia=result["bias_dia"],
        raw_bias_sys=result["raw_bias_sys"],
        raw_bias_dia=result["raw_bias_dia"],
    )
    db.add(new_calib)
    db.commit()
    
    return result

@router.get("/measurements", response_model=list[schemas.BpMeasurementOut])
def list_measurements(
    limit: int = Query(30, ge=1, le=200),
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Measurement)
        .filter(models.Measurement.user_id == current_user.id)
        .order_by(models.Measurement.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_to_out(m) for m in rows]

@router.get("/measurements/{measurement_id}", response_model=schemas.BpMeasurementOut)
def get_measurement(
    measurement_id: str,
    current_user=Depends(require_service("health")),
    db: Session = Depends(get_db),
):
    m = (
        db.query(models.Measurement)
        .filter(
            models.Measurement.id == measurement_id,
            models.Measurement.user_id == current_user.id,
        )
        .first()
    )
    if not m:
        raise HTTPException(404, "Measurement not found")
    return _to_out(m)

@router.get("/model-info")
def model_info(current_user=Depends(require_service("health"))):
    p = get_predictor()
    return {
        "trained_on": p.trained_on,
        "test_mae_sys_mmHg": round(p.test_mae_sys, 2),
        "test_mae_dia_mmHg": round(p.test_mae_dia, 2),
        "fs": p.fs,
        "window_samples": p.window_samples,
        "disclaimer": "Modeles entraines sur plusieurs patients (MIMIC). Precision ~4.75 mmHg (sys) et ~3.1 mmHg (dia). Ne remplace pas un tensiometre medical.",
    }