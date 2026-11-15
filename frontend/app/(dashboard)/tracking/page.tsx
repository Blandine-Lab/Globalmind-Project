// frontend/app/(dashboard)/tracking/page.tsx
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  ShieldAlert,
  Battery,
  Siren,
  ArrowRight,
} from "lucide-react";

// Leaflet touches `window` at import time → must be client-side only.
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
      Chargement de la carte…
    </div>
  ),
});

const FEATURES = [
  { icon: MapPin,      label: "Localisation temps réel" },
  { icon: ShieldAlert, label: "Anti-démarrage à distance" },
  { icon: Siren,       label: "Alerte vibration < 1s" },
  { icon: Battery,     label: "Batterie de secours 72h" },
];

export default function TrackingPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Suivi en direct
      </div>

      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
        Suivi GPS & Alarme
      </h1>
      <p className="mt-3 text-slate-500 max-w-2xl leading-relaxed">
        Localisez vos véhicules en temps réel. Ci-dessous une démo avec une
        position simulée à Kinshasa — les positions réelles seront branchées
        dès l'activation du traceur GPS.
      </p>

      <div className="mt-8">
        <MapView />
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-bold tracking-[0.14em] uppercase text-slate-500 mb-4">
          Fonctionnalités à venir
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50"
            >
              <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-slate-800">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="mailto:contact@globalmind-smartwatch.com?subject=Liste d'attente - Suivi GPS"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-black transition"
        >
          Rejoindre la liste d'attente <ArrowRight className="w-4 h-4" />
        </a>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold hover:bg-slate-100 transition text-slate-800"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}