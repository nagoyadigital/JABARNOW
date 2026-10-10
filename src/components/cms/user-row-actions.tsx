"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { changeRole, setUserStatus } from "@/app/cms/users/actions";
import { ROLE_LABELS } from "@/lib/permissions";

const ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMINISTRATOR",
  "PEMIMPIN_REDAKSI",
  "EDITOR",
  "REPORTER",
  "CONTRIBUTOR",
  "ADS_MANAGER",
  "SEO_MANAGER",
];

export function UserRowActions({
  userId,
  role,
  status,
}: {
  userId: string;
  role: Role;
  status: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const onRole = (newRole: string) =>
    start(async () => {
      setMsg("");
      const res = await changeRole({ userId, role: newRole as never });
      if (res.ok) router.refresh();
      else setMsg(res.error ?? "Gagal");
    });

  const onStatus = () =>
    start(async () => {
      setMsg("");
      const res = await setUserStatus(
        userId,
        status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
      );
      if (res.ok) router.refresh();
      else setMsg(res.error ?? "Gagal");
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          defaultValue={role}
          disabled={pending}
          onChange={(e) => onRole(e.target.value)}
          className="rounded-md border border-line bg-base px-2 py-1 text-xs"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={onStatus}
          className="rounded-md border border-line px-2 py-1 text-xs hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {status === "ACTIVE" ? "Suspend" : "Aktifkan"}
        </button>
      </div>
      {msg && <span className="text-xs text-breaking">{msg}</span>}
    </div>
  );
}
