# backend/scripts/simulate_tracker.py
"""
Simulates a physical GPS tracker pinging /api/tracker/position every 3 seconds.

Flow:
  1. Login as the demo user → get JWT
  2. Fetch /api/vehicles → get each vehicle's tracker_token
  3. Loop: POST /api/tracker/position with a slowly-shifting lat/lng

Run from backend/:
    python scripts/simulate_tracker.py

Env overrides:
    API_URL          (default http://localhost:8000)
    TRACKER_EMAIL    (default client@demo.fr)
    TRACKER_PASSWORD (default demo1234)
    PING_INTERVAL    (default 3 seconds)
"""
import os
import random
import time

import httpx

API_URL = os.getenv("API_URL", "http://localhost:8000")
EMAIL = os.getenv("TRACKER_EMAIL", "client@demo.fr")
PASSWORD = os.getenv("TRACKER_PASSWORD", "demo1234")
INTERVAL = float(os.getenv("PING_INTERVAL", "3"))


def main() -> None:
    with httpx.Client(base_url=API_URL, timeout=10.0) as client:
        # 1. Login
        print(f"[1/3] Login as {EMAIL}…")
        r = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
        r.raise_for_status()
        token = r.json()["access_token"]
        print(f"      ✓ Token acquired (…{token[-8:]})")

        # 2. Fetch vehicles
        print("[2/3] Fetching vehicles…")
        r = client.get(
            "/api/vehicles", headers={"Authorization": f"Bearer {token}"}
        )
        r.raise_for_status()
        vehicles = r.json()
        if not vehicles:
            print("      ✗ No vehicles — did seed_vehicles run?")
            return
        for v in vehicles:
            print(f"      • {v['name']} ({v['plate']}) — {v['last_lat']}, {v['last_lng']}")

        vehicle = vehicles[0]
        tracker_token = vehicle["tracker_token"]
        lat = vehicle["last_lat"] or -4.325
        lng = vehicle["last_lng"] or 15.3222
        print(
            f"\n[3/3] Simulating {vehicle['name']} every {INTERVAL}s. Ctrl+C to stop.\n"
        )

        # 3. Ping loop
        i = 0
        while True:
            i += 1
            # Random walk — ~10-30 m per step
            lat += random.uniform(-0.0003, 0.0003)
            lng += random.uniform(-0.0003, 0.0003)
            speed = random.uniform(0, 60)
            battery = max(0, 92 - i * 0.1)

            try:
                r = client.post(
                    "/api/tracker/position",
                    headers={"X-Tracker-Token": tracker_token},
                    json={
                        "lat": round(lat, 6),
                        "lng": round(lng, 6),
                        "speed_kmh": round(speed, 1),
                        "battery_pct": round(battery, 1),
                    },
                )
                r.raise_for_status()
                print(
                    f"      ping #{i}: {lat:.5f}, {lng:.5f}   {speed:.0f} km/h   {battery:.0f}%   ✓"
                )
            except httpx.HTTPError as e:
                print(f"      ping #{i}: FAILED — {e}")

            time.sleep(INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n✓ Simulator stopped.")