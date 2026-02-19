"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/sports/nba", label: "NBA" },
  // { href: "/nfl", label: "NFL" },
  // { href: "/nhl", label: "NHL" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="top-0 z-50 border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-md">
      <div className="max-w-400 mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 text-zinc-100 font-bold text-sm tracking-tight hover:text-white transition-colors">
          <img src="/propscope.svg" alt="PropScope" className="h-35" />
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-700/50 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}