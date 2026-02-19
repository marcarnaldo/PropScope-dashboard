"use client";

import { useEffect, useState } from "react";
import { useOddsSSE } from "@/lib/useOddsSSE";
import { getLatestOdds } from "@/lib/queries/odds";
import PropsTable from "./propsTable";
import { addSnapshot, getCachedOdds } from "@/lib/oddsCache";

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

export default function NbaOddsBoard({ fixtures }: { fixtures: Fixture[] }) {
  const updatedFixtureIds = useOddsSSE();
  const [oddsMap, setOddsMap] = useState<Record<number, any>>({});

  useEffect(() => {
    const idsToFetch =
      updatedFixtureIds.length > 0
        ? updatedFixtureIds
        : fixtures.map((f) => f.fixture_id);

    if (idsToFetch.length === 0) return;

    async function fetchOdds() {
      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          // Check if there are updateFixtureIds sent by SSE
          if (updatedFixtureIds.length > 0) {
            // If there is, we just add to the cache by getting the latest from db
            const latestOdds = await getLatestOdds(id);
            if (latestOdds) addSnapshot(id, latestOdds);
          }

          // When getting the odds, we always look in the cache
          const odds = await getCachedOdds(id);
          const latestOdds = odds?.[odds.length - 1] ?? null;
          return { id, latestOdds };
        }),
      );

      setOddsMap((prev) => {
        const next = { ...prev };
        for (const { id, latestOdds } of results) {
          if (latestOdds) next[id] = latestOdds;
        }
        return next;
      });
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

  // No props yet
  if (allProps.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-400 text-lg">Waiting for odds...</p>
        <p className="text-zinc-500 text-sm mt-1">
          Props will appear as games approach
        </p>
      </div>
    );
  }

  // Using the data in allProps, we pass it into PropsTable to render the info
  return <PropsTable rows={allProps} />;
}
