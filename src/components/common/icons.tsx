/**
 * Ikon SVG inline ringan (tanpa dependency). currentColor agar ikut warna teks.
 */

export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.5c.4 2.6-1.1 4-2.6 5.4C7.6 9.5 6 11 6 13.8 6 17.3 8.9 20 12.3 20c3.3 0 6-2.5 6-5.9 0-2-1-3.7-2.3-5.1-.3 1-1 1.8-2 2.1.6-1.6.3-3.4-.8-4.8-.5-.7-1.1-1.3-1.5-2v-.3Z" />
      <path
        d="M12.3 20c-1.7 0-3-1.3-3-3 0-1.4.9-2.3 1.7-3 .1 1 .7 1.6 1.5 2 .9-.4 1.3-1.2 1.3-2.2.9.8 1.5 1.9 1.5 3.2 0 1.7-1.3 3-3 3Z"
        className="opacity-90"
        fill="#fff"
        fillOpacity="0.25"
      />
    </svg>
  );
}
