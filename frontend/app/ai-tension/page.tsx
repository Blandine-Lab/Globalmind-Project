// app/ai-tension/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  ShieldCheck,
  Camera,
  Activity,
  AlertTriangle,
  LogIn,
  Stethoscope,
  History,
  Heart,
  Droplets,
  Wind,
  Brain,
  Printer,
  Sparkles,
  Info,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const CAPTURE_FPS = 30;
const CAPTURE_SECONDS = 10;
const TOTAL_CAPTURES = 3;
const MAX_FRAMES = CAPTURE_FPS * CAPTURE_SECONDS;

const CANVAS_SIZE = 128;
const ROI_FRACTION = 0.4;
const ROI_X = Math.floor((CANVAS_SIZE * (1 - ROI_FRACTION)) / 2);
const ROI_Y = Math.floor((CANVAS_SIZE * (1 - ROI_FRACTION)) / 2);
const ROI_W = Math.floor(CANVAS_SIZE * ROI_FRACTION);
const ROI_H = Math.floor(CANVAS_SIZE * ROI_FRACTION);

const MIN_VALID_RED = 40;
const MAX_VALID_RED = 250;

const MARGE_SYS = 13;
const MARGE_DIA = 9;

// 🎯 MODE DÉMO : On accepte TOUT pour tester l'interface
const MAX_RANGE_SYS = 200; 
const MAX_STD_SYS = 100;

type BpResult = {
  systolic_mmHg: number;
  diastolic_mmHg?: number | null;
  std_mmHg: number;
  n_windows: number;
  warnings: string[];
  model_info: Record<string, unknown>;
  measured_at: string;
  heart_rate_bpm?: number | null;
  heart_rate_confidence?: number | null;
  stress_score?: number | null;
  respiratory_rate_bpm?: number | null;
  hrv_rmssd?: number | null;
  spo2?: number | null;
};

type NormalizedBpResult = BpResult & { _bpHidden?: boolean };

type StatusInfo = {
  label: string;
  color: string;
  bg: string;
  advice: string;
};

function normalizeBpResult(r: BpResult): NormalizedBpResult {
  let bpm = r.heart_rate_bpm ?? null;
  if (bpm !== null && bpm < 55) {
    const doubled = bpm * 2;
    if (doubled >= 55 && doubled <= 110) bpm = Math.round(doubled);
  } else if (bpm !== null && bpm > 110) {
    const halved = bpm / 2;
    if (halved >= 55 && halved <= 110) bpm = Math.round(halved);
  }

  const isLowQ = r.warnings?.includes("signal_quality_low") ?? false;
  const pp =
    r.diastolic_mmHg != null ? r.systolic_mmHg - r.diastolic_mmHg : null;

  const bpHidden =
    isLowQ &&
    (r.systolic_mmHg < 90 ||
      (r.diastolic_mmHg != null && r.diastolic_mmHg < 60) ||
      (pp !== null && (pp < 20 || pp > 90)) ||
      (r.systolic_mmHg < 85 && (r.diastolic_mmHg ?? 0) < 50));

  return { ...r, heart_rate_bpm: bpm, _bpHidden: bpHidden };
}

