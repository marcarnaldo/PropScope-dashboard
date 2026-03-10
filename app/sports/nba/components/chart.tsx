"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface LineBookConfig {
  label: string;
  lineKey: string;
  color: string;
  title?: string;
}

interface LineMovementChartProps {
  data: Record<string, number | string>[];
  books: LineBookConfig[];
  height?: number;
}

export default function Chart({
  data,
  books,
  height = 160,
}: LineMovementChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
        <p className="text-zinc-500 text-sm">Waiting for chart data...</p>
      </div>
    );
  }

  const title = books[0]?.title;

  return (
    <div className="bg-[#13151b] rounded-2xl border border-zinc-800/60 p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {title ? (
          <span className="text-xs sm:text-sm font-semibold text-zinc-600 uppercase tracking-wider">
            {title}
          </span>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2.5">
          {books.map((book) => (
            <span key={book.label} className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: book.color }}
              />
              <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                {book.label}
              </span>
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis
            dataKey="time"
            tick={{ fill: "#3f3f46", fontSize: 12 }}
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
          />
          {books.map((book) => (
            <Line
              key={book.label}
              dataKey={book.lineKey}
              name={book.label}
              stroke={book.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
