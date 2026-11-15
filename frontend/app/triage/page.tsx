// app/triage/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Brain, Activity, AlertTriangle, ShieldCheck, CheckCircle2, Stethoscope, Siren
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SYMPTOMS = [
  { id: "douleur_thoracique", label: "Douleur thoracique" },
  { id: "essoufflement", label: "Essoufflement" },
  { id: "perte_connaissance", label: "Perte de connaissance" },
  { id: "paralysie", label: "Paralysie / faiblesse soudaine" },
  { id: "fievre_haute", label: "Fievre elevee (>39°C)" },
  { id: "vomissements", label: "Vomissements persistants" },
  { id: "douleur_intense", label: "Douleur intense" },
  { id: "saignement", label: "Saignement" },
  { id: "toux", label: "Toux" },
  { id: "fatigue", label: "Fatigue" },
  { id: "mal_de_tete", label: "Mal de tete" },
  { id: "courbatures", label: "Courbatures" },
  { id: "nez_qui_coule", label: "Nez qui coule" },
];

type TriageResult = {
  urgency_level: string;
  urgency_label: string;
  specialist: string;
  advice: string;
};

export default function TriagePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const toggleSymptom = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Connectez-vous pour utiliser le triage.");

      const res = await fetch(`${API_URL}/api/triage/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ symptoms: selected }),
      });

      if (res.status === 401) throw new Error("Session expiree.");
      if (res.status === 403) throw new Error("Abonnez-vous au service Sante.");
      if (!res.ok) throw new Error("Erreur serveur.");

      const data: TriageResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case "red":
        return { bg: "bg-rose-50", border: "border-rose-200", color: "text-rose-700", icon: Siren };
      case "orange":
        return { bg: "bg-orange-50", border: "border-orange-200", color: "text-orange-700", icon: AlertTriangle };
      case "yellow":
        return { bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-700", icon: Activity };
      case "green":
      default:
        return { bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-700", icon: CheckCircle2 };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium">
          <ArrowLeft className="w-5 h-5" /> Retour a l'accueil
        </Link>
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Brain className="w-6 h-6 text-blue-600" /> SmartTriage AI
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-[800] tracking-tight mb-3">Verificateur de symptomes</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Selectionnez les symptomes que vous ressentez. Notre IA vous orientera vers le bon professionnel de sante.
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100">
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {SYMPTOMS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSymptom(s.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition ${
                  selected.includes(s.id)
                    ? "bg-blue-50 border-blue-200 text-blue-900 font-medium"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  selected.includes(s.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                }`}>
                  {selected.includes(s.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!result ? (
            <button
              onClick={analyze}
              disabled={loading || selected.length === 0}
              className="w-full py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Analyse en cours..." : "Analyser mes symptomes"}
            </button>
          ) : (
            (() => {
              const cfg = getUrgencyConfig(result.urgency_level);
              const Icon = cfg.icon;
              return (
                <div className={`p-6 rounded-2xl border ${cfg.bg} ${cfg.border} animate-in fade-in zoom-in`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className={`w-6 h-6 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${cfg.color} mb-1`}>
                        Niveau d'urgence
                      </p>
                      <h3 className={`text-2xl font-extrabold ${cfg.color}`}>{result.urgency_label}</h3>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" /> Specialiste recommande
                    </p>
                    <p className="font-bold text-slate-900">{result.specialist}</p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.advice}</p>

                  <button
                    onClick={() => { setResult(null); setSelected([]); }}
                    className="mt-6 w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    Refaire l'analyse
                  </button>
                </div>
              );
            })()
          )}

          <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <p>Ce triage est une aide a l'orientation et ne remplace pas un avis medical professionnel. En cas d'urgence vitale, appelez le 15 ou le 112.</p>
          </div>
        </div>
      </main>
    </div>
  );
}