export default function AITensionDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCapture, setCurrentCapture] = useState(0);
  const [liveRed, setLiveRed] = useState<number | null>(null);
  const [result, setResult] = useState<NormalizedBpResult | null>(null);
  const [history, setHistory] = useState<NormalizedBpResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const loadHistory = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`${API_URL}/api/health/measurements?limit=30`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as BpResult[];
        const normalized = data.map(normalizeBpResult).filter(m => m.systolic_mmHg > 50 && m.systolic_mmHg < 250);
        const grouped = new Map<string, NormalizedBpResult[]>();
        for (const m of normalized) {
          const key = new Date(m.measured_at).toISOString().slice(0, 16);
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)!.push(m);
        }
        const groupedResults: NormalizedBpResult[] = [];
        for (const [, group] of grouped) {
          if (group.length === 1) {
            groupedResults.push(group[0]);
          } else {
            const sorted = [...group].sort((a, b) => a.systolic_mmHg - b.systolic_mmHg);
            groupedResults.push(sorted[Math.floor(sorted.length / 2)]);
          }
        }
        groupedResults.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
        setHistory(groupedResults.slice(0, 5));
      }
    } catch (err) {
      console.error("History load error", err);
    }
  };

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      if (data.session) loadHistory();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const stopCamera = (s: MediaStream | null) => {
    s?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startMeasurement = async () => {
    setIsMeasuring(true);
    setResult(null);
    setError(null);
    setProgress(0);
    setCurrentCapture(1);
    setLiveRed(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 2 && v.videoWidth > 0) return resolve();
          v.onloadedmetadata = () => resolve();
        });
      }

      const track = mediaStream.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() || {}) as any;
      if (caps.torch) {
        try { await track.applyConstraints({ advanced: [{ torch: true }] } as any); } catch {}
      }

      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Impossible de creer un canvas 2D");

      const capturedResults: BpResult[] = [];

      for (let c = 1; c <= TOTAL_CAPTURES; c++) {
        setCurrentCapture(c);
        const samples: number[] = [];
        const blue_samples: number[] = [];
        const timestamps: number[] = [];
        let frames = 0;

        await new Promise<void>((resolve) => {
          const tick = () => {
            const v = videoRef.current;
            if (!v || v.videoWidth === 0) { setTimeout(tick, 20); return; }

            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const { data } = ctx.getImageData(ROI_X, ROI_Y, ROI_W, ROI_H);

            let sumR = 0;
            let sumB = 0;
            const nPix = data.length / 4;
            for (let i = 0; i < data.length; i += 4) {
              sumR += data[i];
              sumB += data[i + 2];
            }
            const meanRed = sumR / nPix;
            const meanBlue = sumB / nPix;

            const valid = meanRed >= MIN_VALID_RED && meanRed <= MAX_VALID_RED;
            if (valid) {
              samples.push(meanRed);
              blue_samples.push(meanBlue);
              timestamps.push(performance.now());
            }

            frames++;
            if (frames % 9 === 0) {
              setLiveRed(valid ? meanRed : null);
              const globalProgress = Math.round((((c - 1) * MAX_FRAMES) + frames) / (TOTAL_CAPTURES * MAX_FRAMES) * 100);
              setProgress(Math.min(100, globalProgress));
            }

            if (frames >= MAX_FRAMES) { return resolve(); }
            setTimeout(tick, 1000 / CAPTURE_FPS);
          };
          tick();
        });

        if (samples.length / frames < 0.5) {
          throw new Error(`Capture ${c}/${TOTAL_CAPTURES} : Signal trop faible.`);
        }

        const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
        const measuredFs = duration > 0 ? Math.round((samples.length - 1) / duration) : CAPTURE_FPS;

        const res = await sendToBackend(samples, blue_samples, measuredFs);
        capturedResults.push(res);

        if (c < TOTAL_CAPTURES) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      setProgress(100);
      stopCamera(mediaStream);

      const medianResult = computeMedian(capturedResults);
      setResult(medianResult);
      loadHistory();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("aberrante")) {
        setError("L'IA a détecté une valeur impossible. Votre doigt a probablement bougé. Recommencez en restant parfaitement immobile.");
      } else if (msg.includes("Signal")) {
        setError(msg);
      } else {
        setError(msg || "Erreur inattendue lors de la mesure.");
      }
      stopCamera(stream);
    } finally {
      setIsMeasuring(false);
    }
  };

  const sendToBackend = async (ppg_samples: number[], blue_samples: number[], fs: number): Promise<BpResult> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expiree - reconnectez-vous.");

    const res = await fetch(`${API_URL}/api/health/measure`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ ppg_samples, blue_samples, fs }),
    });

    if (res.status === 401) throw new Error("Session expiree.");
    if (res.status === 403) throw new Error("Abonnez-vous au service Sante.");
    if (res.status === 422) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? "Signal invalide.");
    }
    if (!res.ok) throw new Error(`Erreur serveur (${res.status}).`);

    return await res.json();
  };

  const computeMedian = (resList: BpResult[]): NormalizedBpResult => {
    if (resList.length === 0) throw new Error("Aucune capture.");

    const validResults = resList.filter(r => r.systolic_mmHg > 50 && r.systolic_mmHg < 250);
    if (validResults.length === 0) {
      throw new Error("Toutes les mesures sont incohérentes. Reposez le doigt et recommencez.");
    }

    const sorted = [...validResults].sort((a, b) => a.systolic_mmHg - b.systolic_mmHg);
    const medianCapture = sorted[Math.floor(sorted.length / 2)];

    const sysVals = sorted.map((r) => r.systolic_mmHg);
    const meanSys = sysVals.reduce((a, b) => a + b, 0) / sysVals.length;
    const stdSys = Math.sqrt(sysVals.reduce((a, b) => a + Math.pow(b - meanSys, 2), 0) / sysVals.length);

    const medianOf = (vals: (number | null | undefined)[]) => {
      const v = vals.filter((x): x is number => x != null).sort((a, b) => a - b);
      return v.length ? v[Math.floor(v.length / 2)] : null;
    };

    const merged: BpResult = {
      ...medianCapture,
      systolic_mmHg: medianCapture.systolic_mmHg,
      diastolic_mmHg: medianCapture.diastolic_mmHg,
      heart_rate_bpm: medianOf(resList.map((r) => r.heart_rate_bpm)),
      stress_score: null,
      respiratory_rate_bpm: medianOf(resList.map((r) => r.respiratory_rate_bpm)),
      spo2: medianOf(resList.map((r) => r.spo2)),
      std_mmHg: stdSys,
      warnings: Array.from(new Set(resList.flatMap((r) => r.warnings))),
    };

    return normalizeBpResult(merged);
  };

  const bpm = result?.heart_rate_bpm ?? null;
  const spo2 = result?.spo2 ?? null;

  const getBpmStatus = (val: number | null | undefined): StatusInfo => {
    if (val === null || val === undefined) return { label: "Inconnu", color: "text-slate-500", bg: "bg-slate-100", advice: "Mesure non detectee." };
    if (val < 60) return { label: "Rythme lent", color: "text-blue-600", bg: "bg-blue-50", advice: "Rythme lent. Si vous etes sportif, c'est fréquent. Sinon, surveillez les vertiges." };
    if (val <= 100) return { label: "Dans la plage usuelle 60-100", color: "text-emerald-600", bg: "bg-emerald-50", advice: "Votre rythme cardiaque est dans la plage usuelle (60-100 bpm)." };
    return { label: "Rythme élevé", color: "text-amber-600", bg: "bg-amber-50", advice: "Rythme élevé. Reposez-vous 5 min et refaites la mesure." };
  };

  const getBpStatus = (sys: number, dia: number | null | undefined, std: number): StatusInfo => {
    if (std > MAX_STD_SYS) return { label: "Non concluant", color: "text-slate-500", bg: "bg-slate-100", advice: "Signal trop instable pour une tension fiable." };
    if (sys > 180 || (dia != null && dia > 120)) return { label: "Estimation très haute - Vérifiez au brassard", color: "text-rose-700", bg: "bg-rose-100", advice: "Vérifiez immédiatement avec un tensiomètre à brassard." };
    return { label: "Estimation - À vérifier au brassard", color: "text-slate-600", bg: "bg-slate-100", advice: `Estimation caméra, marge ±${MARGE_SYS} / ±${MARGE_DIA} mmHg.` };
  };

  const isLowQuality = !!result?.warnings?.includes("signal_quality_low");
  const bpmOk = bpm !== null && bpm >= 55 && bpm <= 110;

  const pulsePressure = result?.diastolic_mmHg
    ? result.systolic_mmHg - result.diastolic_mmHg
    : null;

  const bpAbsurd =
    !!result &&
    isLowQuality &&
    (result.systolic_mmHg < 90 ||
      (result.diastolic_mmHg != null && result.diastolic_mmHg < 60) ||
      (pulsePressure !== null && (pulsePressure < 20 || pulsePressure > 90)) ||
      (result.systolic_mmHg < 85 && (result.diastolic_mmHg ?? 0) < 50));

  const _bpmStatRaw = getBpmStatus(bpm);
  const _bpStatRaw = result
    ? getBpStatus(result.systolic_mmHg, result.diastolic_mmHg, result.std_mmHg)
    : null;

  const bpmStat: StatusInfo = (isLowQuality && !bpmOk)
    ? { label: "Non concluant", color: "text-slate-500", bg: "bg-slate-100", advice: "Signal trop instable pour detecter un pouls fiable." }
    : _bpmStatRaw;

  const bpStat: StatusInfo | null = bpAbsurd
    ? { label: "Non concluant", color: "text-slate-500", bg: "bg-slate-100", advice: "Signal trop instable pour une tension fiable. Refaites la mesure." }
    : _bpStatRaw;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-12 overflow-x-hidden">
      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .animate-scanline {
          animation: scanline 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" /> Retour
        </Link>
        
        <div className="flex items-center gap-4">
          {/* 🎯 BOUTON DE CALIBRATION */}
          <Link href="/calibration" className="hidden sm:flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
            <Target className="w-4 h-4" /> Calibrer mon profil
          </Link>
          
          <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
            <div className="p-1.5 bg-blue-600/10 rounded-lg">
              <HeartPulse className="w-5 h-5 text-blue-600" />
            </div>
            SmartHealth <span className="text-blue-600">AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 print:pt-0 print:px-0 print:max-w-none">
        
        <div className="text-center mb-10 print:hidden animate-in fade-in slide-in-from-top-4 duration-500">
          {/* 🎯 NOUVEAU NOM ICI */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-slate-900">
            Globalmind <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Health Check</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Posez délicatement le bout de votre doigt sur la caméra arrière et la torche. L'IA fera <b className="text-slate-800">{TOTAL_CAPTURES} captures de {CAPTURE_SECONDS}s</b> pour analyser votre corps.
          </p>
          
          {/* Lien de calibration visible aussi ici sur mobile */}
          <div className="mt-4 sm:hidden">
            <Link href="/calibration" className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
              <Target className="w-4 h-4" /> Calibrer mon profil
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start print:block">
          
          <div className="lg:col-span-5 bg-white rounded-[32px] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative print:hidden group transition-all">
            <div className="relative w-full aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${isMeasuring ? "opacity-100" : "opacity-30"}`} />

              {isMeasuring && (
                <>
                  <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30 rounded-2xl" />
                  <div className="absolute left-0 right-0 h-1 bg-blue-400/80 shadow-[0_0_20px_4px_rgba(96,165,250,0.5)] animate-scanline pointer-events-none" />
                </>
              )}

              {!isMeasuring && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 backdrop-blur-sm transition-all duration-500">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 ring-1 ring-white/20">
                    <Camera className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="font-medium tracking-wide">Caméra en attente</p>
                </div>
              )}

              {isMeasuring && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="absolute top-6 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2 rounded-full font-bold text-xs tracking-wider shadow-2xl border border-white/10 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    ANALYSE {currentCapture} / {TOTAL_CAPTURES}
                  </div>

                  <div className="absolute bottom-6 w-full px-8">
                    <div className="w-full bg-slate-800/80 backdrop-blur-md rounded-full h-2.5 ring-1 ring-white/10 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-center text-white/90 text-xs mt-3 font-medium tracking-wide">Ne bougez pas... {progress}%</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in shake">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {authed === false ? (
              <Link href="/login?next=/ai-tension" className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors shadow-lg">
                <LogIn className="w-5 h-5" /> Se connecter
              </Link>
            ) : (
              <button
                onClick={startMeasurement}
                disabled={isMeasuring}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-[15px] transition-all duration-300 ${
                  isMeasuring 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.18)] hover:-translate-y-0.5"
                }`}
              >
                {isMeasuring ? "Analyse en cours..." : `Lancer l'examen complet`}
              </button>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6 print:w-full">
            
            {result && (
              <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="font-bold text-2xl text-slate-900">Globalmind Smart Care</h1>
                    <p className="text-sm text-slate-500">Bilan de santé numérique</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Date de l'examen</p>
                  <p className="font-bold text-slate-900">{new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}</p>
                </div>
              </div>
            )}

            {result && !isMeasuring ? (
              <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 print:shadow-none print:border-none print:p-0">
                
                {result.model_info?.needs_recalib && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-bold text-sm text-amber-900">Calibration de plus de 7 jours</p>
                      <p className="text-xs text-amber-700">Vos mesures ne sont plus corrigées. <a href="/calibration" className="underline font-bold">Refaire la calibration (3 min)</a></p>
                    </div>
                  </div>
                )}
                {result.model_info?.calibrated && (
                  <p className="text-[11px] text-emerald-600 font-semibold mb-4 flex items-center gap-1">
                    ✅ Mesure corrigée avec votre calibration personnelle
                  </p>
                )}

                <div className="flex items-center justify-between mb-8 print:mb-6">
                  <h2 className="text-xl font-extrabold flex items-center gap-2.5 text-slate-900 print:hidden">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-blue-600" /> 
                    </div>
                    Votre Bilan
                  </h2>
                  <h2 className="hidden print:block text-xl font-bold">Résultats de l'analyse IA</h2>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[11px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-semibold tracking-wide print:hidden uppercase">
                      Médiane de {TOTAL_CAPTURES} mesures
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm print:hidden"
                    >
                      <Printer className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:grid-cols-2 print:gap-6">
                  
                  <div className={`relative p-5 rounded-[24px] border bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-sm overflow-hidden group print:border-slate-300 print:bg-white`}>
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Heart className="w-24 h-24" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> Fréquence Cardiaque
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tighter ${bpmStat.color}`}>{bpm?.toFixed(0) ?? "--"}</span>
                      <span className="text-sm font-bold text-slate-400">bpm</span>
                    </div>
                    <div className={`inline-flex items-center mt-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${bpmStat.color} bg-white border border-slate-100 shadow-sm print:bg-transparent print:border-none`}>
                      {bpmStat.label}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">{bpmStat.advice}</p>
                  </div>

                  <div className={`relative p-5 rounded-[24px] border bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-sm overflow-hidden group print:border-slate-300 print:bg-white`}>
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Droplets className="w-24 h-24" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tension Estimée
                    </p>
                    <div className="flex items-baseline gap-1">
                      {bpAbsurd ? (
                        <>
                          <span className="text-4xl font-black tracking-tighter text-slate-300">--</span>
                          <span className="text-slate-300 mx-1 text-2xl font-light">/</span>
                          <span className="text-4xl font-black tracking-tighter text-slate-300">--</span>
                        </>
                      ) : (
                        <>
                          <span className={`text-4xl font-black tracking-tighter ${bpStat?.color}`}>
                            {result.systolic_mmHg.toFixed(0)}
                          </span>
                          <span className="text-slate-300 mx-1 text-2xl font-light">/</span>
                          <span className={`text-4xl font-black tracking-tighter ${bpStat?.color} opacity-80`}>
                            {result.diastolic_mmHg?.toFixed(0) ?? "--"}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${bpStat?.color} bg-white border border-slate-100 shadow-sm print:bg-transparent print:border-none`}>
                        {bpStat?.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-3 font-semibold">
                      Marge : ±{MARGE_SYS} / ±{MARGE_DIA} mmHg
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1">
                      <Info className="w-3 h-3 shrink-0 mt-0.5" /> {bpStat?.advice}
                    </p>
                  </div>

                  <div className={`relative p-5 rounded-[24px] border bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-sm overflow-hidden group print:border-slate-300 print:bg-white`}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" /> Niveau de Stress
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tighter text-slate-400">Bêta</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                      Indicateur expérimental, non validé médicalement.
                    </p>
                  </div>

                  <div className={`relative p-5 rounded-[24px] border bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100 shadow-sm overflow-hidden group print:border-slate-300 print:bg-white`}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-cyan-500" /> Respiration
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tighter text-cyan-600`}>
                        {result.respiratory_rate_bpm?.toFixed(0) ?? "--"}
                      </span>
                      <span className="text-sm font-bold text-slate-400">resp/min</span>
                    </div>
                    <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-cyan-700/60 bg-white/50 px-2.5 py-1 rounded-md">
                      Rythme estimé
                    </span>
                  </div>

                  <div className={`relative p-5 rounded-[24px] border bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-sm overflow-hidden group print:border-slate-300 print:bg-white col-span-1 sm:col-span-2 lg:col-span-1`}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-purple-500" /> Saturation O₂
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tighter text-purple-600`}>
                        {spo2?.toFixed(0) ?? "--"}
                      </span>
                      <span className="text-sm font-bold text-slate-400">%</span>
                    </div>
                    <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-purple-700/60 bg-white/50 px-2.5 py-1 rounded-md">
                      {(spo2 ?? 0) >= 95 ? "Normal" : "À surveiller"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-3 text-xs text-slate-400 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 print:bg-transparent print:p-0 print:border-t print:border-slate-200 print:pt-4">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-slate-300 print:hidden" />
                  <p className="leading-relaxed">Ces résultats sont générés par une intelligence artificielle à des fins de suivi personnel. Ce ne sont pas des diagnostics médicaux.</p>
                </div>

                <div className="hidden print:block mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                  <p>Document généré par Globalmind Smart Care & Watch</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center min-h-[420px] print:hidden animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                  <Brain className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-800 mb-2">Prêt pour l'analyse</h3>
                <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed">
                  Lancez une capture pour découvrir votre rythme cardiaque, tension et saturation en oxygène.
                </p>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 print:hidden">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <History className="w-4 h-4" /> Historique récent
                </h3>
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group gap-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400 mb-2">
                          {new Date(h.measured_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500" /> {h.heart_rate_bpm?.toFixed(0) ?? "--"} <span className="text-[10px] text-slate-400 font-medium">bpm</span>
                          </span>
                          <span className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-cyan-500" /> {h.respiratory_rate_bpm?.toFixed(0) ?? "--"} <span className="text-[10px] text-slate-400 font-medium">resp/min</span>
                          </span>
                          <span className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-purple-500" /> {h.spo2?.toFixed(0) ?? "--"} <span className="text-[10px] text-slate-400 font-medium">%</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-black text-slate-700 bg-slate-50 group-hover:bg-white px-4 py-2 rounded-xl border border-slate-100 transition-colors shadow-sm self-start sm:self-auto">
                        {h._bpHidden ? (
                          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide">Bruité</span>
                        ) : (
                          <>
                            <span className="text-blue-600">{h.systolic_mmHg.toFixed(0)}</span>
                            <span className="text-slate-300 font-normal mx-0.5">/</span>
                            <span className="text-slate-500">{h.diastolic_mmHg?.toFixed(0) ?? "--"}</span>
                            <span className="text-[9px] text-slate-400 font-bold ml-1.5 uppercase">mmHg</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}