"use client";

import { useEffect, useState } from "react";
import { useOddsSSE } from "@/lib/useOddsSSE";
import { getLatestOdds } from "@/lib/queries/odds";
import PropsTable from "./propsTable";

interface Fixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  start_date: string;
  status: string;
}

interface NormalizedProp {
  line: number;
  siaOdds: { over: number; under: number };
  fdOdds: { over: number; under: number };
  siaOddsNoVig: { over: number; under: number };
  fdOddsNoVig: { over: number; under: number };
}

interface NormalizedOdds {
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
  const updatedFixtureId = useOddsSSE();
  const [oddsMap, setOddsMap] = useState<Record<number, any>>({});

  useEffect(() => {
    fixtures.forEach(async (fixture) => {
      const odds = await getLatestOdds(fixture.fixture_id);
      if (odds) {
        setOddsMap((prev) => ({ ...prev, [fixture.fixture_id]: odds }));
      }
    });
  }, [fixtures]);

  useEffect(() => {
    if (!updatedFixtureId) return;
    async function refetch() {
      const odds = await getLatestOdds(updatedFixtureId!);
      if (odds) {
        setOddsMap((prev) => ({ ...prev, [updatedFixtureId!]: odds }));
      }
    }
    refetch();
  }, [updatedFixtureId]);

  const allProps: PropRow[] = [];
  fixtures.forEach((fixture) => {
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

  return <PropsTable rows={allProps} />;
}