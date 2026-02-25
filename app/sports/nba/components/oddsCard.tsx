"use client";

import { useRouter } from "next/navigation";
import { NormalizedProp } from "./oddsBoard";
import { Cardo } from "next/font/google";
import GapChart from "./gapChart";

export interface PropRow {
  player: string;
  propType: string;
  prop: NormalizedProp;
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  fixtureId: number;
}

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

export function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function gapDisplay(gap: number): string {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

function gapType(gap: number): "positive" | "negative" | "neutral" {
  if (gap > 0.001) return "positive";
  if (gap < -0.001) return "negative";
  return "neutral";
}

const gapStyles = {
  positive: "text-emerald-400 bg-emerald-500/10",
  negative: "text-red-400 bg-red-500/10",
  neutral: "text-zinc-500",
};

export default function OddsCard({ row }: { row: PropRow }) {
  const router = useRouter();
  const { player, propType, prop, homeTeam, awayTeam, startDate, fixtureId } =
    row;

  return (
    <div className="bg-[#13151b] border border-zinc-800/70 rounded-xl w-full p-4">
      <div
        className="cursor-pointer"
        onClick={() =>
          router.push(`/sports/nba/props/${row.fixtureId}/${encodeURIComponent(row.player)}?prop=${row.propType}`)
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate">
                {player}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {awayTeam} <span className="text-zinc-600">@</span> {homeTeam} ·{" "}
                {new Date(startDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="shrink-0 border border-zinc-700/50 rounded-lg px-2.5 py-1.5 bg-zinc-800/30 text-center min-w-12">
            <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider leading-none">
              {PROP_LABELS[propType] ?? propType}
            </p>
            <p className="text-base font-bold text-zinc-100 leading-tight mt-0.5">
              {prop.line}
            </p>
          </div>
        </div>
        <OddsComparison prop={prop} />
      </div>

      <GapChart fixtureId={fixtureId} player={player} propType={propType} />
    </div>
  );
}

function OddsComparison({ prop }: { prop: NormalizedProp }) {
  const overGap = prop.fdOddsNoVig.over - prop.siaOddsNoVig.over;
  const underGap = prop.fdOddsNoVig.under - prop.siaOddsNoVig.under;

  return (
    <div className="mt-4">
      {/* Column headers */}
      <div className="flex">
        <span className="w-8" />
        <span className="flex-1 text-center text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
          Over
        </span>
        <span className="flex-1 text-center text-[10px] font-bold text-red-400/80 uppercase tracking-widest">
          Under
        </span>
      </div>

      {/* SIA */}
      <div className="flex items-center py-1.5">
        <span className="w-8 text-[11px] text-zinc-500 font-medium">SIA</span>
        <span className="flex-1 text-center text-sm font-semibold text-zinc-300 tabular-nums">
          {fmtPct(prop.siaOddsNoVig.over)}
        </span>
        <span className="flex-1 text-center text-sm font-semibold text-zinc-300 tabular-nums">
          {fmtPct(prop.siaOddsNoVig.under)}
        </span>
      </div>

      {/* FD */}
      <div className="flex items-center py-1.5">
        <span className="w-8 text-[11px] text-zinc-500 font-medium">FD</span>
        <span className="flex-1 text-center text-sm font-bold text-blue-400 tabular-nums">
          {fmtPct(prop.fdOddsNoVig.over)}
        </span>
        <span className="flex-1 text-center text-sm font-bold text-blue-400 tabular-nums">
          {fmtPct(prop.fdOddsNoVig.under)}
        </span>
      </div>

      {/* Gap */}
      <div className="flex items-center py-1.5 border-t border-zinc-800/60">
        <span className="w-8 text-[11px] text-zinc-600 font-medium">GAP</span>
        <div className="flex-1 flex justify-center">
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${gapStyles[gapType(overGap)]}`}
          >
            {gapDisplay(overGap)}
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${gapStyles[gapType(underGap)]}`}
          >
            {gapDisplay(underGap)}
          </span>
        </div>
      </div>
    </div>
  );
}
