"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { href: "/sports/nba", label: "NBA" },
  // { href: "/nfl", label: "NFL" },
  // { href: "/nhl", label: "NHL" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="top-0 z-50 border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-md">
      <div className="max-w-400 mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-100 font-bold text-sm tracking-tight hover:text-white transition-colors"
        >
          <img src="/propscope.svg" alt="PropScope" className="h-10" />
        </Link>

        {/* Hamburger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            {/* Animated lines */}
            <div className="w-4.5 h-3.5 relative flex flex-col justify-between">
              <span
                className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center ${
                  isOpen ? "translate-y-[6.25px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 ${
                  isOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center ${
                  isOpen ? "-translate-y-[6.25px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute right-0 mt-2.5 w-52 rounded-xl border border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all duration-200 origin-top-right ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            }`}
          >
            <div className="p-2">
              {/* Sports section */}
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Sports
              </p>
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-zinc-100 bg-zinc-700/40"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
