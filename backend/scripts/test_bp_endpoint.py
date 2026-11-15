# backend/scripts/test_bp_endpoint.py
"""
End-to-end test for the health/BP service.

Simulates what the frontend will do:
  1. Login → JWT
  2. POST /api/health/measure with a synthetic PPG signal
  3. Verify the response contains a systolic value
  4. GET /api/health/measurements → verify persistence
  5. GET /api/health/model-info → print provenance
"""
import math
import os
import random

import httpx

API_URL = os.getenv("API_URL", "http://localhost:8000")
EMAIL = os.getenv("TEST_EMAIL", "client@demo.fr")
PASSWORD = os.getenv("TEST_PASSWORD", "demo1234")

FS = 125
DURATION_S = 15.0
N = int(FS * DURATION_S)


def synth_ppg() -> list[float]:
    """Synthetic PPG-like waveform: 1.2 Hz fundamental + harmonics + noise."""
    samples = []
    for i in range(N):
        t = i / FS
        v = (
            0.5 * math.sin(2 * math.pi * 1.2 * t)
            + 0.15 * math.sin(2 * math.pi * 2.4 * t)
            + 0.05 * math.sin(2 * math.pi * 3.6 * t)
            + random.gauss(0, 0.02)
        )
        samples.append(round(v, 6))
    return samples


def main() -> None:
    with httpx.Client(base_url=API_URL, timeout=30.0) as c:
        print(f"[1/4] Login as {EMAIL}…")
        r = c.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
        r.raise_for_status()
        token = r.json()["access_token"]
        H = {"Authorization": f"Bearer {token}"}
        print(f"      ✓ token …{token[-8:]}")

        # Trigger auto-trial if health not yet subscribed
        c.get("/api/me/subscriptions", headers=H)

        print(f"[2/4] POST /api/health/measure ({N} samples @ {FS} Hz)…")
        samples = synth_ppg()
        r = c.post(
            "/api/health/measure",
            headers=H,
            json={"ppg_samples": samples, "fs": FS},
        )
        r.raise_for_status()
        out = r.json()
        print(
            f"      ✓ systolic = {out['systolic_mmHg']} mmHg "
            f"(±{out['std_mmHg']}, {out['n_windows']} windows)"
        )
        print(f"      warnings: {out['warnings']}")

        print("[3/4] GET /api/health/measurements (history)…")
        r = c.get("/api/health/measurements?limit=3", headers=H)
        r.raise_for_status()
        history = r.json()
        print(f"      ✓ {len(history)} measurement(s) persisted")
        for m in history:
            print(
                f"        • {m['measured_at']}  {m['systolic_mmHg']} mmHg  "
                f"±{m['std_mmHg']}"
            )

        print("[4/4] GET /api/health/model-info…")
        r = c.get("/api/health/model-info", headers=H)
        r.raise_for_status()
        info = r.json()
        print(f"      trained_on: {info['trained_on']}")
        print(f"      test_mae:   {info['test_mae_mmHg']} mmHg")
        print(f"      disclaimer: {info['disclaimer'][:80]}…")

        print("\n✅ End-to-end OK")


if __name__ == "__main__":
    main()