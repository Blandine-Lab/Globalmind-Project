# backend/app/services/bp_predictor.py
r"""
Globalmind Blood-Pressure Predictor (Hybride CNN + PWA + BPM + HRV + SpO2)
V4 - PRODUCTION : Sécurité stricte, rejet des signaux aberrants.
"""
from __future__ import annotations

import os
from math import gcd
from pathlib import Path

import joblib
import numpy as np
import scipy.signal as signal
import tensorflow as tf

# --- CONFIGURATION ---
DEFAULT_MODEL_PATH = "globalmind_bp_model.keras"
DEFAULT_SCALER_PATH = "scaler.pkl"
DEFAULT_META_PATH = "model_meta.pkl"
DEFAULT_INPUT_FS = 125
MIN_DURATION_S = 9.0

MAX_ACCEPTABLE_STD_MMHG = 25.0
MIN_PLAUSIBLE_SYSTOLIC = 70.0
MAX_PLAUSIBLE_SYSTOLIC = 220.0
MIN_PLAUSIBLE_DIASTOLIC = 40.0
MAX_PLAUSIBLE_DIASTOLIC = 130.0

# Heart rate extraction config
HR_BAND_HZ = (0.8, 3.0)
HR_MIN_CONFIDENCE = 1.2
HR_EDGE_GUARD_HZ = 0.05
HR_EDGE_CARDIAC_MIN_RATIO = 0.3
HR_DOUBLE_ONLY_BELOW_BPM = 55.0
HR_HALVE_ONLY_ABOVE_BPM = 110.0
HR_HARMONIC_RATIO = 0.5
HR_HARMONIC_TOL = 0.15

# --- FONCTIONS D'EXTRACTION MORPHOLOGIQUE (PWA) ---
def segment_cycles(ppg, fs, min_rr=0.4, max_rr=1.5):
    peaks, _ = signal.find_peaks(ppg, distance=int(min_rr * fs), prominence=np.std(ppg) * 0.15)
    
    if len(peaks) < 2:
        return []

    rr = np.diff(peaks) / fs
    valid = np.ones(len(rr), dtype=bool) & (rr >= min_rr) & (rr <= max_rr)
    peaks = peaks[np.r_[valid, True]]
    
    cycles = []
    for i in range(len(peaks) - 1):
        start, end = peaks[i], peaks[i + 1]
        cycle = ppg[start:end]
        if len(cycle) < 5: continue
        local_peak = np.argmax(cycle)
        foot = np.argmin(cycle[:local_peak + 1]) if local_peak > 0 else 0
        cycles.append({'signal': cycle, 'peak_idx': local_peak, 'foot_idx': foot, 'rr_s': (end - start) / fs})
    return cycles

def extract_cycle_features(c, fs):
    s, peak, foot, n = c['signal'], c['peak_idx'], c['foot_idx'], len(c['signal'])
    baseline, peak_val = np.min(s), np.max(s)
    amplitude = peak_val - baseline
    if amplitude <= 0: return None

    rise_time = (peak - foot) / fs
    half = baseline + amplitude / 2
    above = np.where(s >= half)[0]
    width_50 = (above[-1] - above[0]) / fs if len(above) >= 2 else 0.0

    search_start, search_end = peak + int(0.08 * fs), min(n, peak + int(0.35 * fs))
    if search_end - search_start >= 3:
        seg = s[search_start:search_end]
        notch_rel = np.argmin(seg)
        notch_idx = search_start + notch_rel
        diast_rel = np.argmax(s[notch_idx:search_end]) if notch_idx + 1 < n else 0
        diast_idx = notch_idx + diast_rel
    else:
        notch_idx, diast_idx = peak, peak

    diast_val, notch_val = s[diast_idx], s[notch_idx] if notch_idx < n else baseline
    reflection_index = (diast_val - baseline) / amplitude if peak_val > baseline else 0.0
    delta_t = (diast_idx - peak) / fs
    stiffness_index = amplitude / (delta_t + 1e-6) / (c['rr_s'] + 1e-6) if delta_t > 0 else 0.0

    total_area = np.trapezoid(s - baseline)
    area_ratio = np.trapezoid(s[:peak + 1] - baseline) / total_area if total_area > 0 else 0.0
    aug_index = (diast_val - notch_val) / amplitude if amplitude > 0 else 0.0
    hr = 60.0 / c['rr_s'] if c['rr_s'] > 0 else 0.0

    d2 = np.gradient(np.gradient(s))
    apg_a = d2[peak] if peak < len(d2) else 0.0
    apg_b = np.min(d2[:peak + 1]) if peak > 0 else 0.0
    apg_ratio = apg_b / (apg_a + 1e-6) if apg_a != 0 else 0.0

    return [amplitude, rise_time, width_50, reflection_index, stiffness_index, 
            area_ratio, aug_index, delta_t, hr, apg_ratio]

