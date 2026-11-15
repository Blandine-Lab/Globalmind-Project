# app/schemas.py
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: str
    model_config = {"from_attributes": True}


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CameraOut(BaseModel):
    id: str
    gateway_id: str
    name: str
    stream_key: str
    status: str
    is_enabled: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: str
    camera_id: str
    event_type: str
    detected_at: datetime
    confidence: float | None = None
    reviewed: bool
    model_config = {"from_attributes": True}


class StatsOut(BaseModel):
    cameras_total: int
    cameras_online: int
    events_today: int
    events_unreviewed: int


# ═════════════════════════════════════════════════════════════════════════
# Vehicles (service: tracking)
# ═════════════════════════════════════════════════════════════════════════


class VehicleOut(BaseModel):
    id: str
    name: str
    plate: str | None
    vehicle_type: str
    status: str
    last_lat: float | None
    last_lng: float | None
    last_speed_kmh: float | None
    last_battery_pct: float | None
    last_seen_at: datetime | None
    engine_enabled: bool
    tracker_token: str
    model_config = {"from_attributes": True}


class TrackerPingIn(BaseModel):
    lat: float
    lng: float
    speed_kmh: float | None = None
    battery_pct: float | None = None


# ═════════════════════════════════════════════════════════════════════════
# Health (service: health) - PPG measurement
# ═════════════════════════════════════════════════════════════════════════


class BpMeasurementIn(BaseModel):
    """Raw PPG signal captured from the phone camera (torch on)."""

    ppg_samples: list[float]
    blue_samples: list[float] | None = None  # 🎯 Signal bleu pour la SpO2
    fs: int = 125  # sampling rate of ppg_samples


class BpMeasurementOut(BaseModel):
    systolic_mmHg: float
    diastolic_mmHg: float | None = None
    std_mmHg: float
    n_windows: int
    warnings: list[str]
    model_info: dict
    measured_at: datetime
    
    # Cardiac metrics
    heart_rate_bpm: float | None = None
    heart_rate_confidence: float | None = None
    
    # Stress / VFC & Respiration
    stress_score: float | None = None
    respiratory_rate_bpm: float | None = None
    hrv_rmssd: float | None = None

    # 🎯 Saturation en Oxygène
    spo2: float | None = None
    
    model_config = {"from_attributes": True}


# ═════════════════════════════════════════════════════════════════════════
# Calibration (service: health)
# 🎯 NOUVEAU : Schémas pour la calibration personnelle
# ═════════════════════════════════════════════════════════════════════════


class CalibrationPair(BaseModel):
    """Une paire de mesures : brassard vs caméra, au même moment."""
    cuff_sys: int
    cuff_dia: int
    cam_sys: float
    cam_dia: float


class CalibrationIn(BaseModel):
    """Payload pour l'endpoint /calibrate : 3 paires de mesures."""
    pairs: list[CalibrationPair]


# ═════════════════════════════════════════════════════════════════════════
# Triage IA (Vérificateur de symptômes)
# ═════════════════════════════════════════════════════════════════════════


class TriageIn(BaseModel):
    symptoms: list[str]


class TriageOut(BaseModel):
    urgency_level: str    # "green" | "yellow" | "orange" | "red"
    urgency_label: str    # "Normal" | "A surveiller" | "Urgent" | "Urgence vitale"
    specialist: str       # "Generaliste" | "Cardiologue" | "Urgences" ...
    advice: str           # Conseil detaille


# ═════════════════════════════════════════════════════════════════════════
# Pilulier (rappels de médicaments)
# ═════════════════════════════════════════════════════════════════════════


class MedicationIn(BaseModel):
    name: str
    dosage: str | None = None           # ex: "500 mg" ou "1 comprime"
    times: list[str]                    # ex: ["08:00", "14:00", "20:00"]
    notes: str | None = None


class MedicationOut(BaseModel):
    id: str
    name: str
    dosage: str | None = None
    times: list[str]
    notes: str | None = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

    @field_validator("times", mode="before")
    @classmethod
    def _split_times(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v


class MedicationIntakeOut(BaseModel):
    id: str
    medication_id: str
    taken_at: datetime
    scheduled_time: str                # ex: "08:00"
    model_config = {"from_attributes": True}


class MedicationIntakeIn(BaseModel):
    scheduled_time: str                # ex: "08:00"