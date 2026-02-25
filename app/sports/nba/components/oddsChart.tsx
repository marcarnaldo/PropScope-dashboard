"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCachedOdds } from "@/lib/oddsCache";

export default function OddsChart({
  fixtureId,
  player,
  propType,
}: {
  fixtureId: number;
  player: string;
  propType: string;
}) {
  const [data, setData] = useState<
    {
      time: string;
      siaOver: number;
      fdOver: number;
      siaUnder: number;
      fdUnder: number;
    }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      const snapshots = await getCachedOdds(fixtureId);
      if (!snapshots) return;

      const chartData: {
        time: string;
        siaOver: number;
        fdOver: number;
        siaUnder: number;
        fdUnder: number;
      }[] = [];

      for (const snapshot of snapshots) {
        const oddsData =
          typeof snapshot.odds_data === "string"
            ? JSON.parse(snapshot.odds_data)
            : snapshot.odds_data;

        const p = oddsData?.props?.[player]?.[propType];
        if (!p) continue;

        chartData.push({
          time: new Date(snapshot.snapshot_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          siaOver: parseFloat((p.siaOddsNoVig.over * 100).toFixed(2)),
          fdOver: parseFloat((p.fdOddsNoVig.over * 100).toFixed(2)),
          siaUnder: parseFloat((p.siaOddsNoVig.under * 100).toFixed(2)),
          fdUnder: parseFloat((p.fdOddsNoVig.under * 100).toFixed(2)),
        });
      }

      setData(chartData);
    }
    loadData();
  }, [fixtureId, player, propType]);

  if (data.length === 0) {
    return (
      <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
        <p className="text-zinc-500 text-sm">Waiting for chart data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
          Odds Movement
        </span>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4e4e7]"></span>
            <span className="text-[9px] sm:text-[10px] text-zinc-600">
              SIA Over
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]"></span>
            <span className="text-[9px] sm:text-[10px] text-zinc-600">
              FD Over
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]"></span>
            <span className="text-[9px] sm:text-[10px] text-zinc-600">
              SIA Under
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
            <span className="text-[9px] sm:text-[10px] text-zinc-600">
              FD Under
            </span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160} className="sm:h-40.5!">
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis
            dataKey="time"
            tick={{ fill: "#3f3f46", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: number | undefined) => `${value ?? 0}%`}
          />
          <Line
            dataKey="fdOver"
            name="FD Over"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="fdUnder"
            name="FD Under"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="siaOver"
            name="SIA Over"
            stroke="#e4e4e7"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="siaUnder"
            name="SIA Under"
            stroke="#a1a1aa"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
