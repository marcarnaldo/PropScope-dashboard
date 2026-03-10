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
}

export default function NbaOddsSpace({ fixtures }: { fixtures: Fixture[] }) {
  const updatedFixtureIds = useOddsSSE();
  const [oddsMap, setOddsMap] = useState<Record<number, any>>({});
  const [hasFetched, setHasFetched] = useState(false);

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

    for (const [player, props] of Object.entries(oddsData.props)) {
      for (const [propType, prop] of Object.entries(props)) {
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
    return (
      <div className="py-12 sm:max-w-400 sm:mx-auto sm:px-4">
        <p className="text-center text-zinc-500 text-2xl mb-8 font-semibold">
          Props aren&apos;t available yet, they usually appear about an hour
          before tip-off.
        </p>
        {fixtures.length > 0 ? (
          <>
            <p className="text-sm font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">
              Today&apos;s Schedule
            </p>
            <div className="space-y-1.5">
              {fixtures.map((f) => (
                <div
                  key={f.fixture_id}
                  className="bg-[#13151b] border border-zinc-800/70 rounded-xl px-4 py-3.5 min-w-0 sm:flex sm:justify-between sm:items-center"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-300 font-medium truncate">
                      {f.away_team}
                    </span>
                    <span className="text-zinc-600 text-xs shrink-0">@</span>
                    <span className="text-zinc-300 font-medium truncate">
                      {f.home_team}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 sm:mt-0 sm:font-semibold sm:bg-zinc-800/50 sm:px-2.5 sm:py-1 sm:rounded-lg sm:shrink-0 sm:ml-3">
                    {new Date(f.start_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {new Date(f.start_date).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-zinc-600 text-sm text-center">
            No games available right now. Check back later.
          </p>
        )}
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
      />

      {/* Main content area */}
      <div className="flex-1 lg:overflow-y-auto p-2 lg:p-4">
        {filters.matchup && (
          <p className="text-xl sm:text-3xl font-bold text-zinc-400 mb-10">
            {filters.matchup}
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {sorted.slice(0, visibleCount).map((row) => (
            <OddsCard
              key={`${row.fixtureId}-${row.player}-${row.propType}`}
              row={row}
            />
          ))}
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
