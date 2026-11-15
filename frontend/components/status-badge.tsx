const map = {
  online: { label: "En ligne", cls: "bg-emerald-100 text-emerald-700" },
  offline: { label: "Hors ligne", cls: "bg-slate-200 text-slate-600" },
  error: { label: "Erreur", cls: "bg-rose-100 text-rose-700" },
};

export function StatusBadge({ status }: { status: keyof typeof map }) {
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}