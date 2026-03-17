"use client";

import { useEffect, useRef, useState } from "react";
import { useOddsSSE } from "@/lib/useOddsSSE";
import OddsCard from "./oddsCard";
import FilterSidebar, { DEFAULT_FILTERS } from "./filter";

interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
}

export interface NormalizedProp {
  fdLine: number;
  siaLine: number;
  siaOdds: { over: number; under: number };
  fdOdds: { over: number; under: number };
  siaOddsNoVig: { over: number; under: number };
  fdOddsNoVig: { over: number; under: number };
  edge?: {
    fairProbOver: number;
    fairProbUnder: number;
    method: string;
  };
}

export interface NormalizedOdds {
  homeTeam: string;
  awayTeam: string;
  props: Record<string, Record<string, NormalizedProp>>;
}

export interface PropRow {
  player: string;
  propType: string;
  prop: NormalizedProp;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  fixtureId: number;
}

export interface Filters {
  lineMode: "same" | "different";
  matchup: string;
  propTypes: string[];
  direction: "" | "over" | "under";
  minGap: number;
  minSiaNoVig: number;
  minFdNoVig: number; // In "different" mode this acts as min fair value
  minLineDiff: number;
  sortBy: "" | "gap" | "fdNoVig" | "siaNoVig";
  sortDir: "asc" | "desc";
  bettedOnly: boolean;
}

