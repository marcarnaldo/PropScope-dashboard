import { getCachedOdds } from "@/lib/oddsCache";
import { getFixtureById } from "@/lib/queries/fixtures";
import { PROP_LABELS } from "../../../components/oddsCard";
import { NormalizedProp } from "../../../components/oddsBoard";
import OddsChart from "../../../components/oddsChart";
export const dynamic = "force-dynamic";

function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function gapDisplay(gap: number): string {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
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

  // Get all props and odds
  const allPlayerProps = oddsData?.props?.[decodedPlayer] ?? {};
  // Get all available prop names
  const availablePropsForThisPlayer = Object.keys(allPlayerProps);

  // Get the current odds for the selected player's prop
  const playerProp = oddsData?.props?.[decodedPlayer]?.[prop];

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-300 px-2">
      <div className="max-w-300 px-2 mx-auto">
        {/* Header */}
        <div className="pt-2 sm:p-5 mb-6">
          <div className="grid grid-cols-[1fr_auto] gap-3 sm:gap-4 items-start">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {decodedPlayer}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {away_team} <span className="text-zinc-600">@</span> {home_team}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
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
              <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {PROP_LABELS[prop] ?? prop}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-0.5">
                {playerProp.line}
              </p>
            </div>
          </div>
        </div>
        {/** Prop Buttons */}
        <div className="capitalize flex gap-4 border-b border-zinc-800/60 mb-6">
          {availablePropsForThisPlayer.map((p) => (
            <a
              key={p}
              href={`/sports/nba/props/${fixtureId}/${encodeURIComponent(decodedPlayer)}?prop=${p}`}
              className={`text-xs font-semibold pb-2 transition-colors ${
                p === prop
                  ? "text-white border-b-2 border-emerald-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {PROP_LABELS[p] ?? p}
            </a>
          ))}
        </div>
        <OddsChart
          fixtureId={fixtureIdNum}
          player={decodedPlayer}
          propType={prop}
        />
        <OddsComparison prop={playerProp} />
      </div>
    </main>
  );
}

function OddsComparison({ prop }: { prop: NormalizedProp }) {
  const overGap = prop.fdOddsNoVig.over - prop.siaOddsNoVig.over;
  const underGap = prop.fdOddsNoVig.under - prop.siaOddsNoVig.under;

  return (
    <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
      {/* Column headers */}
      <div className="grid grid-cols-[40px_1fr_1fr] sm:grid-cols-[72px_1fr_1fr] gap-1 sm:gap-2">
        <div></div>
        <div className="text-center text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
          Over
        </div>
        <div className="text-center text-[10px] font-bold text-red-400/80 uppercase tracking-widest">
          Under
        </div>
      </div>

      {/* Sub headers — desktop only */}
      <div className="hidden sm:grid grid-cols-[72px_1fr_1fr] gap-2 mb-2">
        <div></div>
        <div className="grid grid-cols-2">
          <span className="text-center text-[9px] text-zinc-600 font-medium">
            No-Vig
          </span>
          <span className="text-center text-[9px] text-zinc-700 font-medium">
            Raw
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-center text-[9px] text-zinc-600 font-medium">
            No-Vig
          </span>
          <span className="text-center text-[9px] text-zinc-700 font-medium">
            Raw
          </span>
        </div>
      </div>

      {/* SIA Row */}
      <div className="grid grid-cols-[40px_1fr_1fr] sm:grid-cols-[72px_1fr_1fr] gap-1 sm:gap-2 py-2.5 border-t border-zinc-800/40 mt-2 sm:mt-0">
        <span className="text-[11px] sm:text-xs text-zinc-500 font-medium self-center">
          SIA
        </span>
        {/* Mobile: no-vig only */}
        <span className="sm:hidden text-center text-sm font-semibold text-zinc-200 tabular-nums">
          {fmtPct(prop.siaOddsNoVig.over)}
        </span>
        <span className="sm:hidden text-center text-sm font-semibold text-zinc-200 tabular-nums">
          {fmtPct(prop.siaOddsNoVig.under)}
        </span>
        {/* Desktop: no-vig + raw */}
        <div className="hidden sm:grid grid-cols-2">
          <span className="text-center text-sm font-semibold text-zinc-200 tabular-nums">
            {fmtPct(prop.siaOddsNoVig.over)}
          </span>
          <span className="text-center text-sm font-semibold text-zinc-600 tabular-nums">
            {fmtOdds(prop.siaOdds.over)}
          </span>
        </div>
        <div className="hidden sm:grid grid-cols-2">
          <span className="text-center text-sm font-semibold text-zinc-200 tabular-nums">
            {fmtPct(prop.siaOddsNoVig.under)}
          </span>
          <span className="text-center text-sm font-semibold text-zinc-600 tabular-nums">
            {fmtOdds(prop.siaOdds.under)}
          </span>
        </div>
      </div>

      {/* FD Row */}
      <div className="grid grid-cols-[40px_1fr_1fr] sm:grid-cols-[72px_1fr_1fr] gap-1 sm:gap-2 py-2.5 border-t border-zinc-800/40">
        <span className="text-[11px] sm:text-xs text-zinc-500 font-medium self-center">
          FD
        </span>
        <span className="sm:hidden text-center text-sm font-bold text-blue-400 tabular-nums">
          {fmtPct(prop.fdOddsNoVig.over)}
        </span>
        <span className="sm:hidden text-center text-sm font-bold text-blue-400 tabular-nums">
          {fmtPct(prop.fdOddsNoVig.under)}
        </span>
        <div className="hidden sm:grid grid-cols-2">
          <span className="text-center text-sm font-bold text-blue-400 tabular-nums">
            {fmtPct(prop.fdOddsNoVig.over)}
          </span>
          <span className="text-center text-sm font-semibold text-zinc-600 tabular-nums">
            {fmtOdds(prop.fdOdds.over)}
          </span>
        </div>
        <div className="hidden sm:grid grid-cols-2">
          <span className="text-center text-sm font-bold text-blue-400 tabular-nums">
            {fmtOdds(prop.fdOddsNoVig.under)}
          </span>
          <span className="text-center text-sm font-semibold text-zinc-600 tabular-nums">
            {fmtOdds(prop.fdOdds.under)}
          </span>
        </div>
      </div>

      {/* Raw odds — mobile only */}
      <div className="grid grid-cols-[40px_1fr_1fr] gap-1 py-1.5 sm:hidden">
        <span className="text-[11px] text-zinc-600 font-medium self-center">
          Raw
        </span>
        <div className="flex justify-center gap-3">
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {fmtOdds(prop.siaOdds.over)}
          </span>
          <span className="text-[11px] text-zinc-700">/</span>
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {fmtOdds(prop.fdOdds.over)}
          </span>
        </div>
        <div className="flex justify-center gap-3">
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {fmtOdds(prop.siaOdds.under)}
          </span>
          <span className="text-[11px] text-zinc-700">/</span>
          <span className="text-[11px] text-zinc-600 tabular-nums">
            {fmtOdds(prop.fdOdds.under)}
          </span>
        </div>
      </div>

      {/* Gap Row */}
      <div className="grid grid-cols-[40px_1fr_1fr] sm:grid-cols-[72px_1fr_1fr] gap-1 sm:gap-2 py-2.5 border-t border-zinc-800/60">
        <span className="text-[11px] sm:text-xs text-zinc-600 font-medium self-center">
          Gap
        </span>
        <div className="flex justify-center">
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${overGap > 0.001 ? "text-emerald-400 bg-emerald-500/10" : overGap < -0.001 ? "text-red-400 bg-red-500/10" : "text-zinc-500"}`}
          >
            {gapDisplay(overGap)}
          </span>
        </div>
        <div className="flex justify-center">
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${underGap > 0.001 ? "text-emerald-400 bg-emerald-500/10" : underGap < -0.001 ? "text-red-400 bg-red-500/10" : "text-zinc-500"}`}
          >
            {gapDisplay(underGap)}
          </span>
        </div>
      </div>
    </div>
  );
}
