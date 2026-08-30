interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
  valueClassName?: string;
}

export default function StatCard({ icon, label, value, sublabel, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-xl font-semibold text-zinc-100 ${valueClassName ?? ""}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>}
    </div>
  );
}
