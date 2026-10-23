"use client";

import { useState } from "react";
import type { Article } from "@/lib/types";
import { MostReadRankRow } from "@/components/public/news-cards";
import { SectionHeading } from "@/components/public/section-heading";
import { FlameIcon } from "@/components/common/icons";

/**
 * MostRead — HANYA dua tab: 24 Jam dan 7 Hari (00-MASTER-DESIGN-RULES.md).
 * Ganti tab tanpa reload penuh. Empty state per tab bila data kosong.
 */
export function MostRead({
  data24h,
  data7d,
}: {
  data24h: Article[];
  data7d: Article[];
}) {
  const [tab, setTab] = useState<"24h" | "7d">("24h");
  const list = tab === "24h" ? data24h : data7d;

  const tabCls = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white" : "bg-muted text-charcoal/60 hover:text-charcoal"
    }`;

  return (
    <section aria-labelledby="most-read-heading">
      <div id="most-read-heading">
        <SectionHeading
          title="Terpopuler"
          icon={FlameIcon}
        />
      </div>
      <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
        <div className="mb-2 flex gap-2" role="tablist" aria-label="Rentang Most Read">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "24h"}
            onClick={() => setTab("24h")}
            className={tabCls(tab === "24h")}
          >
            24 Jam
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "7d"}
            onClick={() => setTab("7d")}
            className={tabCls(tab === "7d")}
          >
            7 Hari
          </button>
        </div>

        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-charcoal/50">
            Belum ada data populer untuk rentang ini.
          </p>
        ) : (
          <div>
            {list.map((article, i) => (
              <MostReadRankRow key={article.slug} article={article} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
