import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  person: "Personne",
  animal: "Animal",
  motion: "Mouvement",
  unknown: "Inconnu",
};

export default async function EventsPage() {
  const [events, cameras] = await Promise.all([api.getEvents(), api.getCameras()]);
  const camMap = Object.fromEntries(cameras.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Événements</h1>
        <select className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white">
          <option>Toutes les caméras</option>
          {cameras.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Caméra</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Confiance</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">
                  {new Date(e.detected_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">{camMap[e.camera_id] ?? "—"}</td>
                <td className="px-4 py-3">{labels[e.event_type]}</td>
                <td className="px-4 py-3">
                  {e.confidence ? `${Math.round(e.confidence * 100)}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  {e.reviewed ? (
                    <span className="text-xs text-slate-500">Vu</span>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Nouveau</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-brand-blue hover:underline text-sm">Voir le clip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}