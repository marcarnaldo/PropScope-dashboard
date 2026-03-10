"use client";

import { useRouter } from "next/navigation";
import { NormalizedProp, PropRow } from "./oddsBoard";
import { PROP_LABELS } from "./filter";
import { fmtPct, GapPill } from "./oddsComparison";
import { PropTypeBadge } from "./ui";

export default function OddsCard({
  row,
  isBetted,
  onToggleBet,
}: {
  row: PropRow;
  isBetted?: boolean;
  onToggleBet?: () => void;
}) {
  const router = useRouter();
  const { player, propType, prop, fixtureId } = row;

  return (
    <div
      className={`bg-[#13151b] border rounded-xl w-full p-4 ${
        isBetted ? "border-emerald-500/40" : "border-zinc-800/70"
      }`}
    >
      <div
        className="cursor-pointer"
        onClick={() =>
          router.push(
            `/sports/nba/props/${fixtureId}/${encodeURIComponent(player)}?prop=${propType}`,
          )
        }
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-zinc-100 truncate text-md">{player}</p>
          <PropTypeBadge label={PROP_LABELS[propType] ?? propType} />
        </div>

        <PropGrid prop={prop} />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBet?.();
        }}
        className={`mt-2 w-full py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          isBetted
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-zinc-800/50 text-zinc-600 hover:text-zinc-400"
        }`}
      >
        {isBetted ? "Betted ✓" : "Mark as bet"}
      </button>
    </div>
  );
}

// Compact odds grid shown inside each card
function PropGrid({ prop }: { prop: NormalizedProp }) {
  const hasDifferentLines = prop.siaLine !== prop.fdLine;
  const edge = prop.edge;

  // When lines differ, use interpolated edge probs as fair value.
  // When lines match, FD no-vig is the fair baseline.
  const fairOver = edge ? edge.fairProbOver : prop.fdOddsNoVig.over;
  const fairUnder = edge ? edge.fairProbUnder : prop.fdOddsNoVig.under;

  const overGap = fairOver - prop.siaOddsNoVig.over;
  const underGap = fairUnder - prop.siaOddsNoVig.under;

  const bestSide = overGap >= underGap ? "over" : "under";

  return (
    <div className="mt-4">
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

      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
        <span className="text-sm text-zinc-600 font-semibold self-center">SIA</span>
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

      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
        <span className="text-sm text-zinc-600 font-semibold self-center">FD</span>
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

      {/* Fair row — only when SIA and FD are on different lines */}
      {hasDifferentLines && edge && (
        <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
          <span className="text-sm text-zinc-600 font-semibold self-center">Fair</span>
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

      <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-2 border-t border-white/4">
        <span className="text-sm text-zinc-700 font-semibold self-center">Gap</span>
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
