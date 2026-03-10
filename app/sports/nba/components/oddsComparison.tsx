"use client";

export interface OddsBook {
  label: string;
  line: number;
  noVigOver: number;
  noVigUnder: number;
  color: string;        // primary color for the book
  dimmedColor: string;  // dimmed color for non-best side
  isSharp?: boolean;    // marks this book as the sharp line (used for gap calc)
}

export interface OddsComparisonProps {
  books: OddsBook[];
  edge?: {
    fairProbOver: number;
    fairProbUnder: number;
  };
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function gapDisplay(gap: number): string {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

export default function OddsComparison({ books, edge }: OddsComparisonProps) {
  if (books.length === 0) return null;

  // Find the sharp book (defaults to last book if none marked)
  const sharpBook = books.find((b) => b.isSharp) ?? books[books.length - 1];
  // The non-sharp book is the first one that isn't sharp
  const targetBook = books.find((b) => b !== sharpBook) ?? books[0];

  const hasDifferentLines = books.some((b) => b.line !== sharpBook.line);

  // Fair values: use edge when lines differ, otherwise sharp's no-vig
  const fairOver = edge ? edge.fairProbOver : sharpBook.noVigOver;
  const fairUnder = edge ? edge.fairProbUnder : sharpBook.noVigUnder;

  // Gap: fair - target book
  const overGap = fairOver - targetBook.noVigOver;
  const underGap = fairUnder - targetBook.noVigUnder;

  const bestSide = overGap >= underGap ? "over" : "under";

  return (
    <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
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

      {/* Book rows */}
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

      {/* Fair row — only when lines differ */}
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