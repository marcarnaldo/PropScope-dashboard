import { getCachedOdds } from "@/lib/oddsCache";
import { getFixtureById } from "@/lib/queries/fixtures";
import OddsComparison from "../../../components/oddsComparison";
import { PROP_LABELS } from "../../../components/filter";
import Chart from "../../../components/chart";
export default async function PlayerPropsPage({
  params,
  searchParams,
}: {
  params: Promise<{ fixtureId: string; player: string }>;
  searchParams: Promise<{ prop?: string; line?: string }>;
}) {
  const { fixtureId, player } = await params;
  const { prop, line } = await searchParams;

  // Parse the id from string to int
  const fixtureIdNum = parseInt(fixtureId);

  // Get the player's name
  const decodedPlayer = decodeURIComponent(player);

  const fixture = await getFixtureById(fixtureIdNum);
  // Replace later
  if (!fixture) return <p className="text-zinc-400 p-8">Fixture not found</p>;

  const { home_team, away_team, start_date, status } = fixture;

  // Replace later
  if (!prop) return <p className="text-zinc-400 p-8">No prop type specified</p>;

  const oddsHistory = await getCachedOdds(fixtureIdNum);

  const latestSnapshot = oddsHistory?.[oddsHistory.length - 1] ?? null;

  const oddsData =
    typeof latestSnapshot?.odds_data === "string"
      ? JSON.parse(latestSnapshot.odds_data)
      : latestSnapshot?.odds_data;

  // Get all props and odds
  const allPlayerProps = oddsData?.props?.[decodedPlayer] ?? {};
  // Get all available prop names
  const availablePropsForThisPlayer = Object.keys(allPlayerProps);

  // Get the current odds for the selected player's prop
  const playerProp = oddsData?.props?.[decodedPlayer]?.[prop];

  // Build the chart data from oddsHistory
  const chartData = oddsHistory
    .map((snap) => {
      const od =
        typeof snap.odds_data === "string"
          ? JSON.parse(snap.odds_data)
          : snap.odds_data;
      const p = od?.props?.[decodedPlayer]?.[prop];
      if (!p) return null;
      return {
        time: new Date(snap.snapshot_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        siaOver: parseFloat((p.siaOddsNoVig.over * 100).toFixed(2)),
        siaUnder: parseFloat((p.siaOddsNoVig.under * 100).toFixed(2)),
        fdOver: parseFloat((p.fdOddsNoVig.over * 100).toFixed(2)),
        fdUnder: parseFloat((p.fdOddsNoVig.under * 100).toFixed(2)),
      };
    })
    .filter((d) => d !== null) as Record<string, string | number>[];

  // Build line movement data (actual line numbers over time)
  const lineMovementData = oddsHistory
    .map((snap) => {
      const od =
        typeof snap.odds_data === "string"
          ? JSON.parse(snap.odds_data)
          : snap.odds_data;
      const p = od?.props?.[decodedPlayer]?.[prop];
      if (!p) return null;
      return {
        time: new Date(snap.snapshot_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        siaLine: p.siaLine,
        fdLine: p.fdLine,
      };
    })
    .filter((d) => d !== null) as Record<string, string | number>[];

  // Build gap movement data (FD no-vig minus SIA no-vig over time)
  const gapMovementData = oddsHistory
    .map((snap) => {
      const od =
        typeof snap.odds_data === "string"
          ? JSON.parse(snap.odds_data)
          : snap.odds_data;
      const p = od?.props?.[decodedPlayer]?.[prop];
      if (!p) return null;
      return {
        time: new Date(snap.snapshot_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        overGap: parseFloat(
          ((p.fdOddsNoVig.over - p.siaOddsNoVig.over) * 100).toFixed(2),
        ),
        underGap: parseFloat(
          ((p.fdOddsNoVig.under - p.siaOddsNoVig.under) * 100).toFixed(2),
        ),
      };
    })
    .filter((d) => d !== null) as Record<string, string | number>[];

  const sameLine = playerProp.siaLine === playerProp.fdLine;

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 max-w-400 mx-auto px-4 py-2 md:px-2">
      <div>
        {/* Header */}
        <div className="pt-2 sm:p-5 mb-6">
          <div className="grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {decodedPlayer}
              </h1>
              <p className="text-sm sm:text-md text-zinc-500 mt-1">
                {away_team} <span className="text-zinc-600">@</span> {home_team}
              </p>
              <div className="flex items-center gap-2 text-sm sm:text-md text-zinc-500 mt-2">
                <span>
                  {new Date(start_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  {new Date(start_date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/40 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center">
              <p className="text-sm sm:text-md font-bold text-zinc-500 uppercase tracking-wider">
                {PROP_LABELS[prop] ?? prop}
              </p>
            </div>
          </div>
        </div>

        <div className="md:px-4">
          {/** Prop Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-6 pb-1">
            {availablePropsForThisPlayer.map((p) => (
              <a
                key={p}
                href={`/sports/nba/props/${fixtureId}/${encodeURIComponent(decodedPlayer)}?prop=${p}`}
                className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-sm sm:text-md font-semibold transition-colors capitalize ${
                  p === prop
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400"
                    : "bg-white/3 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {PROP_LABELS[p] ?? p}
              </a>
            ))}
          </div>

          <OddsComparison
            books={[
              {
                label: "SIA",
                line: playerProp.siaLine,
                noVigOver: playerProp.siaOddsNoVig.over,
                noVigUnder: playerProp.siaOddsNoVig.under,
                color: "#e4e4e7",
                dimmedColor: "#71717a",
              },
              {
                label: "FD",
                line: playerProp.fdLine,
                noVigOver: playerProp.fdOddsNoVig.over,
                noVigUnder: playerProp.fdOddsNoVig.under,
                color: "#60a5fa",
                dimmedColor: "rgb(59 130 246 / 0.5)",
                isSharp: true,
              },
            ]}
            edge={playerProp.edge}
          />
          {/* Odds Movement Charts */}
          {sameLine ? (
            <Chart
              data={chartData}
              books={[
                {
                  label: "SIA Over",
                  lineKey: "siaOver",
                  color: "#e4e4e7",
                  title: "Odds Movement",
                },
                { label: "SIA Under", lineKey: "siaUnder", color: "#a1a1aa" },
                { label: "FD Over", lineKey: "fdOver", color: "#60a5fa" },
                { label: "FD Under", lineKey: "fdUnder", color: "#3b82f6" },
              ]}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Chart
                data={chartData}
                books={[
                  {
                    label: "SIA Over",
                    lineKey: "siaOver",
                    color: "#e4e4e7",
                    title: "SIA Odds Movement",
                  },
                  { label: "SIA Under", lineKey: "siaUnder", color: "#a1a1aa" },
                ]}
              />
              <Chart
                data={chartData}
                books={[
                  {
                    label: "FD Over",
                    lineKey: "fdOver",
                    color: "#60a5fa",
                    title: "FD Odds Movement",
                  },
                  { label: "FD Under", lineKey: "fdUnder", color: "#3b82f6" },
                ]}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Chart
              data={lineMovementData}
              books={[
                {
                  label: "SIA",
                  lineKey: "siaLine",
                  color: "#e4e4e7",
                  title: "Line Movement",
                },
                { label: "FD", lineKey: "fdLine", color: "#60a5fa" },
              ]}
            />
            <Chart
              data={gapMovementData}
              books={[
                {
                  label: "Over Gap",
                  lineKey: "overGap",
                  color: "#34d399",
                  title: "Gap Movement",
                },
                { label: "Under Gap", lineKey: "underGap", color: "#60a5fa" },
              ]}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
