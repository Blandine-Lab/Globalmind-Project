// frontend/app/(dashboard)/tracking/map-view.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { createClient } from "@/lib/supabase";

type Vehicle = {
  id: string;
  name: string;
  status: string;
  last_lat: number | null;
  last_lng: number | null;
  last_speed_kmh: number | null;
  last_battery_pct: number | null;
  last_seen_at: string | null;
};

const vehicleIcon = L.divIcon({
  className: "vehicle-marker",
  html: `<div style="background:#f59e0b;width:28px;height:28px;border-radius:50%;border:4px solid #0f172a;box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Kinshasa Gombe — fallback if no vehicle has a position yet
const INITIAL_POSITION: [number, number] = [-4.325, 15.3222];
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function FollowMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

export default function MapView() {
  const [position, setPosition] = useState<[number, number]>(INITIAL_POSITION);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function poll() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if (!cancelled) setError("Session expirée");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setError(`API ${res.status}`);
          return;
        }
        const vehicles: Vehicle[] = await res.json();
        const first = vehicles.find(
          (v) => v.last_lat != null && v.last_lng != null
        );
        if (first && !cancelled) {
          setVehicle(first);
          setPosition([first.last_lat!, first.last_lng!]);
          setError(null);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erreur");
      }
    }

    poll();
    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const statusColor = error
    ? "bg-rose-400"
    : vehicle?.status === "online"
    ? "bg-emerald-400 animate-pulse"
    : "bg-amber-400";

  const statusLabel = error
    ? `Erreur: ${error}`
    : vehicle
    ? `${vehicle.name} — ${vehicle.status}`
    : "Chargement…";

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative">
      <MapContainer
        center={INITIAL_POSITION}
        zoom={14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={vehicleIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold mb-1">
                {vehicle?.name ?? "Véhicule"}
              </p>
              <p className="text-xs text-slate-600">
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </p>
              {vehicle?.last_speed_kmh != null && (
                <p className="text-xs">
                  Vitesse : {vehicle.last_speed_kmh.toFixed(0)} km/h
                </p>
              )}
              {vehicle?.last_battery_pct != null && (
                <p className="text-xs">
                  Batterie : {vehicle.last_battery_pct.toFixed(0)}%
                </p>
              )}
            </div>
          </Popup>
        </Marker>
        <FollowMarker position={position} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 max-w-[80%] truncate">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
        <span className="truncate">{statusLabel}</span>
      </div>
    </div>
  );
}