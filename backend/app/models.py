from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(150))
    subscription_status: Mapped[str] = mapped_column(String(30), default="trial")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str | None] = mapped_column(String, ForeignKey("organizations.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String(30), default="client")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Site(Base):
    __tablename__ = "sites"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String(150))
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Gateway(Base):
    __tablename__ = "gateways"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id"))
    serial_number: Mapped[str] = mapped_column(String(100), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="offline")
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Camera(Base):
    __tablename__ = "cameras"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    gateway_id: Mapped[str] = mapped_column(String, ForeignKey("gateways.id"))
    name: Mapped[str] = mapped_column(String(150))
    stream_key: Mapped[str] = mapped_column(String(150), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="offline")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Event(Base):
    __tablename__ = "events"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    camera_id: Mapped[str] = mapped_column(String, ForeignKey("cameras.id"))
    event_type: Mapped[str] = mapped_column(String(50))
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)


# ═════════════════════════════════════════════════════════════════════════
# Services & Subscriptions
# ═════════════════════════════════════════════════════════════════════════


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(255), default="")
    icon: Mapped[str] = mapped_column(String(30), default="shield")
    route: Mapped[str] = mapped_column(String(100), default="/")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    service_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("services.id"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


# ═════════════════════════════════════════════════════════════════════════
# Vehicles (service: tracking)
# ═════════════════════════════════════════════════════════════════════════


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(
        String, ForeignKey("organizations.id"), index=True
    )
    name: Mapped[str] = mapped_column(String(150))
    plate: Mapped[str | None] = mapped_column(String(30), nullable=True)
    vehicle_type: Mapped[str] = mapped_column(String(20), default="car")

    status: Mapped[str] = mapped_column(String(20), default="offline")
    last_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_speed_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_battery_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    engine_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    tracker_token: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, default=lambda: uuid4().hex
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


# ═════════════════════════════════════════════════════════════════════════
# Measurements (service: health)
# ═════════════════════════════════════════════════════════════════════════


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    systolic_mmHg: Mapped[float] = mapped_column(Float, nullable=False)
    diastolic_mmHg: Mapped[float | None] = mapped_column(Float, nullable=True)
    std_mmHg: Mapped[float | None] = mapped_column(Float, nullable=True)
    n_windows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    warnings: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="ppg")
    
    # Heart rate
    heart_rate_bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Stress / VFC & Respiration
    stress_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    respiratory_rate_bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    hrv_rmssd: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # SpO2 (Saturation en oxygène)
    spo2: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


# ═════════════════════════════════════════════════════════════════════════
# Calibration (service: health)
# 🎯 NOUVEAU : Stocke le biais de calibration pour chaque utilisateur
# ═════════════════════════════════════════════════════════════════════════


class Calibration(Base):
    __tablename__ = "calibrations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    
    # Biais corrigés (après application du facteur alpha)
    bias_sys: Mapped[float] = mapped_column(Float, nullable=False)
    bias_dia: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Biais bruts (pour audit et debug)
    raw_bias_sys: Mapped[float] = mapped_column(Float, nullable=False)
    raw_bias_dia: Mapped[float] = mapped_column(Float, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


# ═════════════════════════════════════════════════════════════════════════
# Pilulier (service: health)
# ═════════════════════════════════════════════════════════════════════════


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    times: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class MedicationIntake(Base):
    __tablename__ = "medication_intakes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    medication_id: Mapped[str] = mapped_column(
        String, ForeignKey("medications.id"), index=True, nullable=False
    )
    scheduled_time: Mapped[str] = mapped_column(String(5), nullable=False)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)