"use client";

export interface OddsBook {
  label: string;
  line: number;
  noVigOver: number;
  noVigUnder: number;
  color: string;
  dimmedColor: string;
  isSharp?: boolean; // FD is sharp — used as the baseline for gap calc
}

export interface OddsComparisonProps {
  books: OddsBook[];
  edge?: {
    fairProbOver: number;
    fairProbUnder: number;
    method: string;
  };
}

export function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function gapDisplay(gap: number): string {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

export function GapPill({ gap, isBest }: { gap: number; isBest: boolean }) {
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

export default function OddsComparison({ books, edge }: OddsComparisonProps) {
  if (books.length === 0) return null;

  // Sharp book is FD — it's the baseline. Everything else is compared against it.
  const sharpBook = books.find((b) => b.isSharp) ?? books[books.length - 1];
  const targetBook = books.find((b) => b !== sharpBook) ?? books[0];

  const hasDifferentLines = books.some((b) => b.line !== sharpBook.line);

  // When lines differ, edge probs are interpolated to the target line — use those.
  // When lines match, FD no-vig is already the fair baseline.
  const fairOver = edge ? edge.fairProbOver : sharpBook.noVigOver;
  const fairUnder = edge ? edge.fairProbUnder : sharpBook.noVigUnder;

  const overGap = fairOver - targetBook.noVigOver;
  const underGap = fairUnder - targetBook.noVigUnder;

  const bestSide = overGap >= underGap ? "over" : "under";

  return (
    <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
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

      {books.map((book) => (
        <div
          key={book.label}
          className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5"
        >
          <span className="text-sm text-zinc-600 font-semibold self-center">
            {book.label}
          </span>
          <span
            className="text-center text-base font-bold tabular-nums font-mono"
            style={{ color: book.color }}
          >
            {book.line}
          </span>
          <span
            className="text-center text-base font-bold tabular-nums font-mono"
            style={{
              color: bestSide === "under" ? book.dimmedColor : book.color,
            }}
          >
            {fmtPct(book.noVigOver)}
          </span>
          <span
            className="text-center text-base font-bold tabular-nums font-mono"
            style={{
              color: bestSide === "over" ? book.dimmedColor : book.color,
            }}
          >
            {fmtPct(book.noVigUnder)}
          </span>
        </div>
      ))}

      {/* Fair row — only shows when SIA and FD are on different lines */}
      {hasDifferentLines && edge && (
        <div className="grid grid-cols-[36px_0.7fr_1fr_1fr] py-1.5">
          <span className="text-sm text-zinc-600 font-semibold self-center">
            Fair
          </span>
          <span className="text-center text-base font-bold text-blue-400/60 tabular-nums font-mono">
            {targetBook.line}
          </span>
          <span
            className="text-center text-base font-bold tabular-nums font-mono"
            style={{
              color: bestSide === "under" ? "rgb(59 130 246 / 0.3)" : "rgb(59 130 246 / 0.6)",
            }}
          >
            {fmtPct(fairOver)}
          </span>
          <span
            className="text-center text-base font-bold tabular-nums font-mono"
            style={{
              color: bestSide === "over" ? "rgb(59 130 246 / 0.3)" : "rgb(59 130 246 / 0.6)",
            }}
          >
            {fmtPct(fairUnder)}
          </span>
        </div>
      )}

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

      {hasDifferentLines && edge && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span className="text-sm text-zinc-700">
            Fair values via <span className="text-yellow-400 font-semibold">{edge.method}</span>
          </span>
        </div>
      )}
    </div>
  );
}
