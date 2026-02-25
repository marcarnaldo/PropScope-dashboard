"use client";

import { useRef, useState, useEffect } from "react";

interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
}

export default function GameStrip({ fixtures }: { fixtures: Fixture[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [fixtures]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const remaining =
      direction === "left"
        ? el.scrollLeft
        : el.scrollWidth - el.clientWidth - el.scrollLeft;
    const distance = Math.min(300, remaining);
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full mx-auto relative flex items-center mb-6">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
          canScrollLeft
            ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400"
            : "text-zinc-800 cursor-default"
        }`}
        disabled={!canScrollLeft}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 4l-4 4 4 4" />
        </svg>
      </button>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto flex-1"
        style={{ scrollbarWidth: "none" }}
      >
        {fixtures.map((game) => {
          const time = new Date(game.start_date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div
              key={game.fixture_id}
              className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border border-zinc-800/60 bg-zinc-800/20 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-zinc-300 whitespace-nowrap">
                {game.away_team} <span className="text-zinc-600">@</span>{" "}
                {game.home_team}
              </span>
              <span className="text-[10px] text-zinc-600">{time}</span>
            </div>
          );
        })}
        <div className="shrink-0 w-1" />
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
          canScrollRight
            ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400"
            : "text-zinc-800 cursor-default"
        }`}
        disabled={!canScrollRight}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}
