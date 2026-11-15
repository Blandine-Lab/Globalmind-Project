// app/calibration/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function CalibrationPage() {
  const [step, setStep] = useState(1);
  const [pairs, setPairs] = useState<any[]>([]);
  const [cuffSys, setCuffSys] = useState("");
  const [cuffDia, setCuffDia] = useState("");
  const [camSys, setCamSys] = useState<number | null>(null);
  const [camDia, setCamDia] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<any>(null);

  // 🎯 Simulation de la capture caméra (remplacez par votre vraie fonction startMeasurement)
  const simulateCameraCapture = () => {
    setLoading(true);
    setTimeout(() => {
      // Valeur aléatoire entre 120 et 150 pour la démo
      const randomSys = Math.floor(Math.random() * 30) + 120;
      const randomDia = Math.floor(Math.random() * 20) + 70;
      setCamSys(randomSys);
      setCamDia(randomDia);
      setLoading(false);
    }, 2000);
  };

  const addPair = async () => {
    if (!cuffSys || !cuffDia || camSys === null || camDia === null) {
      setError("Remplissez les valeurs du brassard et faites la capture caméra.");
      return;
    }
    
    const newPairs = [...pairs, {
      cuff_sys: parseInt(cuffSys),
      cuff_dia: parseInt(cuffDia),
      cam_sys: camSys,
      cam_dia: camDia,
    }];
    
    setPairs(newPairs);
    setCuffSys("");
    setCuffDia("");
    setCamSys(null);
    setCamDia(null);
    setError(null);

    if (newPairs.length < 3) {
      setStep(newPairs.length + 1);
    } else {
      // Envoi au backend
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`${API_URL}/api/health/calibrate`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${session?.access_token}` 
          },
          body: JSON.stringify({ pairs: newPairs }),
        });
        
        const body = await res.json();
        if (!res.ok) throw new Error(body.detail || "Calibration échouée");
        
        setDone(body);
      } catch (err: any) {
        setError(err.message);
        setPairs([]);
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-[32px] p-8 shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Calibration réussie !</h1>
          <p className="text-slate-500 mb-6">
            Votre profil a été ajusté avec succès.<br/>
            Vos 3 mesures ont révélé un biais de <strong>{done.raw_bias_sys.toFixed(1)} / {done.raw_bias_dia.toFixed(1)} mmHg</strong>.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl mb-6">
            <p className="text-sm text-slate-600">
              Correction appliquée : <strong>{done.bias_sys.toFixed(1)} / {done.bias_dia.toFixed(1)} mmHg</strong>
            </p>
          </div>
          <p className="text-xs text-slate-400 mb-8">
            Cette calibration est valable 7 jours. Vos prochaines mesures seront automatiquement corrigées.
          </p>
          <Link href="/ai-tension" className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors">
            Retour au bilan de santé
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/ai-tension" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-5 h-5" /> Retour
        </Link>
        <div className="font-bold text-slate-900">Calibration</div>
      </header>

      <main className="max-w-xl mx-auto p-6 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Calibrer mon profil</h1>
          <p className="text-slate-500">
            Faites 3 mesures avec un tensiomètre à brassard, et synchronisez-les avec l'IA.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-start gap-3">
          <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">i</div>
          <p className="text-sm text-blue-800">
            Mesure {step} sur 3. Asseyez-vous au calme pendant 5 minutes. Mesurez avec votre brassard, puis lancez la capture caméra juste après.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
          {/* Étape 1 : Brassard */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Mesure au brassard
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Systolique (Haut)</label>
                <input type="number" value={cuffSys} onChange={e => setCuffSys(e.target.value)} placeholder="Ex: 132" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-bold outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diastolique (Bas)</label>
                <input type="number" value={cuffDia} onChange={e => setCuffDia(e.target.value)} placeholder="Ex: 84" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-bold outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Étape 2 : Caméra */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Mesure par l'IA
            </h2>
            
            {camSys === null ? (
              <button onClick={simulateCameraCapture} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50">
                {loading ? "Capture en cours..." : "Lancer la capture caméra"}
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                <p className="text-sm text-emerald-800 font-medium mb-1">Capture réussie !</p>
                <p className="text-2xl font-black text-emerald-600">{camSys} / {camDia}</p>
              </div>
            )}
          </div>

          <button 
            onClick={addPair} 
            disabled={loading || camSys === null}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
          >
            {step < 3 ? `Valider la mesure ${step} et passer à la suite` : "Terminer la calibration"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Résumé des mesures déjà faites */}
        {pairs.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase">Mesures enregistrées</h3>
            {pairs.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Mesure {i+1}</span>
                <span className="text-slate-500">Brassard: {p.cuff_sys}/{p.cuff_dia} | Caméra: {p.cam_sys}/{p.cam_dia}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}