// app/(dashboard)/cameras/page.tsx
"use client"; // 👈 AJOUT IMPORTANT

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera as CameraIcon, Video, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import type { Camera } from "@/lib/types";

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCameras() {
      try {
        // On ne passe plus le token manuellement
        const data = await api.getCameras();
        setCameras(data);
      } catch (err: any) {
        console.error("Erreur API :", err);
        setError(err.message === "UNAUTHORIZED" ? "Session expirée. Veuillez vous reconnecter." : err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCameras();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Caméras</h1>
      
      {cameras.length === 0 ? (
        <p className="text-slate-500">Aucune caméra n'est configurée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cameras.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="aspect-video bg-navy flex items-center justify-center relative">
                {c.status === "online" ? (
                  <Video className="w-10 h-10 text-slate-600" />
                ) : (
                  <CameraIcon className="w-10 h-10 text-slate-700" />
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={c.status} />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.stream_key}</p>
                </div>
                <Link
                  href={c.status === "online" ? `/cameras/${c.id}` : "#"}
                  aria-disabled={c.status !== "online"}
                  className={`text-sm px-3 py-1.5 rounded-md ${
                    c.status === "online"
                      ? "bg-brand-gradient text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Voir en direct
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}