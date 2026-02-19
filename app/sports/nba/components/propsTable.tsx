"use client";

import { useState, useMemo } from "react";
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

// Only sortable columns
type SortKey =
  | "player"
  | "matchup"
  | "prop"
  | "overGap"
  | "underGap"
  | "siaOver"
  | "siaUnder"
  | "fdOver"
  | "fdUnder";

type SortDirection = "asc" | "desc";

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

function gapDisplay(gap: number) {
  return `${gap > 0 ? "+" : ""}${(gap * 100).toFixed(1)}%`;
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

export default function PropsTable({ rows }: PropsTableProps) {
  // A useState for when the user sort the columns
  // On initial load, the data is sorted by the matchup
  const [sortKey, setSortKey] = useState<SortKey>("matchup");
  // On initial load, the data is sorted descendingly
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const router = useRouter();

  // useMemo will allow the sorting to be quick because it caches values
  // This is great because we are just sorting already existing values. No reason to pull from db again
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDirection]); // Dependencies

  function handleSort(key: SortKey) {
    // check if what we are sorting is currently the one in sortKey since users can sort the same key
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set the sortKey to the one the user wants to sort
      setSortKey(key);
      // The sort will default on desc if it's the first time it is clicked
      setSortDirection("desc");
    }
  }

  return (
    <div className="w-full overflow-auto max-h-[85vh] [&::-webkit-scrollbar]{display:none} [-ms-overflow-style:none] [scrollbar-width:none] max-w-400 mx-auto px-4">
      <table
        className="w-full min-w-225"
        style={{ borderSpacing: "0 10px", borderCollapse: "separate" }}
      >
        <thead className="sticky top-0 z-10">
          <tr>
            {/* Left columns */}
            <SortableTh
              label="Player"
              sortKey="player"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-left pl-5 pr-4"
            />
            <SortableTh
              label="Matchup"
              sortKey="matchup"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-left pr-4"
            />
            <SortableTh
              label="Prop"
              sortKey="prop"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-left pr-4"
            />
            <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-4 pb-2 bg-zinc-900">
              Line
            </th>

            {/* Over group */}
            <SortableTh
              label="Sports Int."
              sortKey="siaOver"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center px-3"
            />
            <SortableTh
              label="Fanduel"
              sortKey="fdOver"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center px-3"
            />
            <SortableTh
              label="Over Gap"
              sortKey="overGap"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center px-2"
            />

            {/* Under group */}
            <SortableTh
              label="Sports Int."
              sortKey="siaUnder"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center px-3"
            />
            <SortableTh
              label="Fanduel"
              sortKey="fdUnder"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center px-3"
            />
            <SortableTh
              label="Under Gap"
              sortKey="underGap"
              current={sortKey}
              dir={sortDirection}
              onSort={handleSort}
              className="text-center pl-2"
            />
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => {
            const rowKey = `${row.fixtureId}-${row.player}-${row.propType}`;
            const overGap =
              row.prop.fdOddsNoVig.over - row.prop.siaOddsNoVig.over;
            const underGap =
              row.prop.fdOddsNoVig.under - row.prop.siaOddsNoVig.under;
            const overType = gapType(overGap);
            const underType = gapType(underGap);

            return (
              <tr
                key={rowKey}
                onClick={() =>
                  router.push(
                    `/sports/nba/props/${row.fixtureId}/${encodeURIComponent(row.player)}?prop=${row.propType}`,
                  )
                }
                className="group cursor-pointer"
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
                    {row.awayTeam} <span className="text-zinc-600">@</span>{" "}
                    {row.homeTeam}
                  </span>
                </td>

                {/* Prop */}
                <td className="pr-10 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-sm font-medium text-zinc-300 whitespace-nowrap">
                    {PROP_LABELS[row.propType] ?? row.propType}
                  </span>
                </td>

                {/* Line */}
                <td className="pr-4 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <span className="text-zinc-50 tabular-nums">
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
                <td className="pl-2 py-5 bg-[#13151b] border-y border-zinc-800 group-hover:border-zinc-700/70 transition-colors">
                  <div className="flex justify-center">
                    <span
                      className={`text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg ${gapTextColor[underType]} ${gapBgColor[underType]}`}
                    >
                      {gapDisplay(underGap)}
                    </span>
                  </div>
                </td>

                <td className="pl-2 py-5 bg-[#13151b] border-y border-r border-zinc-800 rounded-r-xl group-hover:border-zinc-700/70 transition-colors"></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function gapType(gap: number): "positive" | "negative" | "neutral" {
  if (gap > 0.001) return "positive";
  if (gap < -0.001) return "negative";
  return "neutral";
}

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
    </td>
  );
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
    case "siaOver":
      return row.prop.siaOddsNoVig.over;
    case "siaUnder":
      return row.prop.siaOddsNoVig.under;
    case "fdOver":
      return row.prop.fdOddsNoVig.over;
    case "fdUnder":
      return row.prop.fdOddsNoVig.under;
  }
}

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
  dir: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = current === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`bg-zinc-900 pb-2 cursor-pointer select-none transition-colors whitespace-nowrap ${className}`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isActive ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {label}
      </span>
      <span className="inline-flex flex-col ml-1 -space-y-1 align-middle leading-none gap-y-1">
        <span
          className={`text-[10px] ${
            isActive && dir === "asc" ? "text-blue-400" : "text-zinc-700"
          }`}
        >
          ▲
        </span>
        <span
          className={`text-[10px] ${
            isActive && dir === "desc" ? "text-blue-400" : "text-zinc-700"
          }`}
        >
          ▼
        </span>
      </span>
    </th>
  );
}
