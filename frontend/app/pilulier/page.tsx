// app/pilulier/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pill,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  LogIn,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Medication = {
  id: string;
  name: string;
  dosage: string | null;
  times: string[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

type Intake = {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_at: string;
};

export default function PilulierPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDosage, setFormDosage] = useState("");
  const [formTimes, setFormTimes] = useState<string[]>(["08:00"]);
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);

    try {
      const [medsRes, intakesRes] = await Promise.all([
        fetch(`${API_URL}/api/pilulier/medications`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/api/pilulier/intakes/today`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (medsRes.ok) setMedications(await medsRes.json());
      if (intakesRes.ok) setIntakes(await intakesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addTimeSlot = () => {
    setFormTimes((prev) => [...prev, "12:00"]);
  };

  const removeTimeSlot = (idx: number) => {
    setFormTimes((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTimeSlot = (idx: number, val: string) => {
    setFormTimes((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  const resetForm = () => {
    setFormName("");
    setFormDosage("");
    setFormTimes(["08:00"]);
    setFormNotes("");
    setShowForm(false);
  };

  const createMedication = async () => {
    setError(null);
    setSuccess(null);

    if (!formName.trim()) {
      setError("Le nom du medicament est obligatoire.");
      return;
    }
    if (formTimes.length === 0) {
      setError("Ajoutez au moins un horaire.");
      return;
    }
    const badTime = formTimes.find((t) => !/^\d{2}:\d{2}$/.test(t));
    if (badTime) {
      setError(`Horaire invalide : ${badTime}`);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expiree.");

      const res = await fetch(`${API_URL}/api/pilulier/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          dosage: formDosage.trim() || null,
          times: formTimes,
          notes: formNotes.trim() || null,
        }),
      });

      if (res.status === 401) throw new Error("Session expiree.");
      if (res.status === 403) throw new Error("Abonnez-vous au service Sante.");
      if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Donnees invalides.");
      }
      if (!res.ok) throw new Error(`Erreur serveur (${res.status}).`);

      const newMed: Medication = await res.json();
      setMedications((prev) => [newMed, ...prev]);
      setSuccess(`${newMed.name} ajoute.`);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMedication = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} et toutes ses prises ?`)) return;

    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expiree.");

      const res = await fetch(`${API_URL}/api/pilulier/medications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Erreur serveur (${res.status}).`);
      }

      setMedications((prev) => prev.filter((m) => m.id !== id));
      setIntakes((prev) => prev.filter((i) => i.medication_id !== id));
      setSuccess(`${name} supprime.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue.");
    }
  };

  const takeMedication = async (medId: string, scheduledTime: string, medName: string) => {
    setError(null);

    // Verifier si deja pris pour ce creneau aujourd'hui
    const alreadyTaken = intakes.some(
      (i) => i.medication_id === medId && i.scheduled_time === scheduledTime
    );
    if (alreadyTaken) {
      setSuccess(`${medName} deja pris a ${scheduledTime}.`);
      setTimeout(() => setSuccess(null), 2500);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expiree.");

      const res = await fetch(`${API_URL}/api/pilulier/medications/${medId}/take`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ scheduled_time: scheduledTime }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Erreur serveur (${res.status}).`);
      }

      const newIntake: Intake = await res.json();
      setIntakes((prev) => [newIntake, ...prev]);
      setSuccess(`${medName} pris a ${scheduledTime}.`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue.");
    }
  };

  const nowHHMM = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const isTakenToday = (medId: string, scheduledTime: string) => {
    return intakes.some(
      (i) => i.medication_id === medId && i.scheduled_time === scheduledTime
    );
  };

  const isCloseToNow = (scheduled: string) => {
    const [sh, sm] = scheduled.split(":").map(Number);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const schedMin = sh * 60 + sm;
    return Math.abs(nowMin - schedMin) <= 60;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium">
          <ArrowLeft className="w-5 h-5" /> Retour a l'accueil
        </Link>
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Pill className="w-6 h-6 text-blue-600" /> SmartPilulier
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-[800] tracking-tight mb-3">Pilulier connecte</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Ajoutez vos medicaments et leurs horaires. Cochez chaque prise pour garder un suivi quotidien.
          </p>
        </div>

        {authed === false ? (
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 text-center">
            <LogIn className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-6">Connectez-vous pour acceder a votre pilulier.</p>
            <Link
              href="/login?next=/pilulier"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition"
            >
              <LogIn className="w-5 h-5" /> Se connecter
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center text-slate-500 py-12">Chargement...</div>
        ) : (
          <>
            {/* Bouton ajouter / Formulaire */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-6 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" /> Ajouter un medicament
              </button>
            ) : (
              <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Nouveau medicament</h3>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Doliprane"
                      maxLength={150}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={formDosage}
                      onChange={(e) => setFormDosage(e.target.value)}
                      placeholder="Ex: 500 mg, 1 comprime"
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Horaires *
                    </label>
                    <div className="space-y-2">
                      {formTimes.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={t}
                            onChange={(e) => updateTimeSlot(idx, e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                          />
                          {formTimes.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(idx)}
                              className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addTimeSlot}
                      className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Ajouter un horaire
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Notes
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: pendant le repas"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={createMedication}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submitting ? "Ajout..." : "Ajouter"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                <Check className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Liste des medicaments */}
            {medications.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100 text-center">
                <Pill className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Aucun medicament</h3>
                <p className="text-sm text-slate-500">Ajoutez votre premier medicament pour commencer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{med.name}</h3>
                        {med.dosage && (
                          <p className="text-sm text-slate-500">{med.dosage}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMedication(med.id, med.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {med.notes && (
                      <p className="text-xs text-slate-500 italic mb-3">{med.notes}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {med.times.map((t) => {
                        const taken = isTakenToday(med.id, t);
                        const close = isCloseToNow(t);
                        return (
                          <button
                            key={t}
                            onClick={() => takeMedication(med.id, t, med.name)}
                            disabled={taken}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition ${
                              taken
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                                : close
                                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {t}
                            {taken && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Historique des prises du jour */}
            {intakes.length > 0 && (
              <div className="mt-8 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Prises du jour
                </h3>
                <div className="space-y-2">
                  {intakes.map((intake) => {
                    const med = medications.find((m) => m.id === intake.medication_id);
                    return (
                      <div
                        key={intake.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-slate-800">
                            {med?.name ?? "Medicament"}
                          </span>
                          <span className="text-xs text-slate-400">
                            (creneau {intake.scheduled_time})
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(intake.taken_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <p>
                Ce pilulier est un outil de suivi, pas un dispositif medical. Il ne remplace pas l'ordonnance ni l'avis de votre medecin. En cas d'oubli ou de doute, consultez un professionnel de sante.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}