export default function NbaOddsSpace({ fixtures }: { fixtures: Fixture[] }) {
  const updatedFixtureIds = useOddsSSE();
  const [oddsMap, setOddsMap] = useState<Record<number, any>>({});
  const [hasFetched, setHasFetched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ─── Bet tracking (localStorage) ───
  const [bets, setBets] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = JSON.parse(localStorage.getItem("propscope-bets") || "[]");
      const validIds = new Set(fixtures.map((f) => String(f.fixture_id)));
      const filtered = (saved as string[]).filter((key) =>
        validIds.has(key.split("-")[0]),
      );
      return new Set(filtered);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const validIds = new Set(fixtures.map((f) => String(f.fixture_id)));
    const currentBets = [...bets].filter((key) =>
      validIds.has(key.split("-")[0]),
    );
    localStorage.setItem("propscope-bets", JSON.stringify(currentBets));
  }, [bets, fixtures]);

  function toggleBet(key: string) {
    setBets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    const isSSEUpdate = updatedFixtureIds.length > 0;
    const idsToFetch =
      updatedFixtureIds.length > 0
        ? updatedFixtureIds
        : fixtures.map((f) => f.fixture_id);

    if (idsToFetch.length === 0) return;

    async function fetchOdds() {
      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          if (isSSEUpdate) {
            const res = await fetch(`/api/odds/latest/${id}`, {
              cache: "no-store",
            });
            const latestOdds = await res.json();
            return { id, latestOdds };
          } else {
            const res = await fetch(`/api/odds/history/${id}`);
            const odds = await res.json();
            const latestOdds = odds?.[odds.length - 1] ?? null;
            return { id, latestOdds };
          }
        }),
      );

      setOddsMap((prev) => {
        const next = { ...prev };
        for (const { id, latestOdds } of results) {
          if (latestOdds) next[id] = latestOdds;
        }
        return next;
      });
      setHasFetched(true);
      const latestTime = results
        .map((r) => r.latestOdds?.snapshot_time)
        .filter(Boolean)
        .sort()
        .at(-1);
      if (latestTime) setLastUpdated(new Date(latestTime));
    }

    fetchOdds();
  }, [fixtures, updatedFixtureIds]);

  // Build allProps from fixtures + odds
  const allProps: PropRow[] = [];
  fixtures.forEach((fixture: Fixture) => {
    const oddsRow = oddsMap[fixture.fixture_id];

    const oddsData: NormalizedOdds | null = oddsRow
      ? typeof oddsRow.odds_data === "string"
        ? JSON.parse(oddsRow.odds_data)
        : oddsRow.odds_data
      : null;

    if (!oddsData) return;

    for (const [player, props] of Object.entries(oddsData.props ?? {})) {
      for (const [propType, prop] of Object.entries(props ?? {})) {
        allProps.push({
          player,
          propType,
          prop,
          homeTeam: fixture.home_team,
          awayTeam: fixture.away_team,
          startDate: fixture.start_date,
          fixtureId: fixture.fixture_id,
        });
      }
    }
  });

  // Filters state with sessionStorage persistence
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined") return DEFAULT_FILTERS;

    const saved = sessionStorage.getItem("propscope-filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all new fields exist (handles old cached filters)
        return { ...DEFAULT_FILTERS, ...parsed };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    sessionStorage.setItem("propscope-filters", JSON.stringify(filters));
  }, [filters]);

  // Build matchup strings from fixtures: "Away @ Home"
  const matchups = [
    ...new Set(fixtures.map((f) => `${f.away_team} @ ${f.home_team}`)),
  ];

  // Get all prop types
  const propTypes = [...new Set(allProps.map((row) => row.propType))];

  // ─── Filtering ───
  const filtered = allProps.filter((row) => {
    // Betted only filter
    if (filters.bettedOnly) {
      const betKey = `${row.fixtureId}-${row.player}-${row.propType}`;
      if (!bets.has(betKey)) return false;
    }

    const hasDifferentLines = row.prop.siaLine !== row.prop.fdLine;

    // Line mode filter: same = only same lines, different = only different lines
    if (filters.lineMode === "same" && hasDifferentLines) return false;
    if (filters.lineMode === "different" && !hasDifferentLines) return false;

    // Min line diff (only relevant in different mode)
    if (filters.lineMode === "different" && filters.minLineDiff > 0) {
      const lineDiff = Math.abs(row.prop.siaLine - row.prop.fdLine);
      if (lineDiff < filters.minLineDiff) return false;
    }

    // Matchup filter
    if (filters.matchup) {
      const rowMatchup = `${row.awayTeam} @ ${row.homeTeam}`;
      if (rowMatchup !== filters.matchup) return false;
    }

    // Prop type filter (multi-select)
    if (
      filters.propTypes.length > 0 &&
      !filters.propTypes.includes(row.propType)
    ) {
      return false;
    }

    // Calculate gap using fair values
    // Same lines: fair = FD no-vig
    // Different lines: fair = edge fair probs
    const dir = filters.direction;
    const fairOver = row.prop.edge
      ? row.prop.edge.fairProbOver
      : row.prop.fdOddsNoVig.over;
    const fairUnder = row.prop.edge
      ? row.prop.edge.fairProbUnder
      : row.prop.fdOddsNoVig.under;
    const overGap = (fairOver - row.prop.siaOddsNoVig.over) * 100;
    const underGap = (fairUnder - row.prop.siaOddsNoVig.under) * 100;
    const gap =
      dir === "over"
        ? overGap
        : dir === "under"
          ? underGap
          : Math.max(overGap, underGap);

    if (filters.minGap && gap < filters.minGap) return false;

    // Direction-dependent thresholds
    if (dir) {
      // SIA no-vig threshold
      const siaNoVig =
        dir === "over"
          ? row.prop.siaOddsNoVig.over * 100
          : row.prop.siaOddsNoVig.under * 100;
      if (filters.minSiaNoVig && siaNoVig < filters.minSiaNoVig) return false;

      // FD no-vig / Fair value threshold
      // In same mode: FD no-vig. In different mode: fair value.
      const fdOrFair =
        dir === "over"
          ? (filters.lineMode === "different"
              ? fairOver
              : row.prop.fdOddsNoVig.over) * 100
          : (filters.lineMode === "different"
              ? fairUnder
              : row.prop.fdOddsNoVig.under) * 100;
      if (filters.minFdNoVig && fdOrFair < filters.minFdNoVig) return false;
    }

    return true;
  });

  // ─── Sorting ───
  const sorted = [...filtered].sort((a, b) => {
    if (!filters.sortBy) return 0;

    const dir = filters.direction || "over";
    const isOver = dir === "over";

    let aVal = 0;
    let bVal = 0;

    switch (filters.sortBy) {
      case "gap": {
        const aFairOver = a.prop.edge
          ? a.prop.edge.fairProbOver
          : a.prop.fdOddsNoVig.over;
        const aFairUnder = a.prop.edge
          ? a.prop.edge.fairProbUnder
          : a.prop.fdOddsNoVig.under;
        const bFairOver = b.prop.edge
          ? b.prop.edge.fairProbOver
          : b.prop.fdOddsNoVig.over;
        const bFairUnder = b.prop.edge
          ? b.prop.edge.fairProbUnder
          : b.prop.fdOddsNoVig.under;
        aVal = isOver
          ? aFairOver - a.prop.siaOddsNoVig.over
          : aFairUnder - a.prop.siaOddsNoVig.under;
        bVal = isOver
          ? bFairOver - b.prop.siaOddsNoVig.over
          : bFairUnder - b.prop.siaOddsNoVig.under;
        break;
      }
      case "fdNoVig": {
        // In different mode, sort by fair value instead of raw FD no-vig
        if (filters.lineMode === "different") {
          const aFair = isOver
            ? a.prop.edge
              ? a.prop.edge.fairProbOver
              : a.prop.fdOddsNoVig.over
            : a.prop.edge
              ? a.prop.edge.fairProbUnder
              : a.prop.fdOddsNoVig.under;
          const bFair = isOver
            ? b.prop.edge
              ? b.prop.edge.fairProbOver
              : b.prop.fdOddsNoVig.over
            : b.prop.edge
              ? b.prop.edge.fairProbUnder
              : b.prop.fdOddsNoVig.under;
          aVal = aFair;
          bVal = bFair;
        } else {
          aVal = isOver ? a.prop.fdOddsNoVig.over : a.prop.fdOddsNoVig.under;
          bVal = isOver ? b.prop.fdOddsNoVig.over : b.prop.fdOddsNoVig.under;
        }
        break;
      }
      case "siaNoVig":
        aVal = isOver ? a.prop.siaOddsNoVig.over : a.prop.siaOddsNoVig.under;
        bVal = isOver ? b.prop.siaOddsNoVig.over : b.prop.siaOddsNoVig.under;
        break;
    }

    if (aVal < bVal) return filters.sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, sorted.length));
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sorted.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [filters]);

  // ─── Loading / empty states (no sidebar needed) ───
  if (!hasFetched && fixtures.length > 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (allProps.length === 0) {
    if (fixtures.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="relative mb-6">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-20"
              style={{
                background: "radial-gradient(circle, #10b981, transparent)",
              }}
            />
            <div className="relative w-16 h-16 rounded-2xl border border-zinc-700/50 bg-zinc-800/60 flex items-center justify-center text-zinc-500">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <p className="text-zinc-200 font-semibold text-lg mb-2">
            No games scheduled
          </p>
          <p className="text-zinc-500 text-sm text-center max-w-xs leading-relaxed">
            No NBA games are on the slate right now. Check back on game day —
            props go live about an hour before tip-off.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center px-4 py-14 sm:py-20">
        {/* Header */}
        <div className="text-center mb-10 max-w-sm">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500/80 uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Waiting for odds
          </div>
          <p className="text-zinc-200 font-bold text-xl mb-1.5">
            Today&apos;s Games
          </p>
          <p className="text-zinc-500 text-sm">
            Props typically appear about an hour before tip-off
          </p>
        </div>

        {/* Schedule */}
        <div className="w-full max-w-md space-y-2">
          {fixtures.map((f) => {
            const date = new Date(f.start_date);
            return (
              <div
                key={f.fixture_id}
                className="relative rounded-xl border border-zinc-800/70 px-5 py-4 flex items-center justify-between gap-4 overflow-hidden"
                style={{ background: "rgba(19,21,27,0.6)" }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full bg-zinc-700" />

                {/* Matchup */}
                <div className="flex items-center gap-2.5 min-w-0 pl-1">
                  <span className="text-zinc-200 font-semibold text-sm truncate">
                    {f.away_team}
                  </span>
                  <span className="text-zinc-600 text-xs shrink-0">@</span>
                  <span className="text-zinc-200 font-semibold text-sm truncate">
                    {f.home_team}
                  </span>
                </div>

                {/* Date + time */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-zinc-300 tabular-nums leading-none">
                    {date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 tabular-nums">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Main layout: sidebar + cards ───
  return (
    <div className="max-w-400 mx-auto lg:flex lg:h-[calc(100vh-56px)] sm:px-2">
      {/* Desktop sidebar rendered here as flex sibling (lg+) */}
      {/* Mobile button + drawer also rendered here but positioned via fixed/flow */}
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        matchups={matchups}
        propTypes={propTypes}
        betCount={allProps.filter((row) =>
          bets.has(`${row.fixtureId}-${row.player}-${row.propType}`),
        ).length}
      />

      {/* Main content area */}
      <div className="flex-1 lg:overflow-y-auto p-2 lg:p-4">
        {filters.matchup && (
          <p className="text-xl sm:text-3xl font-bold text-zinc-400">
            {filters.matchup}
          </p>
        )}
        {lastUpdated && (
          <p className="text-sm sm:text-lg text-zinc-600">
            Last updated{" "}
            {lastUpdated.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 mt-5">
          {sorted.slice(0, visibleCount).map((row) => {
            const betKey = `${row.fixtureId}-${row.player}-${row.propType}`;
            return (
              <OddsCard
                key={betKey}
                row={row}
                isBetted={bets.has(betKey)}
                onToggleBet={() => toggleBet(betKey)}
              />
            );
          })}
        </div>
        {sorted.length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-12">
            No props match your current filters.
          </p>
        )}
        {visibleCount < sorted.length && (
          <div ref={loaderRef} className="h-10" />
        )}
      </div>
    </div>
  );
}
