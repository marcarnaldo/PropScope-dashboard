"use client";

import { useState } from "react";
import { Filters } from "./oddsBoard";
import { PROP_LABELS } from "./oddsCard";

interface FilterSheetProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  teams: string[];
  propTypes: string[];
}

const DEFAULT_FILTERS: Filters = {
  team: "",
  propType: "",
  minGap: 0,
  direction: "",
  minFdNoVig: 0,
  sortBy: "",
  sortDir: "desc",
};

export default function FilterSheet({
  filters,
  onFilterChange,
  teams,
  propTypes,
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const activeCount = [
    filters.team,
    filters.propType,
    filters.direction,
    filters.minGap,
    filters.minFdNoVig,
  ].filter(Boolean).length;

  const filterControls = (
    <>
      {/* Team */}
      <div className="relative w-full sm:w-auto">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
          Team
        </label>
        <button
          onClick={() => setTeamOpen(!teamOpen)}
          className="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-2 bg-white/3 border border-zinc-800 rounded-xl sm:rounded-lg px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs font-semibold text-zinc-300 sm:text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          <span>{filters.team || "All Teams"}</span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-zinc-500"
          >
            <path d="M1 1L5 5L9 1" />
          </svg>
        </button>
        {teamOpen && (
          <div className="absolute z-20 mt-1 w-full sm:w-48 bg-[#111318] border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onFilterChange({ ...filters, team: "" });
                setTeamOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 sm:py-2 text-sm sm:text-xs transition-colors ${
                filters.team === ""
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 hover:bg-white/3"
              }`}
            >
              All Teams
            </button>
            {teams.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onFilterChange({ ...filters, team: t });
                  setTeamOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 sm:py-2 text-sm sm:text-xs transition-colors ${
                  filters.team === t
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-zinc-400 hover:bg-white/3"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider — desktop only */}
      <div className="hidden sm:block w-px h-6 bg-zinc-800" />
      <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-widest text-zinc-600 self-center">
        Prop Type:
      </span>
      {/* Prop Type */}
      <div className="w-full sm:w-auto">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
          Prop Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onFilterChange({ ...filters, propType: "" })}
            className={`px-3.5 sm:px-2.5 py-1.5 rounded-full sm:rounded-lg text-xs sm:text-[11px] font-semibold transition-colors ${
              filters.propType === ""
                ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All
          </button>
          {propTypes.map((p) => (
            <button
              key={p}
              onClick={() => onFilterChange({ ...filters, propType: p })}
              className={`px-3.5 sm:px-2.5 py-1.5 rounded-full sm:rounded-lg text-xs sm:text-[11px] font-semibold transition-colors capitalize ${
                filters.propType === p
                  ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                  : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {PROP_LABELS[p] ?? p}
            </button>
          ))}
        </div>
      </div>

      {/* Divider — desktop only */}
      <div className="hidden sm:block w-px h-6 bg-zinc-800" />
      <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-widest text-zinc-600 self-center">
        Direction:
      </span>
      {/* Direction */}
      <div className="w-full sm:w-auto">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
          Direction
        </label>
        <div className="flex gap-1.5">
          {(["", "over", "under"] as const).map((d) => (
            <button
              key={d}
              onClick={() => onFilterChange({ ...filters, direction: d })}
              className={`flex-1 sm:flex-none sm:px-2.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs sm:text-[11px] font-semibold transition-colors ${
                filters.direction === d
                  ? d === "over"
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                    : d === "under"
                      ? "bg-red-500/10 ring-1 ring-red-500/30 text-red-400"
                      : "bg-zinc-700/50 ring-1 ring-zinc-600/30 text-zinc-200"
                  : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {d === "" ? "Both" : d === "over" ? "Over" : "Under"}
            </button>
          ))}
        </div>
      </div>

      {/* Divider — desktop only */}
      <div className="hidden sm:block w-px h-6 bg-zinc-800" />

      {/* Min Gap */}
      <div className="w-full sm:w-auto">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
          Minimum Gap %
        </label>
        <div className="flex items-center gap-2 sm:gap-2">
          {/* Slider on mobile, number input on desktop */}
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.minGap}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minGap: parseFloat(e.target.value),
              })
            }
            className="flex-1 accent-emerald-500 h-1 sm:hidden"
          />
          <span className="hidden sm:inline text-[11px] text-zinc-500 whitespace-nowrap font-semibold uppercase">
            Gap ≥
          </span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.5"
            value={filters.minGap || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minGap: parseFloat(e.target.value) || 0,
              })
            }
            className="hidden sm:block w-14 bg-white/3 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono text-center focus:outline-none focus:border-emerald-500/30"
            placeholder="0"
          />
          <span className="text-sm sm:text-[11px] font-bold sm:font-normal text-emerald-400 sm:text-zinc-500 tabular-nums w-12 sm:w-auto text-right font-mono">
            <span className="sm:hidden">{filters.minGap.toFixed(1)}%</span>
            <span className="hidden sm:inline">%</span>
          </span>
        </div>
      </div>

      {/* Min FD No-Vig % — only when direction is set */}
      {filters.direction && (
        <>
          <div className="hidden sm:block w-px h-6 bg-zinc-800" />
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
              Min FD No-Vig {filters.direction === "over" ? "Over" : "Under"} %
            </label>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-zinc-500 whitespace-nowrap font-semibold uppercase">
                FD {filters.direction === "over" ? "Over" : "Under"} ≥
              </span>
              <input
                type="number"
                value={filters.minFdNoVig || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    minFdNoVig: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full sm:w-14 bg-white/3 border border-zinc-800 rounded-xl sm:rounded-lg px-3 sm:px-2 py-2.5 sm:py-1.5 text-sm sm:text-xs text-zinc-300 sm:text-blue-400 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 sm:text-center"
              />
              <span className="hidden sm:inline text-[11px] text-zinc-500 ">
                %
              </span>
            </div>
          </div>
        </>
      )}

      {/* Divider — desktop only */}
      <div className="hidden sm:block w-px h-6 bg-zinc-800" />

      {/* Sort */}
      <div className="w-full sm:w-auto">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 sm:hidden">
          Sort By
        </label>
        <div className="flex gap-1.5 sm:items-center">
          <span className="hidden sm:inline text-[11px] text-zinc-500 font-semibold uppercase">
            Sort:
          </span>
          {(["", "gap", "fdNoVig"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange({ ...filters, sortBy: s })}
              className={`flex-1 sm:flex-none py-2 sm:py-1.5 sm:px-2 rounded-xl sm:rounded-lg text-xs sm:text-[11px] font-semibold transition-colors ${
                filters.sortBy === s
                  ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                  : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "" ? "None" : s === "gap" ? "Gap" : "FD %"}
            </button>
          ))}
          {filters.sortBy && (
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  sortDir: filters.sortDir === "desc" ? "asc" : "desc",
                })
              }
              className="sm:flex-none py-2 sm:py-1.5 sm:px-2 rounded-xl sm:rounded-lg text-xs sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {filters.sortDir === "desc" ? "↓ Highest" : "↑ Lowest"}
            </button>
          )}
        </div>
      </div>

      {/* Reset — desktop only (mobile has its own in sheet header) */}
      <button
        onClick={() => onFilterChange(DEFAULT_FILTERS)}
        className="hidden sm:block ml-auto text-[11px] text-zinc-600 hover:text-red-400 transition-colors whitespace-nowrap font-semibold uppercase"
      >
        Reset
      </button>
    </>
  );

  return (
    <>
      {/* Mobile: trigger button + bottom sheet */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden w-full flex items-center gap-2.5 px-4 py-3 bg-[#13151b] border border-zinc-800/70 rounded-xl mb-4"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-zinc-500"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        <span className="text-sm font-semibold text-zinc-400">Filters</span>
        {activeCount > 0 && (
          <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[#111318] border-t border-zinc-800/60 rounded-t-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-center pt-3 pb-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-9 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-5 pb-6">
              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-bold text-zinc-100">
                  Filters
                </span>
                <button
                  onClick={() => onFilterChange(DEFAULT_FILTERS)}
                  className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Reset all
                </button>
              </div>
              <div className="flex flex-col gap-5">{filterControls}</div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white mt-5"
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                }}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: inline filter bar */}
      <div className="hidden sm:flex items-center gap-3 flex-wrap mb-4 p-3">
        {filterControls}
      </div>
    </>
  );
}
