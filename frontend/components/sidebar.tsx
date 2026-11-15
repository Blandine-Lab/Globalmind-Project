"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Camera, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/logo";

const items = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/cameras", label: "Caméras", icon: Camera },
  { href: "/events", label: "Événements", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy text-slate-200 flex flex-col border-r border-navy-border">
      <div className="h-20 flex items-center px-5 border-b border-navy-border">
        <Logo href="/dashboard" size={36} variant="dark" />
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-brand-gradient text-white shadow-glow font-medium"
                  : "hover:bg-navy-light text-slate-300 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-border text-[11px] text-slate-500">
        <p>Globalmind.MK.INNOTECH</p>
        <p>SmartWatch · v0.1 MVP</p>
      </div>
    </aside>
  );
}