// app/(dashboard)/layout.tsx
"use client";

import { useRouter } from "next/navigation";
import { Camera, LogOut, Search, User } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase"; // 👈 Import de Supabase

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient(); // 👈 Initialisation du client

  // 👈 Nouvelle fonction de déconnexion
  async function logout() {
    await supabase.auth.signOut(); // Détruit la session Supabase
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-cloud">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Camera className="w-4 h-4 text-brand-blue" />
            <span className="font-medium text-ink">Espace client</span>
            <span className="text-slate-400">/</span>
            <span>Maison Dupont</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une caméra…"
                className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
              />
            </div>
            <span className="hidden sm:block text-sm text-slate-600">client@demo.fr</span>
            <div className="w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-rose-600 p-2"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}