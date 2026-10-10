import Link from "next/link";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/permissions";
import { logoutAction } from "@/app/cms/actions";

/**
 * CmsTopbar — topbar terang: global search, lihat website, identitas + logout.
 * Notifikasi dashboard & search interaktif disempurnakan di tahap editorial.
 */
export function CmsTopbar({ name, role }: { name: string; role: Role }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-base px-4 md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <input
          type="search"
          placeholder="Cari artikel, penulis, kategori..."
          className="w-full max-w-md rounded-md border border-line bg-muted px-3 py-2 text-sm outline-none focus-visible:border-brand"
          aria-label="Pencarian global CMS"
        />
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden text-sm text-charcoal/70 transition-colors hover:text-brand sm:inline"
        >
          Lihat Website
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{name}</p>
          <p className="text-xs text-charcoal/50">{ROLE_LABELS[role]}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/90 text-sm font-semibold text-white">
          {initials}
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-line px-3 py-1.5 text-sm text-charcoal/70 transition-colors hover:border-brand hover:text-brand"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
