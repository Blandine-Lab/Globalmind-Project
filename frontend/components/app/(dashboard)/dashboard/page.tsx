import { AlertCircle, Bell, Camera as CameraIcon, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  person: "Personne",
  animal: "Animal",
  motion: "Mouvement",
  unknown: "Inconnu",
};

export default async function DashboardPage() {
  const [stats, events, cameras] = await Promise.all([
    api.getStats(),
    api.getEvents(),
    api.getCameras(),
  ]);

  const camMap = Object.fromEntries(cameras.map((c) => [c.id, c.name]));
  const recent = events.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Caméras" value={stats.cameras_total} hint={`${stats.cameras_online} en ligne`} icon={CameraIcon} />
        <StatCard title="En ligne" value={stats.cameras_online} hint={`${stats.cameras_total - stats.cameras_online} hors ligne`} icon={ShieldCheck} tone="success" />
        <StatCard title="Alertes aujourd'hui" value={stats.events_today} icon={Bell} tone="warning" />
        <StatCard title="Non vues" value={stats.events_unreviewed} icon={AlertCircle} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold mb-4">Événements récents</h2>
          <ul className="divide-y divide-slate-100">
            {recent.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{labels[e.event_type]}</p>
                  <p className="text-slate-500 text-xs">
                    {camMap[e.camera_id]} · {new Date(e.detected_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                {!e.reviewed && (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Nouveau</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold mb-4">État des caméras</h2>
          <ul className="space-y-3">
            {cameras.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}