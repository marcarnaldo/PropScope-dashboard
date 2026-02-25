import { useState } from "react";
import { Filters } from "./oddsBoard";
import { PROP_LABELS } from "./oddsCard";

interface FilterSheetProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  teams: string[];
  propTypes: string[];
}

export default function FilterSheet({
  filters,
  onFilterChange,
  teams,
  propTypes,
}: FilterSheetProps) {
  // useState to detect if the filter section is open
  const [isOpen, setIsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  // Count active filters
  const activeCount = [
    filters.team,
    filters.propType,
    filters.direction,
    filters.minGap,
    filters.minFdNoVig,
  ].filter(Boolean).length;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-[#13151b] border border-zinc-800/70 rounded-xl mb-4"
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

      {/* Overlay + Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Panel */}
          <div
            className="relative w-full max-w-lg mx-auto bg-[#111318] border-t border-zinc-800/60 rounded-t-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle — clickable to close */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-9 h-1 rounded-full bg-zinc-700" />
            </div>

            <div className="px-5 pb-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-bold text-zinc-100">
                  Filters
                </span>
                <button
                  onClick={() =>
                    onFilterChange({
                      team: "",
                      propType: "",
                      minGap: 0,
                      direction: "",
                      minFdNoVig: 0,
                      sortBy: "",
                      sortDir: "desc",
                    })
                  }
                  className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Reset all
                </button>
              </div>

              {/* Team */}
              <div className="mb-5 relative z-10">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Team
                </label>
                <button
                  onClick={() => setTeamOpen(!teamOpen)}
                  className="w-full flex justify-between items-center bg-white/3 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-300"
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
                  <div className="absolute z-10 mt-1 w-full bg-[#1a1d25] border border-zinc-800 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        onFilterChange({ ...filters, team: "" });
                        setTeamOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
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
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
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

              {/* Prop Type */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Prop Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onFilterChange({ ...filters, propType: "" })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
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
                      onClick={() =>
                        onFilterChange({ ...filters, propType: p })
                      }
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
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

              {/* Direction */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Direction
                </label>
                <div className="flex gap-1.5">
                  {(["", "over", "under"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        onFilterChange({ ...filters, direction: d })
                      }
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
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

              {/* Min Gap */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Minimum Gap %
                </label>
                <div className="flex items-center gap-3">
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
                    className="flex-1 accent-emerald-500 h-1"
                  />
                  <span className="text-sm font-bold text-emerald-400 tabular-nums w-12 text-right font-mono">
                    {filters.minGap.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Min FD No-Vig % — only when direction is set */}
              {filters.direction && (
                <div className="mb-5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Min FD No-Vig{" "}
                    {filters.direction === "over" ? "Over" : "Under"} %
                  </label>
                  <input
                    type="number"
                    value={filters.minFdNoVig || ""}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        minFdNoVig: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g. 52"
                    className="w-full bg-white/3 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-300 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
              )}
              {/* Sort */}
              <div className="mb-5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Sort By
                </label>
                <div className="flex gap-1.5 mb-2">
                  {(["", "gap", "fdNoVig"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onFilterChange({ ...filters, sortBy: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        filters.sortBy === s
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                          : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {s === ""
                        ? "None"
                        : s === "gap"
                          ? "Gap"
                          : s === "fdNoVig"
                            ? "FD %"
                            : "Player"}
                    </button>
                  ))}
                </div>
                {filters.sortBy && (
                  <div className="flex gap-1.5">
                    {(["desc", "asc"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          onFilterChange({ ...filters, sortDir: d })
                        }
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          filters.sortDir === d
                            ? "bg-zinc-700/50 ring-1 ring-zinc-600/30 text-zinc-200"
                            : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {d === "desc" ? "↓ Highest First" : "↑ Lowest First"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white mt-2"
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
    </>
  );
}
