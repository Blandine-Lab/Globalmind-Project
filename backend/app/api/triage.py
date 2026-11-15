# backend/app/api/triage.py
from fastapi import APIRouter, Depends

from app import schemas
from app.core.security import require_service

router = APIRouter(prefix="/api/triage", tags=["triage"])


@router.post("/analyze", response_model=schemas.TriageOut)
def analyze_symptoms(
    payload: schemas.TriageIn,
    current_user=Depends(require_service("health")),
):
    symptoms = set(payload.symptoms)

    # --- REGLES D'URGENCE VITALE (RED) ---
    red_flags = {"douleur_thoracique", "essoufflement", "perte_connaissance", "paralysie"}
    if symptoms.intersection(red_flags):
        return schemas.TriageOut(
            urgency_level="red",
            urgency_label="Urgence vitale",
            specialist="Urgences (15 / 112)",
            advice="Appelez immediatement le 15 ou le 112. Ne conduisez pas vous-meme. Mettez-vous au repos en attendant les secours.",
        )

    # --- REGLES URGENT (ORANGE) ---
    orange_flags = {"fievre_haute", "vomissements", "douleur_intense", "saignement"}
    if symptoms.intersection(orange_flags):
        return schemas.TriageOut(
            urgency_level="orange",
            urgency_label="Urgent",
            specialist="Generaliste ou urgences",
            advice="Consultez un medecin dans les 24h. Si les symptomes s'aggravent, rendez-vous aux urgences.",
        )

    # --- REGLES A SURVEILLER (YELLOW) ---
    yellow_flags = {"toux", "fatigue", "mal_de_tete", "courbatures", "nez_qui_coule"}
    if symptoms.intersection(yellow_flags):
        return schemas.TriageOut(
            urgency_level="yellow",
            urgency_label="A surveiller",
            specialist="Generaliste",
            advice="Prenez rendez-vous chez un generaliste sous 2-3 jours. Reposez-vous, hydratez-vous, surveillez l'evolution.",
        )

    # --- AUCUN SYMPTOME ALARMANT (GREEN) ---
    return schemas.TriageOut(
        urgency_level="green",
        urgency_label="Normal",
        specialist="Aucun",
        advice="Aucun symptome alarmant detecte. Continuez a surveiller votre sante avec nos bilans quotidiens.",
    )