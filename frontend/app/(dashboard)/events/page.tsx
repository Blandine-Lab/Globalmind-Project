// app/(dashboard)/events/page.tsx
"use client"; // 👈 Ajout CRUCIAL

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Event, Camera } from "@/lib/types";

const labels: Record<string, string> = {
  person: "Personne", animal: "Animal", motion: "Mouvement", unknown: "Inconnu",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, camerasData] = await Promise.all([
          api.getEvents(),
          api.getCameras()
        ]);
        setEvents(eventsData);
        setCameras(camerasData);
      } catch (err: any) {
        console.error("Erreur API Événements:", err);
        setError(err.message === "UNAUTHORIZED" ? "Session expirée. Veuillez vous reconnecter." : err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des événements...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl">{error}</div>;

  const camMap = Object.fromEntries(cameras.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Événements</h1>
        <select className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white">
          <option>Toutes les caméras</option>
          {cameras.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Caméra</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Confiance</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucun événement récent.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">
                  {new Date(e.detected_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">{camMap[e.camera_id] ?? "—"}</td>
                <td className="px-4 py-3">{labels[e.event_type]}</td>
                <td className="px-4 py-3">{e.confidence ? `${Math.round(e.confidence * 100)}%` : "—"}</td>
                <td className="px-4 py-3">
                  {e.reviewed ? (
                    <span className="text-xs text-slate-500">Vu</span>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Nouveau</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-brand-blue hover:underline text-sm">Voir le clip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}