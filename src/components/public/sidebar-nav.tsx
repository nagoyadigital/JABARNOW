"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import type { NavLink } from "@/lib/navigation";

type Region = { slug: string; name: string; type: string };

/**
 * SidebarNav — menu kategori + wilayah di sidebar desktop.
 * Penanda aktif berupa kapsul oranye muda yang MELUNCUR halus ke item yang
 * diklik (langsung saat klik, tidak menunggu halaman selesai dimuat).
 * Animasi otomatis mati bila pengguna memilih prefers-reduced-motion.
 */
export function SidebarNav({
  categories,
  regions,
}: {
  categories: NavLink[];
  regions: Region[];
}) {
  const pathname = usePathname();
  // Item yang baru diklik: penanda langsung bergerak sebelum navigasi selesai
  const [clicked, setClicked] = useState<{ href: string; from: string } | null>(null);
  const activeHref =
    clicked && clicked.from === pathname
      ? clicked.href
      : matchActive(pathname, categories);

  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    // Ukur tautan/summary-nya, bukan <li> (yang memanjang saat Wilayah dibuka)
    const li = activeHref
      ? listRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
      : null;
    const el = li?.querySelector<HTMLElement>("summary") ?? (li?.firstElementChild as HTMLElement | null);
    setPill(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
  }, [activeHref]);

  const itemCls = (href: string) =>
    `relative z-10 block rounded-lg px-3 py-2 transition-[color,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:translate-x-1 ${
      activeHref === href ? "text-brand" : "hover:text-brand"
    }`;

  const kota = regions.filter((r) => r.type === "KOTA");
  const kabupaten = regions.filter((r) => r.type === "KABUPATEN");

  return (
    <nav aria-label="Kategori utama">
      <ul
        ref={listRef}
        className="relative -mx-3 flex flex-col gap-0.5 text-[15px] font-bold uppercase tracking-wide"
      >
        {/* Kapsul penanda aktif yang meluncur */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 rounded-lg bg-brand/10 transition-[top,height,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{
            top: pill?.top ?? 0,
            height: pill?.height ?? 0,
            opacity: pill ? 1 : 0,
          }}
        />
        {categories.map((cat) => (
          <li key={cat.href} data-href={cat.href}>
            <Link
              href={cat.href}
              aria-current={activeHref === cat.href ? "page" : undefined}
              onClick={() => setClicked({ href: cat.href, from: pathname })}
              className={itemCls(cat.href)}
            >
              {cat.label}
            </Link>
          </li>
        ))}
        <li data-href="/wilayah">
          {regions.length > 0 ? (
            <details className="group">
              <summary className={`${itemCls("/wilayah")} flex cursor-pointer list-none items-center justify-between`}>
                Wilayah
                <span
                  aria-hidden="true"
                  className="text-xs transition-transform duration-300 group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="max-h-72 space-y-3 overflow-y-auto px-3 pb-2 pt-1 text-sm font-normal normal-case tracking-normal">
                <RegionGroup title="Kota" items={kota} onNavigate={() => setClicked({ href: "/wilayah", from: pathname })} />
                <RegionGroup title="Kabupaten" items={kabupaten} onNavigate={() => setClicked({ href: "/wilayah", from: pathname })} />
                <Link
                  href="/wilayah"
                  onClick={() => setClicked({ href: "/wilayah", from: pathname })}
                  className="block font-semibold text-brand hover:underline"
                >
                  Semua Wilayah →
                </Link>
              </div>
            </details>
          ) : (
            <Link
              href="/wilayah"
              onClick={() => setClicked({ href: "/wilayah", from: pathname })}
              className={itemCls("/wilayah")}
            >
              Wilayah
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** Item aktif dari URL: /kategori/x → kategori itu; /wilayah… → Wilayah. */
function matchActive(pathname: string, categories: NavLink[]): string | null {
  if (pathname.startsWith("/wilayah")) return "/wilayah";
  return categories.find((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))?.href ?? null;
}

function RegionGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: Region[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/wilayah/${r.slug}`}
              onClick={onNavigate}
              className="text-charcoal/80 transition-colors hover:text-brand"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
