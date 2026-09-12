export function ConsoleLoader({ label = "LOADING" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-plasma shadow-glow"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
      <div className="font-mono text-[10px] tracking-[0.35em] text-inkdim">{label}…</div>
    </div>
  );
}

export function ErrorState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="clip-panel border border-alert/40 bg-alert/5 px-6 py-10 text-center">
      <div className="font-mono text-xs tracking-[0.3em] text-alert">SIGNAL FAULT</div>
      <p className="mt-2 text-sm text-inkdim">{message}</p>
      {children}
    </div>
  );
}
