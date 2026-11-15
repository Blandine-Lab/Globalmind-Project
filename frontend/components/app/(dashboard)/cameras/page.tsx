import { Camera as CameraIcon, Video } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CamerasPage() {
  const cameras = await api.getCameras();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Caméras</h1>
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
              <button
                disabled={c.status !== "online"}
                className="text-sm px-3 py-1.5 rounded-md bg-brand-gradient text-white disabled:bg-slate-300 disabled:cursor-not-allowed disabled:bg-none"
              >
                Voir en direct
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}