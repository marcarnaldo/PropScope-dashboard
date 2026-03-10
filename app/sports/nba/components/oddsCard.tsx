"use client";

import { useRouter } from "next/navigation";
import { NormalizedProp } from "./oddsBoard";

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

export default function OddsCard({ row }: { row: PropRow }) {
  const router = useRouter();
  const { player, propType, prop, fixtureId } = row;

  return (
    <div className="bg-[#13151b] border border-zinc-800/70 rounded-xl w-full p-4">
      <div
        className="cursor-pointer"
        onClick={() =>
          router.push(
            `/sports/nba/props/${fixtureId}/${encodeURIComponent(player)}?prop=${propType}`,
          )
        }
      >
        {/* Header — player name + prop label (no line in header) */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-zinc-100 truncate text-md">{player}</p>
          <div className="shrink-0 border border-zinc-700/50 rounded-xl px-4 py-2.5 bg-zinc-800/30 text-center min-w-14">
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider leading-none">
              {PROP_LABELS[propType] ?? propType}
            </p>
          </div>
        </div>

        <OddsComparison prop={prop} />
      </div>
    </div>
  );
}

function OddsComparison({ prop }: { prop: NormalizedProp }) {
  const hasDifferentLines = prop.siaLine !== prop.fdLine;
  const edge = prop.edge;

  // Calculate fair values
  // When edge exists (different lines), use edge fair probs
  // When lines are the same, fair = FD no-vig
  const fairOver = edge ? edge.fairProbOver : prop.fdOddsNoVig.over;
  const fairUnder = edge ? edge.fairProbUnder : prop.fdOddsNoVig.under;

  // Gap is always: fair value - SIA
  const overGap = fairOver - prop.siaOddsNoVig.over;
  const underGap = fairUnder - prop.siaOddsNoVig.under;

  const bestSide =
    overGap >= underGap ? "over" : "under";

  return (
    <div className="mt-4">
      {/* Column headers */}
      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr]">
        <div />
        <span className="text-center text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Line
        </span>
        <span
          className={`text-center text-sm font-bold text-emerald-400 uppercase tracking-widest ${bestSide === "under" ? "opacity-40" : ""}`}
        >
          Over
        </span>
        <span
          className={`text-center text-sm font-bold text-red-400 uppercase tracking-widest ${bestSide === "over" ? "opacity-40" : ""}`}
        >
          Under
        </span>
      </div>

      {/* SIA row */}
      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
        <span className="text-sm text-zinc-600 font-semibold self-center">
          SIA
        </span>
        <span className="text-center text-base font-semibold text-zinc-300 tabular-nums font-mono">
          {prop.siaLine}
        </span>
        <span
          className={`text-center text-base font-semibold tabular-nums font-mono ${bestSide === "under" ? "text-zinc-500" : "text-zinc-300"}`}
        >
          {fmtPct(prop.siaOddsNoVig.over)}
        </span>
        <span
          className={`text-center text-base font-semibold tabular-nums font-mono ${bestSide === "over" ? "text-zinc-500" : "text-zinc-300"}`}
        >
          {fmtPct(prop.siaOddsNoVig.under)}
        </span>
      </div>

      {/* FD row */}
      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
        <span className="text-sm text-zinc-600 font-semibold self-center">
          FD
        </span>
        <span className="text-center text-base font-bold text-blue-400 tabular-nums font-mono">
          {prop.fdLine}
        </span>
        <span
          className={`text-center text-base font-bold tabular-nums font-mono ${bestSide === "under" ? "text-blue-500/50" : "text-blue-400"}`}
        >
          {fmtPct(prop.fdOddsNoVig.over)}
        </span>
        <span
          className={`text-center text-base font-bold tabular-nums font-mono ${bestSide === "over" ? "text-blue-500/50" : "text-blue-400"}`}
        >
          {fmtPct(prop.fdOddsNoVig.under)}
        </span>
      </div>

      {/* Fair row — only when lines differ */}
      {hasDifferentLines && edge && (
        <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
          <span className="text-sm text-zinc-600 font-semibold self-center">
            Fair
          </span>
          <span className="text-center text-base font-bold text-blue-400/60 tabular-nums font-mono">
            {prop.siaLine}
          </span>
          <span
            className={`text-center text-base font-bold tabular-nums font-mono ${bestSide === "under" ? "text-blue-500/30" : "text-blue-400/60"}`}
          >
            {fmtPct(fairOver)}
          </span>
          <span
            className={`text-center text-base font-bold tabular-nums font-mono ${bestSide === "over" ? "text-blue-500/30" : "text-blue-400/60"}`}
          >
            {fmtPct(fairUnder)}
          </span>
        </div>
      )}

      {/* Gap row */}
      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-2 border-t border-white/4">
        <span className="text-sm text-zinc-700 font-semibold self-center">
          Gap
        </span>
        <div />
        <div className="flex justify-center">
          <GapPill gap={overGap} isBest={bestSide === "over"} />
        </div>
        <div className="flex justify-center">
          <GapPill gap={underGap} isBest={bestSide === "under"} />
        </div>
      </div>
    </div>
  );
}

function GapPill({ gap, isBest }: { gap: number; isBest: boolean }) {
  const isPositive = gap > 0.001;
  const isNegative = gap < -0.001;

  let colorClass = "text-zinc-600";
  let bgClass = "";

  if (isPositive) {
    colorClass = isBest ? "text-emerald-400" : "text-emerald-400/50";
    bgClass = isBest ? "bg-emerald-500/10" : "";
  } else if (isNegative) {
    colorClass = isBest ? "text-red-400" : "text-red-400/50";
    bgClass = isBest ? "bg-red-500/10" : "";
  }

  return (
    <span
      className={`text-sm font-bold tabular-nums font-mono px-2 py-0.5 rounded-md ${colorClass} ${bgClass}`}
    >
      {gapDisplay(gap)}
    </span>
  );
}