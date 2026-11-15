import numpy as np

def check_finger_quality(ppg: list[float], fs: int) -> dict:
    """
    Version de TEST : Ne bloque plus la mesure, renvoie juste un score de qualité.
    """
    x = np.array(ppg, dtype=float)
    
    # Seule sécurité : si le signal est vide ou trop court, on bloque.
    if len(x) < fs * 5:
        return {"ok": False, "reason": "Signal trop court", "quality": 0}

    x = x - np.mean(x)
    amplitude = np.percentile(x, 95) - np.percentile(x, 5)

    # Seule sécurité : si le signal est totalement plat (pas de torche)
    if amplitude < 0.1:
        return {
            "ok": False,
            "reason": "Aucun signal détecté. Vérifiez que la torche est allumée et que le doigt couvre la caméra.",
            "quality": 0,
        }

    # Calcul du score de qualité (pour l'affichage)
    window = fs
    stds = []
    for i in range(0, len(x) - window, window):
        stds.append(np.std(x[i:i+window]))
    stds = np.array(stds)

    score_amp = 100 - abs(amplitude - 15) * 2
    score_amp = max(0, min(100, score_amp))
    
    score_stab = 100 - (np.std(stds) / (np.mean(stds) + 1e-6)) * 50
    score_stab = max(0, min(100, score_stab))
    
    quality = int((score_amp + score_stab) / 2)

    # 🎯 ON ACCEPTE TOUJOURS (même si la qualité est basse)
    return {"ok": True, "reason": "OK", "quality": quality}


def compute_bias(calibration_pairs: list[dict]) -> dict:
    if len(calibration_pairs) < 3:
        raise ValueError("Il faut 3 mesures brassard pour calibrer")

    biases_sys = [p["cuff_sys"] - p["cam_sys"] for p in calibration_pairs]
    biases_dia = [p["cuff_dia"] - p["cam_dia"] for p in calibration_pairs]

    range_sys = max(biases_sys) - min(biases_sys)
    if range_sys > 12:
        raise ValueError(
            f"Calibration incohérente : vos 3 mesures donnent des biais trop différents. Refaites au calme."
        )

    mean_bias_sys = float(np.mean(biases_sys))
    mean_bias_dia = float(np.mean(biases_dia))

    return {
        "bias_sys": mean_bias_sys * 0.7,
        "bias_dia": mean_bias_dia * 0.3,
        "raw_bias_sys": mean_bias_sys,
        "raw_bias_dia": mean_bias_dia,
        "n_pairs": len(calibration_pairs),
        "range_sys": range_sys,
    }

def apply_calibration(cam_sys: float, cam_dia: float, calibration: dict | None) -> tuple[float, float]:
    if not calibration:
        return cam_sys, cam_dia
    return cam_sys + calibration["bias_sys"], cam_dia + calibration["bias_dia"]