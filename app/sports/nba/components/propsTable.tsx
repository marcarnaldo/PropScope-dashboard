"use client";

import { useState, useMemo } from "react";

interface NormalizedProp {
  line: number;
  siaOdds: { over: number; under: number };
  fdOdds: { over: number; under: number };
  siaOddsNoVig: { over: number; under: number };
  fdOddsNoVig: { over: number; under: number };
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

interface PropsTableProps {
  rows: PropRow[];
}

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

type SortKey = "player" | "matchup" | "prop" | "overGap" | "underGap";
type SortDir = "asc" | "desc";

function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function gapType(gap: number): "positive" | "negative" | "neutral" {
  if (gap > 0.001) return "positive";
  if (gap < -0.001) return "negative";
  return "neutral";
}

function gapDisplay(gap: number) {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

function getSortValue(row: PropRow, key: SortKey): string | number {
  switch (key) {
    case "player":
      return row.player.toLowerCase();
    case "matchup":
      return `${row.awayTeam} ${row.homeTeam}`.toLowerCase();
    case "prop":
      return row.propType;
    case "overGap":
      return row.prop.fdOddsNoVig.over - row.prop.siaOddsNoVig.over;
    case "underGap":
      return row.prop.fdOddsNoVig.under - row.prop.siaOddsNoVig.under;
  }
}

const gapTextColor = {
  positive: "text-emerald-400",
  negative: "text-red-400",
  neutral: "text-zinc-500",
};

const gapBgColor = {
  positive: "bg-emerald-500/10",
  negative: "bg-red-500/10",
  neutral: "",
};

export default function PropsTable({ rows }: PropsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("overGap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="w-full"
        style={{ borderSpacing: "0 10px", borderCollapse: "separate" }}
      >
        <thead>
          <tr>
            {/* Left columns */}
            <SortableTh
              label="Player"
              sortKey="player"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="text-left pl-5 pr-4"
            />
            <SortableTh
              label="Matchup"
              sortKey="matchup"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="text-left pr-4"
            />
            <SortableTh
              label="Prop"
              sortKey="prop"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="text-left pr-4"
            />
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-4 pb-2">
              Line
            </th>

            {/* Over group */}
            <BookTh bookName="SportsInteraction" sub="No-vig" side="over" />
            <BookTh bookName="FanDuel" sub="No-vig" side="over" accent />
            <SortableTh
              label="Over Gap"
              sortKey="overGap"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="text-center px-2"
            />

            {/* Under group */}
            <BookTh bookName="SportsInteraction" sub="No-vig" side="under" />
            <BookTh bookName="FanDuel" sub="No-vig" side="under" accent />
            <SortableTh
              label="Under Gap"
              sortKey="underGap"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="text-center pl-2 pr-5"
            />
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => {
            const overGap =
              row.prop.fdOddsNoVig.over - row.prop.siaOddsNoVig.over;
            const underGap =
              row.prop.fdOddsNoVig.under - row.prop.siaOddsNoVig.under;
            const overType = gapType(overGap);
            const underType = gapType(underGap);

            return (
              <tr
                key={`${row.fixtureId}-${row.player}-${row.propType}`}
                className="group"
              >
                {/* Player */}
                <td className="pl-5 pr-4 py-5 bg-[#13151b] border-y border-l border-zinc-800 rounded-l-xl group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap">
                    {row.player}
                  </span>
                </td>

                {/* Matchup */}
                <td className="pr-4 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-sm text-zinc-400 whitespace-nowrap">
                    {row.awayTeam}{" "}
                    <span className="text-zinc-600">@</span>{" "}
                    {row.homeTeam}
                  </span>
                </td>

                {/* Prop */}
                <td className="pr-4 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-sm font-medium text-zinc-300 whitespace-nowrap">
                    {PROP_LABELS[row.propType] ?? row.propType}
                  </span>
                </td>

                {/* Line */}
                <td className="pr-4 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-lg font-bold text-zinc-50 tabular-nums">
                    {row.prop.line}
                  </span>
                </td>

                {/* SportsInteraction Over */}
                <OddsTd
                  pct={row.prop.siaOddsNoVig.over}
                  odds={row.prop.siaOdds.over}
                />

                {/* FanDuel Over */}
                <OddsTd
                  pct={row.prop.fdOddsNoVig.over}
                  odds={row.prop.fdOdds.over}
                  accent
                />

                {/* Over Gap */}
                <td className="px-2 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <div className="flex justify-center">
                    <span
                      className={`text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg ${gapTextColor[overType]} ${gapBgColor[overType]}`}
                    >
                      {gapDisplay(overGap)}
                    </span>
                  </div>
                </td>

                {/* SportsInteraction Under */}
                <OddsTd
                  pct={row.prop.siaOddsNoVig.under}
                  odds={row.prop.siaOdds.under}
                />

                {/* FanDuel Under */}
                <OddsTd
                  pct={row.prop.fdOddsNoVig.under}
                  odds={row.prop.fdOdds.under}
                  accent
                />

                {/* Under Gap */}
                <td className="pl-2 pr-5 py-5 bg-[#13151b] border-y border-r border-zinc-800 rounded-r-xl group-hover:border-zinc-700/70 transition-colors">
                  <div className="flex justify-center">
                    <span
                      className={`text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg ${gapTextColor[underType]} ${gapBgColor[underType]}`}
                    >
                      {gapDisplay(underGap)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Odds table cell ---- */

function OddsTd({
  pct,
  odds,
  accent = false,
}: {
  pct: number;
  odds: number;
  accent?: boolean;
}) {
  return (
    <td className="px-3 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors text-center">
      <p
        className={`text-sm tabular-nums ${
          accent ? "font-bold text-blue-400" : "font-semibold text-zinc-200"
        }`}
      >
        {fmtPct(pct)}
      </p>
      <p className="text-xs text-zinc-600 tabular-nums mt-0.5">
        {fmtOdds(odds)}
      </p>
    </td>
  );
}

/* ---- Book column header ---- */

function BookTh({
  bookName,
  sub,
  side,
  accent = false,
}: {
  bookName: string;
  sub: string;
  side: "over" | "under";
  accent?: boolean;
}) {
  const tagColor =
    side === "over"
      ? "text-emerald-500/70 border-emerald-500/20 bg-emerald-500/5"
      : "text-red-400/70 border-red-400/20 bg-red-400/5";

  return (
    <th className="px-3 pb-2 text-center align-bottom">
      <span
        className={`inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border mb-1 ${tagColor}`}
      >
        {side}
      </span>
      <p
        className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
          accent ? "text-blue-400/70" : "text-zinc-500"
        }`}
      >
        {bookName}
      </p>
      <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
    </th>
  );
}

/* ---- Sortable header cell ---- */

function SortableTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = current === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`pb-2 cursor-pointer select-none transition-colors whitespace-nowrap ${className}`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isActive ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {label}
      </span>
      {isActive ? (
        <span className="ml-1 text-blue-400 text-[10px]">
          {dir === "asc" ? "▲" : "▼"}
        </span>
      ) : (
        <span className="ml-1 text-zinc-700 text-[10px]">▼</span>
      )}
    </th>
  );
}