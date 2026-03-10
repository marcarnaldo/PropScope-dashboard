"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface BookConfig {
  label: string;
  overKey: string;
  underKey: string;
  overColor: string;
  underColor: string;
  title?: string;
}

interface OddsMovementChartProps {
  data: Record<string, number | string>[];
  books: BookConfig[];
  height?: number;
}

export default function OddsMovementChart({
  data,
  books,
  height = 160,
}: OddsMovementChartProps) {
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
            <span key={book.label} className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: book.overColor }}
                />
                <span className="text-xs sm:text-sm text-zinc-600 font-bold">
                  {book.label} Over
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: book.underColor }}
                />
                <span className="text-xs sm:text-sm text-zinc-600 font-bold">
                  {book.label} Under
                </span>
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
          {books.map((book) => (
            <Line
              key={`${book.label}-over`}
              dataKey={book.overKey}
              name={`${book.label} Over`}
              stroke={book.overColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {books.map((book) => (
            <Line
              key={`${book.label}-under`}
              dataKey={book.underKey}
              name={`${book.label} Under`}
              stroke={book.underColor}
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