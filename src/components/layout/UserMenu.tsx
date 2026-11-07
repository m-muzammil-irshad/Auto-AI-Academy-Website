"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";

export interface UserMenuProps {
  profileHref: string;
}

export function UserMenu({ profileHref }: UserMenuProps) {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) return null;

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center rounded-full p-1 neu-btn transition-transform hover:scale-105 active:scale-95"
      >
        <Avatar name={profile.name} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="neu-flat-lg absolute right-0 z-40 mt-3 w-64 rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {profile.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
          </div>
          <hr className="my-1 border-black/5 dark:border-white/5" />
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Settings & Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}