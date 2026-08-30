interface HeaderProps {
  updatedAt: string | null;
  isLive: boolean;
}

export default function Header({ updatedAt, isLive }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-zinc-100">
            btc<span className="text-orange-500">·</span>monitor
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isLive ? "bg-emerald-500" : "bg-zinc-600"
              }`}
            />
            {isLive ? "โหนดปกติ" : "กำลังเชื่อมต่อ"}
          </span>
          <span className="hidden sm:inline">
            {updatedAt ? `อัปเดต ${updatedAt}` : "กำลังโหลด..."}
          </span>
        </div>
      </div>
    </header>
  );
}
