import { getCachedOdds } from "@/lib/oddsCache";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { NormalizedProp } from "./oddsBoard";

export default function GapChart({
  fixtureId,
  player,
  propType,
}: {
  fixtureId: number;
  player: string;
  propType: string;
}) {
  const [data, setData] = useState<
    { time: string; overGap: number; underGap: number }[]
  >([]);

  useEffect(() => {
    async function load() {
      const snapshots = await getCachedOdds(fixtureId);
      if (!snapshots) return;

      const points: { time: string; overGap: number; underGap: number }[] = [];

      for (const snapshot of snapshots) {
        const oddsData =
          typeof snapshot.odds_data === "string"
            ? JSON.parse(snapshot.odds_data)
            : snapshot.odds_data;

        const p: NormalizedProp | undefined =
          oddsData?.props?.[player]?.[propType];
        if (!p) continue;

        points.push({
          time: new Date(snapshot.snapshot_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          overGap: parseFloat(
            ((p.fdOddsNoVig.over - p.siaOddsNoVig.over) * 100).toFixed(2),
          ),
          underGap: parseFloat(
            ((p.fdOddsNoVig.under - p.siaOddsNoVig.under) * 100).toFixed(2),
          ),
        });
      }

      setData(points);
    }
    load();
  }, [fixtureId, player, propType]);

  if (data.length < 2) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
          Gap Movement
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-zinc-600">Over</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] text-zinc-600">Under</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
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
          <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: any) => `${value > 0 ? "+" : ""}${value}%`}
          />
          <ReferenceLine y={0} stroke="#27272a" strokeDasharray="3 3" />
          <Line
            dataKey="overGap"
            stroke="#34d399"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="underGap"
            stroke="#60a5fa"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
