// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Save, Loader2 } from "lucide-react";

const ALL_SERVICES = [
  { slug: "watch", label: "Smart Watch (Caméras)" },
  { slug: "gps", label: "Smart Track (GPS & Alarme)" },
  { slug: "health", label: "Smart Care (Santé IA)" },
  { slug: "sensor", label: "Capteurs Porte/Fenêtre" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      // 1. Créer le client Supabase ICI, uniquement côté navigateur
      const supabase = createClient();

      // 2. Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // 3. Vérifier son rôle dans la base de données
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        console.log("Accès refusé. Rôle actuel :", profile?.role);
        router.push("/dashboard");
        return;
      }

      // 4. Si admin, charger la liste des clients
      const { data: clientsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client");

      if (clientsData) setClients(clientsData);
      setLoading(false);
    };
    
    checkAdminAndFetch();
  }, [router]); // Note: on retire 'supabase' des dépendances car il est créé à l'intérieur

  const toggleService = (clientId: string, serviceSlug: string) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          const currentServices = client.services || [];
          const hasService = currentServices.includes(serviceSlug);
          return {
            ...client,
            services: hasService
              ? currentServices.filter((s: string) => s !== serviceSlug)
              : [...currentServices, serviceSlug],
          };
        }
        return client;
      })
    );
  };

  const saveChanges = async (client: any) => {
    setSavingId(client.id);
    // Créer un nouveau client pour la sauvegarde est plus sûr
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ services: client.services })
      .eq("id", client.id);

    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Panneau Administrateur
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez les accès de vos clients aux services Globalmind.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Services Autorisés</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Aucun client trouvé dans la base de données.
                  </td>
                </tr>
              )}
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{client.full_name || "Sans nom"}</p>
                        <p className="text-slate-500 text-xs">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {ALL_SERVICES.map((service) => {
                        const isActive = client.services?.includes(service.slug);
                        return (
                          <button
                            key={service.slug}
                            onClick={() => toggleService(client.id, service.slug)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isActive
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {service.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => saveChanges(client)}
                      disabled={savingId === client.id}
                      className="bg-slate-950 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-black transition ml-auto disabled:opacity-50"
                    >
                      {savingId === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}