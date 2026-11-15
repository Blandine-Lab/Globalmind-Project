// frontend/app/(dashboard)/health/page.tsx
"use client";

import Link from "next/link";
import { HeartPulse, Activity, Sparkles, ArrowRight, Clock } from "lucide-react";

export default function HealthPortalPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border text-emerald-500 bg-emerald-500/10 border-emerald-500/20 mb-6">
        <HeartPulse className="w-3.5 h-3.5" /> Santé IA
      </div>

      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
        Votre santé, mesurée par la lumière
      </h1>
      <p className="mt-3 text-slate-500 max-w-xl leading-relaxed">
        Lancez une mesure PPG depuis votre téléphone (caméra + torche), puis
        consultez l'historique de vos tendances.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <Link
          href="/ai-tension"
          className="group p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="mt-4 font-bold text-lg text-slate-950">
            Nouvelle mesure
          </h2>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            Analyse PPG par caméra + torche, en quelques secondes.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
            Lancer{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </span>
        </Link>

        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-400" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              <Clock className="w-3 h-3" /> Bientôt
            </span>
          </div>
          <h2 className="mt-4 font-bold text-lg text-slate-950">Historique</h2>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            Graphiques de tendance sur 7 / 30 / 90 jours, export PDF.
          </p>
          <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-slate-400">
            En développement
          </span>
        </div>
      </div>

      <div className="mt-10 p-5 rounded-2xl border border-slate-200 bg-white">
        <h3 className="font-bold text-sm text-slate-950">
          Comment ça marche ?
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
          <li>
            <span className="font-semibold text-slate-900">1.</span> Placez votre
            doigt sur la caméra arrière, torche allumée.
          </li>
          <li>
            <span className="font-semibold text-slate-900">2.</span> Restez
            immobile pendant 30&nbsp;s — l'IA analyse les micro-variations de
            lumière (PPG).
          </li>
          <li>
            <span className="font-semibold text-slate-900">3.</span> Obtenez votre
            tendance instantanément, sans matériel médical.
          </li>
        </ol>
      </div>

      <div className="mt-8">
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