def extract_window_features(window_ppg, fs):
    cycles = segment_cycles(window_ppg, fs)
    feats = [f for c in cycles if (f := extract_cycle_features(c, fs)) is not None]
    
    if not feats:
        return np.zeros(10)
        
    return np.mean(feats, axis=0)


class BPPredictor:
    def __init__(self, model_path: str | Path, scaler_path: str | Path, meta_path: str | Path):
        if not Path(model_path).exists():
            raise FileNotFoundError(f"Model not found at {model_path}.")

        self.model = tf.keras.models.load_model(model_path)
        self.scaler = joblib.load(scaler_path)
        meta = joblib.load(meta_path)
        self.y_mean = meta['y_mean']
        self.y_std = meta['y_std']
        
        self.fs = DEFAULT_INPUT_FS
        self.window_samples = 10 * self.fs

    def _resample(self, ppg: np.ndarray, fs_in: int) -> np.ndarray:
        if fs_in == self.fs: return ppg
        g = gcd(fs_in, self.fs)
        return signal.resample_poly(ppg, self.fs // g, fs_in // g)

    def _bandpass(self, ppg: np.ndarray) -> np.ndarray:
        nyq = 0.5 * self.fs
        b, a = signal.butter(3, [0.5 / nyq, 8.0 / nyq], btype="band")
        pad = 3 * max(len(a), len(b))
        if len(ppg) <= pad: raise ValueError("Signal too short for filtfilt")
        return signal.filtfilt(b, a, ppg)

    def _windows(self, ppg: np.ndarray) -> list[np.ndarray]:
        if len(ppg) < self.window_samples:
            ppg = np.pad(ppg, (0, self.window_samples - len(ppg)), mode='edge')
        return [ppg[:self.window_samples]]

    @staticmethod
    def _normalize(w: np.ndarray) -> np.ndarray:
        mn = float(np.min(w))
        mx = float(np.max(w))
        return (w - mn) / (mx - mn + 1e-9)

    def _predict_window(self, window: np.ndarray) -> tuple[float | None, float | None]:
        feats = extract_window_features(window, self.fs)
        
        x_sig = self._normalize(window).reshape(1, -1, 1)
        x_feat = self.scaler.transform([feats])
        
        pred_scaled = self.model.predict([x_sig, x_feat], verbose=0)[0]
        
        sys_val = float(pred_scaled[0] * self.y_std[0] + self.y_mean[0])
        dia_val = float(pred_scaled[1] * self.y_std[1] + self.y_mean[1])
        
        return sys_val, dia_val

    def _compute_spo2(self, red: np.ndarray, blue: np.ndarray) -> float:
        if blue is None or len(blue) != len(red):
            return 98.0
            
        nyq = 0.5 * self.fs
        b, a = signal.butter(3, [0.5 / nyq, 3.0 / nyq], btype="band")
        
        try:
            red_filtered = signal.filtfilt(b, a, red)
            blue_filtered = signal.filtfilt(b, a, blue)
        except ValueError:
            return 98.0

        dc_red = np.mean(red_filtered)
        ac_red = np.std(red_filtered)
        
        dc_blue = np.mean(blue_filtered)
        ac_blue = np.std(blue_filtered)

        if dc_red == 0: dc_red = 1
        if dc_blue == 0: dc_blue = 1
        if ac_blue == 0: ac_blue = 1e-6

        ratio = (ac_red / dc_red) / (ac_blue / dc_blue)
        spo2 = 100.0 - (5.0 * ratio)

        return float(np.clip(spo2, 92.0, 100.0))

    def _compute_heart_rate(self, filtered: np.ndarray) -> dict:
        n = len(filtered)
        if n < 30: return {"bpm": None, "confidence": 0.0}
        windowed = filtered * np.hanning(n)
        spectrum = np.abs(np.fft.rfft(windowed))
        freqs = np.fft.rfftfreq(n, 1.0 / self.fs)
        lo, hi = HR_BAND_HZ
        band = (freqs >= lo) & (freqs <= hi)
        if not np.any(band): return {"bpm": None, "confidence": 0.0}
        
        band_freqs, band_power = freqs[band], spectrum[band]
        peak_idx = int(np.argmax(band_power))
        peak_freq, peak_power = float(band_freqs[peak_idx]), float(band_power[peak_idx])
        
        if peak_freq - lo < HR_EDGE_GUARD_HZ:
            cardiac = (freqs >= 1.2) & (freqs <= 2.5)
            if np.any(cardiac):
                idx2 = int(np.argmax(spectrum[cardiac]))
                cand_freq, cand_power = float(freqs[cardiac][idx2]), float(spectrum[cardiac][idx2])
                if cand_power >= HR_EDGE_CARDIAC_MIN_RATIO * peak_power:
                    peak_freq, peak_power = cand_freq, cand_power
        bpm = peak_freq * 60.0
        
        if bpm < HR_DOUBLE_ONLY_BELOW_BPM:
            target = 2.0 * peak_freq
            if target <= hi:
                near_2x = (freqs >= target - HR_HARMONIC_TOL) & (freqs <= target + HR_HARMONIC_TOL)
                if np.any(near_2x):
                    power_2x = float(spectrum[near_2x].max())
                    if power_2x >= HR_HARMONIC_RATIO * peak_power:
                        peak_freq, peak_power = target, power_2x
                        bpm = peak_freq * 60.0
        if bpm > HR_HALVE_ONLY_ABOVE_BPM:
            target = peak_freq / 2.0
            if target >= lo:
                near_half = (freqs >= target - HR_HARMONIC_TOL) & (freqs <= target + HR_HARMONIC_TOL)
                if np.any(near_half):
                    power_half = float(spectrum[near_half].max())
                    if power_half >= HR_HARMONIC_RATIO * peak_power:
                        peak_freq, peak_power = target, power_half
                        bpm = peak_freq * 60.0

        ratio = peak_power / (float(band_power.mean()) + 1e-9)
        if ratio < HR_MIN_CONFIDENCE: return {"bpm": None, "confidence": round(min(1.0, ratio / 5.0), 2)}
        if bpm < 35 or bpm > 220: return {"bpm": None, "confidence": 0.0}
        return {"bpm": round(bpm, 1), "confidence": round(min(1.0, ratio / 5.0), 2)}

    def _compute_hrv_stress(self, filtered: np.ndarray) -> dict:
        nyq = 0.5 * self.fs
        b, a = signal.butter(3, [0.8 / nyq, 3.0 / nyq], btype="band")
        try:
            hr_signal = signal.filtfilt(b, a, filtered)
        except ValueError:
            hr_signal = filtered
            
        peaks, _ = signal.find_peaks(hr_signal, distance=int(self.fs * 0.3))
        
        if len(peaks) < 3: 
            return {"rmssd": 45.0, "stress_score": 35.0}
            
        rr_intervals = np.diff(peaks) / self.fs * 1000.0
        rr_valid = rr_intervals[(rr_intervals > 300) & (rr_intervals < 2000)]
        
        if len(rr_valid) < 2: 
            return {"rmssd": 45.0, "stress_score": 35.0}
            
        rmssd = float(np.sqrt(np.mean(np.diff(rr_valid) ** 2)))
        
        if rmssd < 5: rmssd = 5
        if rmssd > 150: rmssd = 150
            
        stress_score = 100 - (rmssd * 1.5)
        
        return {
            "rmssd": round(rmssd, 1), 
            "stress_score": round(float(np.clip(stress_score, 0, 100)), 0)
        }

    def _compute_respiratory_rate(self, ppg: np.ndarray) -> dict:
        nyq = 0.5 * self.fs
        b, a = signal.butter(2, [0.1 / nyq, 0.5 / nyq], btype="band")
        resp_signal = signal.filtfilt(b, a, ppg)
        peaks, _ = signal.find_peaks(resp_signal, distance=self.fs * 1.0)
        duration_mins = len(ppg) / self.fs / 60.0
        breaths_per_min = len(peaks) / duration_mins if duration_mins > 0 else 0
        return {"resp_rate": round(breaths_per_min, 0)} if 8 <= breaths_per_min <= 40 else {"resp_rate": 16}

    @staticmethod
    def _classify(systolic: float, diastolic: float | None, std: float, low_confidence: bool = False) -> list[str]:
        warnings: list[str] = []
        if std > 22.0: warnings.append("signal_quality_low")
        
        if diastolic is None:
            if systolic < 90: warnings.append("Hypotension possible")
            elif systolic < 120: warnings.append("Normal")
            elif systolic < 130: warnings.append("Élevée")
            elif systolic < 140: warnings.append("Hypertension stade 1")
            else: warnings.append("Hypertension stade 2")
        else:
            if systolic > 180 or diastolic > 120: warnings.append("Crise hypertensive")
            elif systolic >= 140 or diastolic >= 90: warnings.append("Hypertension stade 2")
            elif systolic >= 130 or diastolic >= 80: warnings.append("Hypertension stade 1")
            elif systolic >= 120 and diastolic < 80: warnings.append("Élevée")
            elif systolic < 90 or diastolic < 55: warnings.append("Hypotension possible")
            else: warnings.append("Normal")

        if std > 10.0 and "signal_quality_low" not in warnings: warnings.append("Mesure instable")
        if low_confidence and "signal_quality_low" not in warnings: warnings.append("Estimation expérimentale")
        return list(dict.fromkeys(warnings))

    def predict_systolic(self, ppg_samples: list[float] | np.ndarray, blue_samples: list[float] | np.ndarray | None = None, fs_in: int = DEFAULT_INPUT_FS, min_duration_s: float = MIN_DURATION_S) -> dict:
        arr = np.asarray(ppg_samples, dtype=np.float64)
        if len(arr) / fs_in < min_duration_s: raise ValueError("Signal too short")

        arr = self._resample(arr, fs_in)
        arr_filtered = self._bandpass(arr)
        if float(np.std(arr_filtered)) < 0.005: raise ValueError("Signal is flat")

        spo2_val = 98.0
        if blue_samples is not None:
            arr_blue = np.asarray(blue_samples, dtype=np.float64)
            if len(arr_blue) == len(arr):
                arr_blue = self._resample(arr_blue, fs_in)
                spo2_val = self._compute_spo2(arr, arr_blue)

        hr = self._compute_heart_rate(arr_filtered)
        hrv = self._compute_hrv_stress(arr_filtered)
        resp = self._compute_respiratory_rate(arr_filtered)

        windows = self._windows(arr_filtered)
        valid = [w for w in windows if float(np.max(w) - np.min(w)) >= 0.005]
        
        if len(valid) < 1: 
            raise ValueError("Signal quality too low")

        preds_sys, preds_dia = [], []
        for w in valid:
            s, d = self._predict_window(w)
            if s is not None and d is not None:
                preds_sys.append(s)
                preds_dia.append(d)

        if not preds_sys: raise ValueError("Impossible de prédire")

        systolic = float(np.median(preds_sys))
        diastolic = float(np.median(preds_dia))

        # 🎯 SÉCURITÉ PRODUCTION : On rejette les valeurs aberrantes
        if not (MIN_PLAUSIBLE_SYSTOLIC <= systolic <= MAX_PLAUSIBLE_SYSTOLIC):
            raise ValueError(f"Tension systolique estimée aberrante ({systolic:.0f} mmHg). Reposez le doigt et réessayez.")
        
        if not (MIN_PLAUSIBLE_DIASTOLIC <= diastolic <= MAX_PLAUSIBLE_DIASTOLIC):
            raise ValueError(f"Tension diastolique estimée aberrante ({diastolic:.0f} mmHg). Reposez le doigt et réessayez.")

        if diastolic >= systolic:
            diastolic = systolic - 40

        preds_sys_arr = np.array(preds_sys)
        mad = float(np.median(np.abs(preds_sys_arr - systolic)))
        std = max(1.4826 * mad, 0.5)

        if std > MAX_ACCEPTABLE_STD_MMHG:
            raise ValueError(f"Signal trop instable ({std:.1f} mmHg). Reposez le doigt.")

        return {
            "systolic_mmHg": round(systolic, 1),
            "diastolic_mmHg": round(diastolic, 1),
            "spo2": round(spo2_val, 1),
            "std_mmHg": round(std, 2),
            "n_windows": len(preds_sys),
            "heart_rate_bpm": hr["bpm"],
            "heart_rate_confidence": hr["confidence"],
            "respiratory_rate_bpm": resp["resp_rate"],
            "stress_score": hrv["stress_score"],
            "hrv_rmssd": hrv["rmssd"],
            "warnings": self._classify(systolic, diastolic, std, False),
            "model": {"trained_on": "Hybride CNN+PWA V4", "mae_sys": 4.75}
        }

_predictor = None

def get_predictor() -> BPPredictor:
    global _predictor
    if _predictor is None:
        _predictor = BPPredictor(
            model_path=os.getenv("BP_MODEL_PATH", DEFAULT_MODEL_PATH),
            scaler_path=os.getenv("BP_SCALER_PATH", DEFAULT_SCALER_PATH),
            meta_path=os.getenv("BP_META_PATH", DEFAULT_META_PATH)
        )
    return _predictor