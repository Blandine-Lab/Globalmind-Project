import sqlite3
c = sqlite3.connect("surveillance.db")
print("=== 3 dernieres mesures ===")
for r in c.execute(
    "SELECT created_at, heart_rate_bpm, systolic_mmHg, diastolic_mmHg, std_mmHg, warnings "
    "FROM measurements ORDER BY created_at DESC LIMIT 3"
):
    print(" ", r)
c.close()