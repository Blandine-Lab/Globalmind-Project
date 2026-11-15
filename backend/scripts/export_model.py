# backend/scripts/export_model.py
r"""
Export two BP models (systolic + diastolic) into a single .pkl
that the FastAPI backend loads at startup.

Without --rebuild -> inspect the .pkl
With --rebuild    -> retrain and save {model_sys, model_dia, scaler, meta}

Usage:
    python scripts/export_model.py
    python scripts/export_model.py --rebuild

Env:
    MIMIC_MAT_PATH   path to part_1.mat (default: E:\Blood\archive\part_1.mat)
    OUTPUT_PATH      destination .pkl     (default: modele_tension.pkl)
"""
import argparse
import os
from pathlib import Path

import joblib
import numpy as np
import scipy.io
import scipy.signal as signal
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

FS = 125
WINDOW = 2 * FS  # 250 samples = 2 seconds @ 125 Hz
DEFAULT_MAT = r"E:\Blood\archive\part_1.mat"
DEFAULT_OUT = "modele_tension.pkl"


def inspect(path: str) -> None:
    if not Path(path).exists():
        print(f"[inspect] {path} introuvable - utilise --rebuild pour le creer.")
        return
    obj = joblib.load(path)
    print(f"[inspect] {path} charge. type = {type(obj).__name__}")
    if isinstance(obj, dict):
        print(f"[inspect] cles: {list(obj.keys())}")
        for k, v in obj.items():
            print(f"          {k}: {v.__class__.__name__}")
        if "model_dia" not in obj:
            print("[inspect] ATTENTION: pas de model_dia -> ancien format (sys uniquement)")
            print("          lance --rebuild pour ajouter la diastolique.")
    else:
        print("[inspect] L'objet n'est PAS un dict -> lance --rebuild.")


def build(mat_path: str, out_path: str) -> None:
    print(f"[build] chargement {mat_path}")
    mat = scipy.io.loadmat(mat_path)
    p = mat["p"]

    patient_index = 0
    patient_data = p[0, patient_index]
    signal_ppg = patient_data[0, :]
    signal_abp = patient_data[1, :]

    nyquist = 0.5 * FS
    b, a = signal.butter(3, [0.5 / nyquist, 5.0 / nyquist], btype="band")
    ppg_clean = signal.filtfilt(b, a, signal_ppg)

    X, y_sys, y_dia = [], [], []
    for start in range(0, len(ppg_clean) - WINDOW, FS):
        window = ppg_clean[start : start + WINDOW]
        abp_window = signal_abp[start : start + WINDOW]

        # Peaks = systolic (top of arterial pressure wave)
        peaks, _ = signal.find_peaks(abp_window, distance=FS * 0.4)
        # Troughs = diastolic (bottom, between beats) - invert signal
        troughs, _ = signal.find_peaks(-abp_window, distance=FS * 0.4)

        if len(peaks) > 0 and len(troughs) > 0:
            vraie_sys = float(np.mean(abp_window[peaks]))
            vraie_dia = float(np.mean(abp_window[troughs]))

            # Sanity: diastolic must be lower than systolic
            if vraie_dia >= vraie_sys - 5:
                continue

            X.append(
                (window - np.min(window))
                / (np.max(window) - np.min(window) + 1e-9)
            )
            y_sys.append(vraie_sys)
            y_dia.append(vraie_dia)

    X = np.array(X)
    y_sys = np.array(y_sys)
    y_dia = np.array(y_dia)
    
    print(
        f"[build] {len(X)} fenetres | "
        f"sys in [{y_sys.min():.1f}, {y_sys.max():.1f}] | "
        f"dia in [{y_dia.min():.1f}, {y_dia.max():.1f}]"
    )

    X_train, X_test, ys_train, ys_test, yd_train, yd_test = train_test_split(
        X, y_sys, y_dia, test_size=0.2, shuffle=False
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # Two independent models - each has its own scale
    model_sys = MLPRegressor(
        hidden_layer_sizes=(64, 32), max_iter=300, random_state=42
    )
    model_sys.fit(X_train_s, ys_train)
    mae_sys = mean_absolute_error(ys_test, model_sys.predict(X_test_s))
    print(f"[build] MAE systolic  = {mae_sys:.2f} mmHg")

    model_dia = MLPRegressor(
        hidden_layer_sizes=(64, 32), max_iter=300, random_state=43
    )
    model_dia.fit(X_train_s, yd_train)
    mae_dia = mean_absolute_error(yd_test, model_dia.predict(X_test_s))
    print(f"[build] MAE diastolic = {mae_dia:.2f} mmHg")

    payload = {
        "model_sys": model_sys,
        "model_dia": model_dia,
        "scaler": scaler,
        "fs": FS,
        "window_samples": WINDOW,
        "trained_on": "MIMIC-II part_1, patient 0",
        "test_mae_sys_mmHg": float(mae_sys),
        "test_mae_dia_mmHg": float(mae_dia),
    }
    joblib.dump(payload, out_path)
    print(
        f"[build] sauvegarde -> {out_path} "
        f"({os.path.getsize(out_path) / 1024:.1f} KB)"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rebuild", action="store_true")
    ap.add_argument("--mat", default=os.getenv("MIMIC_MAT_PATH", DEFAULT_MAT))
    ap.add_argument("--out", default=os.getenv("OUTPUT_PATH", DEFAULT_OUT))
    args = ap.parse_args()

    if args.rebuild:
        build(args.mat, args.out)
    else:
        inspect(args.out)


if __name__ == "__main__":
    main()