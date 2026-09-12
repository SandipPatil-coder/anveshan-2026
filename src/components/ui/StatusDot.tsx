export default function StatusDot({ tone = "open" }: { tone?: "open" | "closed" | "pending" }) {
  const color = tone === "open" ? "bg-signet" : tone === "closed" ? "bg-alert" : "bg-accent-warm";
  return (
    <span className="relative flex h-2 w-2" aria-hidden>
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}
