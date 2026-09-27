"use client";

import { ReactNode } from "react";

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileNav({ open, onClose, children }: MobileNavProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl">
        {children}
      </aside>
    </div>
  );
}