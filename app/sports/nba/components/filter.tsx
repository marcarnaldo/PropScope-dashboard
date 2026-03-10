"use client";

import { useState, useRef, useEffect } from "react";
import { Filters } from "./oddsBoard";

export const PROP_LABELS: Record<string, string> = {
  points: "PTS",
  rebounds: "REB",
  assists: "AST",
  threes: "3PTS",
  points_rebounds_assists: "P+R+A",
  points_assists: "P+A",
  points_rebounds: "P+R",
  rebounds_assists: "R+A",
};

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  matchups: string[];
  propTypes: string[];
}

export const DEFAULT_FILTERS: Filters = {
  lineMode: "same",
  matchup: "",
  propTypes: [],
  direction: "",
  minGap: 0,
  minSiaNoVig: 0,
  minFdNoVig: 0,
  minLineDiff: 0,
  sortBy: "",
  sortDir: "desc",
};

export default function FilterSidebar({
  filters,
  onFilterChange,
  matchups,
  propTypes,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [matchupOpen, setMatchupOpen] = useState(false);
  const matchupRef = useRef<HTMLDivElement>(null);

  const isSame = filters.lineMode === "same";

  function update(partial: Partial<Filters>) {
    onFilterChange({ ...filters, ...partial });
  }

  function toggleProp(key: string) {
    const current = filters.propTypes;
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    update({ propTypes: next });
  }

  function handleSort(key: "" | "gap" | "fdNoVig" | "siaNoVig") {
    if (filters.sortBy === key && key !== "") {
      update({ sortDir: filters.sortDir === "desc" ? "asc" : "desc" });
    } else {
      update({ sortBy: key, sortDir: "desc" });
    }
  }

  const activeCount = [
    filters.matchup,
    filters.propTypes.length > 0,
    filters.direction,
    filters.minGap,
    filters.minSiaNoVig,
    filters.minFdNoVig,
    filters.minLineDiff,
  ].filter(Boolean).length;

  /* ─── Shared filter content ─── */
  const filterContent = (
    <div className="flex flex-col gap-5">
      {/* Line Mode Toggle */}
      <div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
          Lines
        </span>
        <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800/60">
          {(["same", "different"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ lineMode: m, minLineDiff: 0 })}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 ${
                filters.lineMode === m
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {m === "same" ? "Same" : "Different"}
            </button>
          ))}
        </div>
      </div>

      {/* Min Line Diff — only in Different mode */}
      {!isSame && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Line Diff ≥
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {filters.minLineDiff > 0 ? filters.minLineDiff.toFixed(1) : "Any"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minLineDiff}
            onChange={(e) =>
              update({ minLineDiff: parseFloat(e.target.value) })
            }
            className="w-full accent-amber-500 h-1"
          />
          <p className="text-[9px] text-zinc-700 mt-1">SIA line - FD line</p>
        </div>
      )}

      {/* Matchup */}
      <div ref={matchupRef} className="relative">
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
          Matchup
        </span>
        <button
          onClick={() => setMatchupOpen(!matchupOpen)}
          className="w-full flex justify-between items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-zinc-200 transition-colors"
        >
          <span className="truncate">{filters.matchup || "All Matchups"}</span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`text-zinc-500 transition-transform duration-200 ${matchupOpen ? "rotate-180" : ""}`}
          >
            <path d="M1 1L5 5L9 1" />
          </svg>
        </button>
        {matchupOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#111318] border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                update({ matchup: "" });
                setMatchupOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                filters.matchup === ""
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 hover:bg-white/3"
              }`}
            >
              All Matchups
            </button>
            {matchups.map((m) => (
              <button
                key={m}
                onClick={() => {
                  update({ matchup: m });
                  setMatchupOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  filters.matchup === m
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-zinc-400 hover:bg-white/3"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prop Type — multi-select */}
      <div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
          Props
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => update({ propTypes: [] })}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
              filters.propTypes.length === 0
                ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
                : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
            }`}
          >
            All
          </button>
          {propTypes.map((p) => {
            const active = filters.propTypes.includes(p);
            return (
              <button
                key={p}
                onClick={() => toggleProp(p)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                  active
                    ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
                    : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
                }`}
              >
                {PROP_LABELS[p] ?? p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Direction */}
      <div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
          Direction
        </span>
        <div className="flex gap-1.5">
          {[
            { key: "" as const, label: "Both" },
            { key: "over" as const, label: "Over" },
            { key: "under" as const, label: "Under" },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => update({ direction: d.key })}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                filters.direction === d.key
                  ? d.key === "over"
                    ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
                    : d.key === "under"
                      ? "bg-red-500/10 ring-1 ring-red-500/30 text-red-400"
                      : "bg-zinc-700/40 ring-1 ring-zinc-600/30 text-zinc-200"
                  : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-800/60" />

      {/* Min Gap */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Min Gap
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {filters.minGap > 0 ? `${filters.minGap.toFixed(1)}%` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={filters.minGap}
          onChange={(e) => update({ minGap: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500 h-1"
        />
        <p className="text-[9px] text-zinc-700 mt-1">
          {isSame ? "FD no-vig − SIA no-vig" : "Fair value − SIA no-vig"}
        </p>
      </div>

      {/* SIA + FD/Fair thresholds — only when direction is set */}
      {filters.direction && (
        <div className="flex gap-2">
          <div className="flex-1">
            <span className="text-[10px] text-zinc-500 font-semibold block mb-1.5">
              SIA ≥
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={filters.minSiaNoVig || ""}
                onChange={(e) =>
                  update({ minSiaNoVig: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-800/60 rounded-lg px-2.5 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
                %
              </span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-zinc-500 font-semibold block mb-1.5">
              {isSame ? "FD ≥" : "Fair ≥"}
            </span>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={filters.minFdNoVig || ""}
                onChange={(e) =>
                  update({ minFdNoVig: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-800/60 rounded-lg px-2.5 py-2 text-xs font-mono text-blue-400 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
                %
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-zinc-800/60" />

      {/* Sort */}
      <div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
          Sort By
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "gap" as const, label: "Gap" },
            { key: "fdNoVig" as const, label: isSame ? "FD %" : "Fair %" },
            { key: "siaNoVig" as const, label: "SIA %" },
          ].map((s) => {
            const active = filters.sortBy === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleSort(s.key)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all duration-150 ${
                  active
                    ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
                    : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
                }`}
              >
                {s.label}
                {active && (
                  <span className="text-[10px]">
                    {filters.sortDir === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop: always-visible sidebar (lg+) ─── */}
      <div className="hidden lg:block w-65 shrink-0 h-full bg-zinc-900 border-r border-zinc-800/60">
        <div className="p-4 pt-4 overflow-y-auto h-full pb-8">
          {filterContent}
        </div>
      </div>

      {/* ─── Mobile: floating funnel FAB (bottom-right) ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 flex items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-800/90 backdrop-blur-md shadow-lg shadow-black/40 text-zinc-400 hover:text-emerald-400 transition-colors"
      >
        {/* Funnel icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* ─── Mobile: left drawer overlay ─── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-zinc-900 border-r border-zinc-800/60 overflow-y-auto transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-800/60 mb-2">
            <span className="text-sm font-bold text-zinc-100">Filters</span>
            <button
              onClick={() => onFilterChange(DEFAULT_FILTERS)}
              className="text-[11px] font-semibold text-zinc-500 hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Filter content */}
          <div className="p-4 pt-2 pb-8">{filterContent}</div>
        </div>
      </div>
    </>
  );
}
