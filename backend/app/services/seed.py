from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app import models
from app.core.security import hash_password


def seed(db: Session) -> None:
    if db.query(models.User).count() > 0:
        return

    org = models.Organization(name="Maison Dupont", subscription_status="active")
    db.add(org)
    db.flush()

    db.add_all([
        models.User(
            organization_id=org.id,
            email="client@demo.fr",
            password_hash=hash_password("demo1234"),
            role="client",
        ),
        models.User(
            organization_id=org.id,
            email="admin@demo.fr",
            password_hash=hash_password("admin1234"),
            role="admin",
        ),
    ])

    site = models.Site(organization_id=org.id, name="Maison Dupont", address="12 rue des Lilas, Lyon")
    db.add(site)
    db.flush()

    gw = models.Gateway(
        site_id=site.id,
        serial_number="GW-001",
        status="online",
        last_seen_at=datetime.now(timezone.utc),
    )
    db.add(gw)
    db.flush()

    cams = [
        models.Camera(gateway_id=gw.id, name="Entrée principale", stream_key="cam-entree", status="online"),
        models.Camera(gateway_id=gw.id, name="Salon", stream_key="cam-salon", status="online"),
        models.Camera(gateway_id=gw.id, name="Jardin", stream_key="cam-jardin", status="offline"),
    ]
    db.add_all(cams)
    db.flush()

    now = datetime.now(timezone.utc)
    db.add_all([
        models.Event(camera_id=cams[0].id, event_type="person", detected_at=now - timedelta(minutes=12), confidence=0.92, reviewed=False),
        models.Event(camera_id=cams[1].id, event_type="motion", detected_at=now - timedelta(hours=1), confidence=0.61, reviewed=False),
        models.Event(camera_id=cams[0].id, event_type="animal", detected_at=now - timedelta(hours=3), confidence=0.78, reviewed=True),
        models.Event(camera_id=cams[0].id, event_type="person", detected_at=now - timedelta(days=1), confidence=0.88, reviewed=True),
        models.Event(camera_id=cams[2].id, event_type="unknown", detected_at=now - timedelta(days=1, hours=2), confidence=0.34, reviewed=False),
    ])
    db.commit()


# ═════════════════════════════════════════════════════════════════════════
# Services catalogue — seeded once, idempotent
# ═════════════════════════════════════════════════════════════════════════

SERVICES = [
    {
        "id": "surveillance",
        "name": "Surveillance",
        "description": "Caméras connectées, live et alertes intelligentes",
        "icon": "camera",
        "route": "/dashboard",
    },
    {
        "id": "tracking",
        "name": "Suivi GPS",
        "description": "Localisez vos véhicules en temps réel",
        "icon": "navigation",
        "route": "/tracking",
    },
    {
        "id": "health",
        "name": "Santé IA",
        "description": "Tension artérielle par analyse PPG",
        "icon": "heart",
        "route": "/health",
    },
]


def seed_services(db: Session) -> None:
    """Idempotent: creates missing service rows, leaves existing rows untouched."""
    for s in SERVICES:
        if not db.query(models.Service).filter_by(id=s["id"]).first():
            db.add(models.Service(**s))
    db.commit()


# ═════════════════════════════════════════════════════════════════════════
# Vehicles — 3 demo vehicles across Kinshasa neighborhoods
# ═════════════════════════════════════════════════════════════════════════

KINSHASA_VEHICLES = [
    {
        "name": "Toyota Hilux",
        "plate": "KN 1234 AB",
        "vehicle_type": "car",
        "last_lat": -4.3250,
        "last_lng": 15.3222,   # Gombe (business district)
        "last_speed_kmh": 0.0,
        "last_battery_pct": 92.0,
    },
    {
        "name": "Moto Yamaha",
        "plate": "KN 5678 CD",
        "vehicle_type": "moto",
        "last_lat": -4.3800,
        "last_lng": 15.3200,   # Limete
        "last_speed_kmh": 0.0,
        "last_battery_pct": 78.0,
    },
    {
        "name": "Camion Isuzu",
        "plate": "KN 9012 EF",
        "vehicle_type": "truck",
        "last_lat": -4.3900,
        "last_lng": 15.2700,   # Ngaliema
        "last_speed_kmh": 0.0,
        "last_battery_pct": 65.0,
    },
]


def seed_vehicles(db: Session) -> None:
    """Idempotent: attaches 3 demo vehicles to the demo org, once."""
    if db.query(models.Vehicle).count() > 0:
        return
    org = db.query(models.Organization).filter_by(name="Maison Dupont").first()
    if not org:
        return
    now = datetime.now(timezone.utc)
    for spec in KINSHASA_VEHICLES:
        db.add(
            models.Vehicle(
                organization_id=org.id,
                status="online",
                last_seen_at=now,
                **spec,
            )
        )
    db.commit()