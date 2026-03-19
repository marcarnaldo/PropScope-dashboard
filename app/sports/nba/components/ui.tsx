"use client";

import React from "react";

// Chip (active/inactive toggle style)
export function chipClass(active: boolean): string {
  return `px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 ${
    active
      ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
      : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
  }`;
}

export function ChipButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[chipClass(active), className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

// Same look as ChipButton but renders as an <a> tag (e.g. prop tabs on player page)
export function ChipLink({
  active,
  href,
  children,
  className,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={[chipClass(active), className].filter(Boolean).join(" ")}
    >
      {children}
    </a>
  );
}

// PropTypeBadge 
export function PropTypeBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "shrink-0 border border-zinc-700/50 rounded-xl bg-zinc-800/40 text-center",
        className ?? "px-4 py-2.5 min-w-14",
      ].join(" ")}
    >
      <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider leading-none">
        {label}
      </p>
    </div>
  );
}
