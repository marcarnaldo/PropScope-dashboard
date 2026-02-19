"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCachedOdds } from "@/lib/oddsCache";
import { NormalizedProp } from "@/app/sports/nba/components/oddsBoard";

interface ChartDataPoint {
  time: string;
  siaOver: number;
  fdOver: number;
  siaUnder: number;
  fdUnder: number;
}

export default function OddsChart({
  fixtureId,
  player,
  propType,
}: {
  fixtureId: number;
  player: string;
  propType: string;
}) {
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    async function loadData() {
      const snapshots = await getCachedOdds(fixtureId);
      if (!snapshots) return;

      const chartData: ChartDataPoint[] = [];

      for (const snapshot of snapshots) {
        const oddsData =
          typeof snapshot.odds_data === "string"
            ? JSON.parse(snapshot.odds_data)
            : snapshot.odds_data;

        const prop: NormalizedProp | undefined =
          oddsData?.props?.[player]?.[propType];
        if (!prop) continue;

        chartData.push({
          time: new Date(snapshot.snapshot_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          siaOver: parseFloat((prop.siaOddsNoVig.over * 100).toFixed(2)),
          fdOver: parseFloat((prop.fdOddsNoVig.over * 100).toFixed(2)),
          siaUnder: parseFloat((prop.siaOddsNoVig.under * 100).toFixed(2)),
          fdUnder: parseFloat((prop.fdOddsNoVig.under * 100).toFixed(2)),
        });
      }

      setData(chartData);
    }

    loadData();
  }, [fixtureId, player, propType]);

  if (data.length === 0) {
    return (
      <div className="bg-[#13151b] border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-zinc-500 text-sm">Waiting for chart data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#13151b] border border-zinc-800 rounded-xl p-6 mb-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: number | undefined) => `${value ?? 0}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
          <Line
            dataKey="fdOver"
            name="FD Over"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="fdUnder"
            name="FD Under"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="siaOver"
            name="SIA Over"
            stroke="#e4e4e7"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="siaUnder"
            name="SIA Under"
            stroke="#a1a1aa"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
