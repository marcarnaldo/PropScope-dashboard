import { getCachedOdds } from "@/lib/oddsCache";
import { getFixtureById } from "@/lib/queries/fixtures";
import OddsChart from "../../../components/oddsChart";

const PROP_LABELS: Record<string, string> = {
  points: "Points",
  rebounds: "Rebounds",
  assists: "Assists",
  threes: "Threes",
  points_rebounds_assists: "Pts + Reb + Ast",
  points_assists: "Pts + Ast",
  points_rebounds: "Pts + Reb",
  rebounds_assists: "Reb + Ast",
};

function fmtPct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function gapDisplay(gap: number) {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

function gapColor(gap: number) {
  if (gap > 0.001) return "#34d399";
  if (gap < -0.001) return "#f87171";
  return "#71717a";
}

export default async function PlayerPropsPage({
  params,
  searchParams,
}: {
  params: Promise<{ fixtureId: string; player: string }>;
  searchParams: Promise<{ prop?: string; line?: string }>;
}) {
  const { fixtureId, player } = await params;
  const { prop, line } = await searchParams;

  const fixtureIdNum = parseInt(fixtureId);
  const decodedPlayer = decodeURIComponent(player);

  const fixture = await getFixtureById(fixtureIdNum);
  if (!fixture) return <p className="text-zinc-400 p-8">Fixture not found</p>;

  const { home_team, away_team, start_date, status } = fixture;

  if (!prop) return <p className="text-zinc-400 p-8">No prop type specified</p>;

  const oddsHistory = await getCachedOdds(fixtureIdNum);
  const latestSnapshot = oddsHistory?.[oddsHistory.length - 1] ?? null;

  const oddsData =
    typeof latestSnapshot?.odds_data === "string"
      ? JSON.parse(latestSnapshot.odds_data)
      : latestSnapshot?.odds_data;

  const playerProp = oddsData?.props?.[decodedPlayer]?.[prop];

  if (!playerProp)
    return <p className="text-zinc-400 p-8">No odds available</p>;

  const overGap = playerProp.fdOddsNoVig.over - playerProp.siaOddsNoVig.over;
  const underGap = playerProp.fdOddsNoVig.under - playerProp.siaOddsNoVig.under;

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 px-6 py-8">
      <div className="max-w-400 mx-auto">
        {/* Header */}
        <div className="mb-8 pb-5 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-50 mb-1.5">
              {decodedPlayer}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-lg text-zinc-400 font-medium">
                {PROP_LABELS[prop] ?? prop}
              </span>
              <span className="text-lg text-zinc-600">·</span>
              <span className="text-base font-bold text-zinc-200">
                {playerProp.line}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg text-zinc-300 font-semibold mb-1">
              {away_team} <span className="text-zinc-600 mx-1">@</span>{" "}
              {home_team}
            </p>
            <p className="text-lg text-zinc-600">
              {new Date(start_date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              ·{" "}
              {new Date(start_date).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Odds comparison */}
        <div className="bg-[#13151b] rounded-xl overflow-hidden border border-zinc-800 mb-6 px-6 py-5">
          <table className="w-full" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th className="pb-2 text-left" style={{ width: "25%" }}></th>
                <th
                  colSpan={2}
                  className="pb-2 text-center text-sm font-bold uppercase tracking-widest text-emerald-500"
                >
                  Over
                </th>
                <th
                  colSpan={2}
                  className="pb-2 text-center text-sm font-bold uppercase tracking-widest text-red-400"
                >
                  Under
                </th>
              </tr>
              <tr>
                <th className="pb-3"></th>
                <th className="pb-3 text-center text-lg text-zinc-500">
                  No-Vig
                </th>
                <th className="pb-3 text-center text-lg text-zinc-600">Raw</th>
                <th className="pb-3 text-center text-lg text-zinc-500">
                  No-Vig
                </th>
                <th className="pb-3 text-center text-lg text-zinc-600">Raw</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 text-lg text-zinc-400">
                  Sports Interaction
                </td>
                <td className="py-3 text-center text-base font-semibold text-zinc-200">
                  {fmtPct(playerProp.siaOddsNoVig.over)}
                </td>
                <td className="py-3 text-center text-lg font-semibold text-zinc-600">
                  {fmtOdds(playerProp.siaOdds.over)}
                </td>
                <td className="py-3 text-center text-base font-semibold text-zinc-200">
                  {fmtPct(playerProp.siaOddsNoVig.under)}
                </td>
                <td className="py-3 text-center text-lg font-semibold text-zinc-600">
                  {fmtOdds(playerProp.siaOdds.under)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-lg text-zinc-400">FanDuel</td>
                <td className="py-3 text-center text-base font-bold text-blue-400">
                  {fmtPct(playerProp.fdOddsNoVig.over)}
                </td>
                <td className="py-3 text-center text-lg font-semibold text-zinc-600">
                  {fmtOdds(playerProp.fdOdds.over)}
                </td>
                <td className="py-3 text-center text-base font-bold text-blue-400">
                  {fmtPct(playerProp.fdOddsNoVig.under)}
                </td>
                <td className="py-3 text-center font-semibold text-lg text-zinc-600">
                  {fmtOdds(playerProp.fdOdds.under)}
                </td>
              </tr>
              <tr className="border-t border-zinc-800">
                <td className="pt-3 text-lg text-zinc-500">Gap</td>
                <td
                  colSpan={2}
                  className="pt-3 text-center text-lg font-bold"
                  style={{ color: gapColor(overGap) }}
                >
                  {gapDisplay(overGap)}
                </td>
                <td
                  colSpan={2}
                  className="pt-3 text-center text-lg font-bold"
                  style={{ color: gapColor(underGap) }}
                >
                  {gapDisplay(underGap)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart placeholder */}
        <OddsChart fixtureId={fixtureIdNum} player={decodedPlayer} propType={prop} />
      </div>
    </main>
  );
}
