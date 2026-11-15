// app/(dashboard)/cameras/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Maximize2, RefreshCw, Video } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import type { Camera } from "@/lib/types";

export default function CameraLivePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const cameras = await api.getCameras();
        if (cancelled) return;
        const found = cameras.find((c) => c.id === id) ?? null;
        setCamera(found);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message === "UNAUTHORIZED"
              ? "Session expirée. Veuillez vous reconnecter."
              : err?.message ?? "Erreur de chargement."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Chargement de la caméra...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/cameras"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux caméras
        </Link>
        <div className="bg-rose-50 rounded-xl border border-rose-200 p-8 text-center">
          <p className="text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="space-y-4">
        <Link
          href="/cameras"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux caméras
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Caméra introuvable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/cameras"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux caméras
        </Link>
        <StatusBadge status={camera.status} />
      </div>

      <div className="bg-navy rounded-2xl overflow-hidden shadow-xl">
        <div className="aspect-video relative flex items-center justify-center bg-slate-900">
          <Video className="w-16 h-16 text-slate-700" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">LIVE</span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/70">
            <span>{camera.name} · 1080p</span>
            <span className="bg-black/40 px-2 py-0.5 rounded">
              Placeholder — flux WebRTC à brancher
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">Informations</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Nom</dt>
              <dd className="font-medium">{camera.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Stream key</dt>
              <dd className="font-mono text-xs">{camera.stream_key}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Statut</dt>
              <dd>{camera.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Créée le</dt>
              <dd>{new Date(camera.created_at).toLocaleDateString("fr-FR")}</dd>
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold mb-3">Actions rapides</h2>
          <div className="space-y-2 text-sm">
            <button
              className="w-full py-2 rounded-lg bg-brand-gradient text-white font-medium opacity-60 cursor-not-allowed"
              disabled
            >
              Enregistrer (à venir)
            </button>
            <button
              className="w-full py-2 rounded-lg border border-slate-300 opacity-60 cursor-not-allowed"
              disabled
            >
              Parler (à venir)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}