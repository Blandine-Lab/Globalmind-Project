"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "#features", label: "Fonctionnalités" },
  { href: "#how", label: "Comment ça marche" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#team", label: "Équipe" },
  { href: "#security", label: "Sécurité" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // bloque le scroll quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* drawer */}
          <div className="relative h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="h-[72px] flex items-center justify-between px-5 border-b border-slate-200">
              <Logo size={36} variant="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition"
                >
                  {l.label}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </nav>

            <div className="p-5 border-t border-slate-200 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block text-center py-3 rounded-full border border-slate-300 font-semibold text-sm"
              >
                Se connecter
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block text-center py-3 rounded-full bg-slate-900 text-white font-semibold text-sm"
              >
                Demander une démo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}