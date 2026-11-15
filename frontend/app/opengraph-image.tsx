import { ImageResponse } from "next/og";

export const alt = "Globalmind SmartWatch — Surveillance connectée";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0B1220",
          color: "#fff",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        {/* halos */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(700px 500px at 10% 0%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(600px 500px at 100% 100%, rgba(34,211,238,0.35), transparent 60%)" }} />

        {/* colonne gauche */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3B82F6, #22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📹</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 3 }}>GLOBALMIND</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>SmartWatch™</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 120, fontSize: 74, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px" }}>
            <span>Votre maison,</span>
            <span>surveillée.</span>
            <span style={{ background: "linear-gradient(135deg, #60A5FA, #67E8F9)", backgroundClip: "text", color: "transparent" }}>Vous, rassuré.</span>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: "auto" }}>
            {[
              { dot: "#10B981", label: "LIVE · <1s" },
              { dot: null, label: "RGPD" },
              { dot: null, label: "120+ foyers" },
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "#0F172A", border: "1px solid #1E293B", fontSize: 14, fontWeight: 700 }}>
                {c.dot && <span style={{ width: 8, height: 8, borderRadius: 999, background: c.dot }} />}
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* mockup droite */}
        <div style={{ display: "flex", flexDirection: "column", width: 470, background: "#111C2F", borderRadius: 26, border: "1px solid #1E293B", padding: 22, marginLeft: 48 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#EF4444" }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#F59E0B" }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#10B981" }} />
            <span style={{ marginLeft: 16, fontSize: 11, color: "#64748B" }}>app.globalmind-smartwatch.com</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 18, background: "#0B1220", borderRadius: 14, height: 240, padding: 14, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.6)", alignSelf: "flex-start", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#EF4444" }} /> LIVE
            </div>
            <div style={{ position: "absolute", left: "34%", top: 72, width: 104, height: 140, border: "2px solid #34D399", borderRadius: 6 }} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {[
              { k: "CAMÉRAS", v: "3" },
              { k: "ALERTES", v: "7" },
              { k: "STOCKAGE", v: "30j" },
            ].map((s) => (
              <div key={s.k} style={{ display: "flex", flexDirection: "column", flex: 1, background: "#0B1220", border: "1px solid #1E293B", borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: 10, color: "#64748B", letterSpacing: 1 }}>{s.k}</span>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
