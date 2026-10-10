/**
 * AuthorCard — kartu penulis artikel (avatar inisial + nama).
 */
export function AuthorCard({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-base p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/90 text-sm font-semibold text-white">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-charcoal/50">Ditulis oleh</p>
        <p className="font-semibold">{name}</p>
      </div>
    </div>
  );
}
