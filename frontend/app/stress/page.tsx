// app/stress/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function StressPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium">
          <ArrowLeft className="w-5 h-5" /> Retour a l'accueil
        </Link>
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Activity className="w-6 h-6 text-emerald-600" /> SmartStress AI
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-[800] tracking-tight mb-3">Analyse du Stress (VFC)</h1>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            La variabilite de votre frequence cardiaque (VFC / HRV) est calculee pendant le bilan complet.
            Un score de stress de 0 (calme) a 100 (stresse) vous sera presente.
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6">
            <p className="text-sm text-emerald-900 leading-relaxed">
              <strong>Cette mesure fait partie du bilan complet.</strong> Lorsque vous lancez l'examen,
              l'IA mesure en une seule fois votre rythme cardiaque, votre tension, votre VFC et votre respiration.
            </p>
          </div>

          <Link
            href="/ai-tension"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-black transition"
          >
            Lancer le bilan complet <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <p>Le score de stress est base sur la VFC (HRV-RMSSD). Resultat experimental, ne remplace pas un avis medical.</p>
          </div>
        </div>
      </main>
    </div>
  );
}