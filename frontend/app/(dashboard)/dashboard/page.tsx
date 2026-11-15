// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Camera as CameraIcon,
  ShieldCheck,
  Navigation,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { useSubscriptions } from "@/lib/subscriptions";
import type { Camera, DashboardStats, Event } from "@/lib/types";

const labels: Record<string, string> = {
  person: "Personne",
  animal: "Animal",
  motion: "Mouvement",
  unknown: "Inconnu",
};

function ServiceIcon({ kind }: { kind: string }) {
  if (kind === "camera") return <CameraIcon className="w-5 h-5" />;
  if (kind === "navigation") return <Navigation className="w-5 h-5" />;
  return <HeartPulse className="w-5 h-5" />;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subs } = useSubscriptions();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, eventsData, camerasData] = await Promise.all([
          api.getStats(),
          api.getEvents(),
          api.getCameras(),
        ]);
        setStats(statsData);
        setEvents(eventsData);
        setCameras(camerasData);
      } catch (err: any) {
        console.error("Erreur API :", err);
        setError(
          err.message === "UNAUTHORIZED"
            ? "Session expirée. Veuillez vous reconnecter."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Chargement de votre espace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
        <p className="font-bold mb-2">Erreur de connexion</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

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

      {/* ─── Vos services ──────────────────────────────────────── */}
      {subs && subs.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-[0.14em] uppercase text-slate-500 mb-3">
            Vos services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subs.map((s) => (
              <Link
                key={s.id}
                href={s.service_route}
                className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                    <ServiceIcon kind={s.service_icon} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      s.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {s.status === "active" ? "Actif" : "Essai"}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{s.service_name}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                  {s.service_description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 group-hover:gap-2 transition-all">
                  Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Caméras"
          value={stats.cameras_total}
          hint={`${stats.cameras_online} en ligne`}
          icon={CameraIcon}
        />
        <StatCard
          title="En ligne"
          value={stats.cameras_online}
          hint={`${stats.cameras_total - stats.cameras_online} hors ligne`}
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          title="Alertes aujourd'hui"
          value={stats.events_today}
          icon={Bell}
          tone="warning"
        />
        <StatCard
          title="Non vues"
          value={stats.events_unreviewed}
          icon={AlertCircle}
          tone="danger"
        />
      </div>

      {/* ─── Events + Cameras ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold mb-4">Événements récents</h2>
          <ul className="divide-y divide-slate-100">
            {recent.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{labels[e.event_type]}</p>
                  <p className="text-slate-500 text-xs">
                    {camMap[e.camera_id]} ·{" "}
                    {new Date(e.detected_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                {!e.reviewed && (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    Nouveau
                  </span>
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