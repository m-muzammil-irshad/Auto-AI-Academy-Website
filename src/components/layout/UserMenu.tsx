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
        className="flex items-center rounded-full p-0.5 hover:bg-slate-100"
      >
        <Avatar name={profile.name} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {profile.name}
            </p>
            <p className="truncate text-xs text-slate-500">{profile.email}</p>
          </div>
          <hr className="my-1 border-slate-100" />
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}