"use client";

import { useState, useRef } from "react";
import { Filters } from "./oddsBoard";
import { ChipButton } from "./ui";

// Shared across filter sidebar, cards, and the player props page
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
  betCount: number;
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
  bettedOnly: false,
};

// ─── Local UI primitives ───────────────────────────────────────────────────

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-2 block">
      {children}
    </span>
  );
}

function SliderFilter({
  label,
  value,
  displayValue,
  displayValueClass = "text-emerald-400",
  min,
  max,
  step,
  onChange,
  accentClass = "accent-emerald-500",
  hint,
}: {
  label: string;
  value: number;
  displayValue: string;
  displayValueClass?: string;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  accentClass?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-zinc-600 uppercase tracking-widest">
          {label}
        </span>
        <span className={`text-sm font-mono font-bold ${displayValueClass}`}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full ${accentClass} h-1`}
      />
      {hint && <p className="text-xs text-zinc-700 mt-3">{hint}</p>}
    </div>
  );
}

function PercentInput({
  label,
  labelClass = "text-sm text-zinc-500 font-semibold",
  value,
  onChange,
  inputClass = "text-zinc-300 focus:border-emerald-500/30",
}: {
  label: string;
  labelClass?: string;
  value: number;
  onChange: (val: number) => void;
  inputClass?: string;
}) {
  return (
    <div className="flex-1">
      <span className={`${labelClass} block mb-1.5`}>{label}</span>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className={`w-full bg-zinc-900 border border-zinc-800/60 rounded-lg px-2.5 py-2 text-xs font-mono placeholder:text-zinc-700 focus:outline-none ${inputClass}`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">
          %
        </span>
      </div>
    </div>
  );
}

// ─── Filter sidebar ────────────────────────────────────────────────────────

export default function FilterSidebar({
  filters,
  onFilterChange,
  matchups,
  propTypes,
  betCount,
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

  // Count active filters so the mobile FAB badge shows how many are on
  const activeCount = [
    filters.matchup,
    filters.propTypes.length > 0,
    filters.direction,
    filters.minGap,
    filters.minSiaNoVig,
    filters.minFdNoVig,
    filters.minLineDiff,
    filters.bettedOnly,
  ].filter(Boolean).length;

  const filterContent = (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => update({ bettedOnly: !filters.bettedOnly })}
        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-150 ${
          filters.bettedOnly
            ? "bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-400"
            : "bg-zinc-900 border border-zinc-800/60 text-zinc-500 hover:text-zinc-400"
        }`}
      >
        <span>My Bets</span>
        {betCount > 0 && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              filters.bettedOnly
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {betCount}
          </span>
        )}
      </button>

      <div>
        <FilterLabel>Lines</FilterLabel>
        <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800/60">
          {(["same", "different"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ lineMode: m, minLineDiff: 0 })}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
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

      {/* Min line diff — only relevant in "different" mode */}
      {!isSame && (
        <SliderFilter
          label="Line Diff ≥"
          value={filters.minLineDiff}
          displayValue={filters.minLineDiff > 0 ? filters.minLineDiff.toFixed(1) : "Any"}
          displayValueClass="text-amber-400"
          min={0}
          max={5}
          step={0.5}
          onChange={(v) => update({ minLineDiff: v })}
          accentClass="accent-amber-500"
          hint="SIA line - FD line"
        />
      )}

      <div ref={matchupRef} className="relative">
        <FilterLabel>Matchup</FilterLabel>
        <button
          onClick={() => setMatchupOpen(!matchupOpen)}
          className="w-full flex justify-between items-center gap-2 bg-zinc-900 border border-zinc-800/60 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 hover:text-zinc-200 transition-colors"
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
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
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
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
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

      <div>
        <FilterLabel>Props</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          <ChipButton
            active={filters.propTypes.length === 0}
            onClick={() => update({ propTypes: [] })}
          >
            All
          </ChipButton>
          {propTypes.map((p) => (
            <ChipButton
              key={p}
              active={filters.propTypes.includes(p)}
              onClick={() => toggleProp(p)}
            >
              {PROP_LABELS[p] ?? p}
            </ChipButton>
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Direction</FilterLabel>
        <div className="flex gap-1.5">
          {[
            { key: "" as const, label: "Both" },
            { key: "over" as const, label: "Over" },
            { key: "under" as const, label: "Under" },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => update({ direction: d.key })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-150 ${
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

      <SliderFilter
        label="Min Gap"
        value={filters.minGap}
        displayValue={filters.minGap > 0 ? `${filters.minGap.toFixed(1)}%` : "Any"}
        min={0}
        max={10}
        step={0.5}
        onChange={(v) => update({ minGap: v })}
        hint={isSame ? "FD no-vig − SIA no-vig" : "Fair value − SIA no-vig"}
      />

      {/* SIA and FD/Fair thresholds — only when a direction is selected */}
      {filters.direction && (
        <div className="flex gap-2">
          <PercentInput
            label="SIA ≥"
            value={filters.minSiaNoVig}
            onChange={(v) => update({ minSiaNoVig: v })}
          />
          <PercentInput
            label={isSame ? "FD ≥" : "Fair ≥"}
            labelClass="text-[10px] text-zinc-500 font-semibold"
            value={filters.minFdNoVig}
            onChange={(v) => update({ minFdNoVig: v })}
            inputClass="text-blue-400 focus:border-blue-500/30"
          />
        </div>
      )}

      <div className="h-px bg-zinc-800/60" />

      <div>
        <FilterLabel>Sort By</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "gap" as const, label: "Gap" },
            { key: "fdNoVig" as const, label: isSame ? "FD %" : "Fair %" },
            { key: "siaNoVig" as const, label: "SIA %" },
          ].map((s) => (
            <ChipButton
              key={s.key}
              active={filters.sortBy === s.key}
              onClick={() => handleSort(s.key)}
              className="flex items-center gap-1"
            >
              {s.label}
              {filters.sortBy === s.key && (
                <span className="text-[10px]">
                  {filters.sortDir === "desc" ? "↓" : "↑"}
                </span>
              )}
            </ChipButton>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <div className="hidden lg:block w-65 shrink-0 h-full bg-zinc-900 border-r border-zinc-800/60">
        <div className="p-4 pt-4 overflow-y-auto h-full pb-8">
          {filterContent}
        </div>
      </div>

      {/* Mobile: floating filter button (bottom-right) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-12 h-12 flex items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-800/90 backdrop-blur-md shadow-lg shadow-black/40 text-zinc-400 hover:text-emerald-400 transition-colors"
      >
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

      {/* Mobile: slide-in drawer from the left */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-zinc-900 border-r border-zinc-800/60 overflow-y-auto transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-800/60 mb-2">
            <span className="text-sm font-bold text-zinc-100">Filters</span>
            <button
              onClick={() => onFilterChange(DEFAULT_FILTERS)}
              className="text-[11px] font-semibold text-zinc-500 hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="p-4 pt-2 pb-8">{filterContent}</div>
        </div>
      </div>
    </>
  );
}
