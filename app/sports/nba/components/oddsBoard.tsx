"use client";

import { useEffect, useRef, useState } from "react";
import { useOddsSSE } from "@/lib/useOddsSSE";
import OddsCard from "./oddsCard";
import FilterSheet from "./filter";

interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
}

export interface NormalizedProp {
  line: number;
  siaOdds: { over: number; under: number };
  fdOdds: { over: number; under: number };
  siaOddsNoVig: { over: number; under: number };
  fdOddsNoVig: { over: number; under: number };
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
  team: string;
  propType: string;
  minGap: number;
  direction: "" | "over" | "under";
  minFdNoVig: number;
  sortBy: "" | "gap" | "fdNoVig";
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
            // If there is an SSE update, get the latest odds from db
            const res = await fetch(`/api/odds/latest/${id}`, { cache: "no-store" });
            const latestOdds = await res.json();
            return { id, latestOdds };
          } else {
            // We hit the cache if there are no new updates. This is good when renavigating to oddsboard over and over again
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

  const allProps: PropRow[] = [];
  fixtures.forEach((fixture: Fixture) => {
    // Grab the all odds entry that corresponds with this fixture_id
    const oddsRow = oddsMap[fixture.fixture_id];

    // Nested ternary
    const oddsData: NormalizedOdds | null = oddsRow
      ? // Check if the odds_data is a string
        typeof oddsRow.odds_data === "string"
        ? // If it is a string, we must parse it to JSON
          JSON.parse(oddsRow.odds_data)
        : // Otherwise, just set oddsRow to odds_data
          oddsRow.odds_data
      : // If not a string, null
        null;

    // Improve this later to return a message if needed
    // If there is no oddsData, do nothing for now
    if (!oddsData) return;

    // Push each prop to save it. We will pass it to the PropsTable to render the info in the UI.
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

  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === "undefined")
      return {
        team: "",
        propType: "",
        minGap: 0,
        direction: "",
        minFdNoVig: 0,
        sortBy: "",
        sortDir: "desc",
      };

    // Get all the filters that's been set so that when I go back to nba page, the user will still see the filtered cards
    const saved = sessionStorage.getItem("propscope-filters");
    return saved
      ? JSON.parse(saved)
      : {
          team: "",
          propType: "",
          minGap: 0,
          direction: "",
          minFdNoVig: 0,
          sortBy: "",
          sortDir: "desc",
        };
  });
  // Save to sessionStorage whenever filters change
  useEffect(() => {
    sessionStorage.setItem("propscope-filters", JSON.stringify(filters));
  }, [filters]);

  const filtered = allProps.filter((row) => {
    // Skip all rows that are not specified in the filter
    if (
      filters.team &&
      row.homeTeam !== filters.team &&
      row.awayTeam !== filters.team
    )
      return false;
    if (filters.propType && row.propType !== filters.propType) return false;

    // Calculate all necessary calculations
    const dir = filters.direction;
    const overGap =
      (row.prop.fdOddsNoVig.over - row.prop.siaOddsNoVig.over) * 100;
    const underGap =
      (row.prop.fdOddsNoVig.under - row.prop.siaOddsNoVig.under) * 100;
    const gap =
      dir === "over"
        ? overGap
        : dir === "under"
          ? underGap
          : Math.max(overGap, underGap);
    const noVig =
      dir === "over"
        ? row.prop.fdOddsNoVig.over * 100
        : dir === "under"
          ? row.prop.fdOddsNoVig.under * 100
          : 0;

    // Skip all rows that are not within the parameters set
    if (filters.minGap && gap < filters.minGap) return false;
    if (dir && filters.minFdNoVig && noVig < filters.minFdNoVig) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!filters.sortBy) return 0;

    const dir = filters.direction || "over";
    const isOver = dir === "over";

    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (filters.sortBy) {
      case "gap":
        aVal = isOver
          ? a.prop.fdOddsNoVig.over - a.prop.siaOddsNoVig.over
          : a.prop.fdOddsNoVig.under - a.prop.siaOddsNoVig.under;
        bVal = isOver
          ? b.prop.fdOddsNoVig.over - b.prop.siaOddsNoVig.over
          : b.prop.fdOddsNoVig.under - b.prop.siaOddsNoVig.under;
        break;
      case "fdNoVig":
        aVal = isOver ? a.prop.fdOddsNoVig.over : a.prop.fdOddsNoVig.under;
        bVal = isOver ? b.prop.fdOddsNoVig.over : b.prop.fdOddsNoVig.under;
        break;
    }

    if (aVal < bVal) return filters.sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Get all team names that are playing today
  const teams = [
    ...new Set(allProps.flatMap((row) => [row.homeTeam, row.awayTeam])),
  ];

  // get all prop types
  const propTypes = [...new Set(allProps.map((row) => row.propType))];

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
    // Since a new observer gets created whenever sorted.length changes, we must disconnect the current observer for it to not stack
    return () => observer.disconnect();
  }, [sorted.length]);

  // Revert the visible count to the initial amount whenever filter changes so that filters can be quick
  useEffect(() => {
    setVisibleCount(12);
  }, [filters]);

  return (
    <div className="sm:max-w-400 sm:mx-auto sm:px-4">
      {!hasFetched && fixtures.length > 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : allProps.length === 0 ? (
        <div className="py-12">
          <p className="text-center text-zinc-500 text-2xl mb-8 font-semibold">
            Props aren't available yet, they usually appear about an hour before tip-off.
          </p>
          {fixtures.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">
                Today's Schedule
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
      ) : (
        <>
          <FilterSheet
            filters={filters}
            onFilterChange={setFilters}
            teams={teams}
            propTypes={propTypes}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {sorted.slice(0, visibleCount).map((row) => (
              <OddsCard
                key={`${row.fixtureId}-${row.player}-${row.propType}`}
                row={row}
              />
            ))}
          </div>
          {visibleCount < sorted.length && (
            <div ref={loaderRef} className="h-10" />
          )}
        </>
      )}
    </div>
  );
}
