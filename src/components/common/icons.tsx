/**
 * Ikon SVG inline ringan (tanpa dependency). currentColor agar ikut warna teks.
 */

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.2h.004c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.12-2.9-6.99A9.82 9.82 0 0 0 12.04 2Zm0 1.8a8.08 8.08 0 0 1 8.1 8.1c0 4.47-3.63 8.1-8.1 8.1a8.1 8.1 0 0 1-4.12-1.13l-.3-.17-3.07.8.82-3-.19-.31a8.05 8.05 0 0 1-1.24-4.29c0-4.47 3.64-8.1 8.1-8.1Zm-2.5 4.3c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.17 1.76 2.8 4.37 3.82 2.17.85 2.6.68 3.07.64.47-.04 1.52-.62 1.73-1.22.21-.6.21-1.11.15-1.22-.06-.1-.23-.17-.48-.3-.25-.12-1.52-.75-1.75-.83-.23-.09-.4-.13-.57.12-.17.25-.65.83-.8 1-.14.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.37-.78-1.87-.2-.48-.4-.42-.56-.43h-.48Z" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

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

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 2h-3.4v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.3a6.3 6.3 0 1 0 5.4 6.3V8.7a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.6V2Z" />
    </svg>
  );
}

export function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

function StrokeIcon({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.1l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />
    </svg>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </StrokeIcon>
  );
}

export function NewsIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 9h3v8a2 2 0 0 1-2 2" />
      <path d="M8 9h5M8 13h5M8 16h3" />
    </StrokeIcon>
  );
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </StrokeIcon>
  );
}

export function HashIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="m9 6 6 6-6 6" />
    </StrokeIcon>
  );
}

export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </StrokeIcon>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </StrokeIcon>
  );
}

export function BookOpenIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z" />
      <path d="M12 6.5v13" />
    </StrokeIcon>
  );
}
