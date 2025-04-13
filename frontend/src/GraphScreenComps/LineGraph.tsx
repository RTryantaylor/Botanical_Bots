import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type LineGraphProps = {
  data: { timestamp: string; [key: string]: any }[];
  yAxisKey: string;
  graphType: "today" | "week" | "hour";
  color?: string;
};

const formatValue = (value: number, key: string): string => {
  const formatted = value.toFixed(1);
  switch (key.toLowerCase()) {
    case "temp":
    case "temperature":
      return `${formatted} °F`;
    case "ph":
      return `${formatted} pH`;
    case "moisture":
      return `${formatted}% VWC`;
    case "light":
      return `${formatted} lux`;
    default:
      return formatted;
  }
};

function LineGraph({ data, yAxisKey, graphType, color = "#8884d8" }: LineGraphProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
            dataKey="timestamp"
            type="category"
            tick={{ fontSize: 13 }}
            ticks={
                graphType === "hour"
                ? Array.from({ length: 60 }, (_, i) => i).filter(i => i % 2 === 0).map(i => i.toString().padStart(2, "0"))
                : graphType === "today"
                ? Array.from({ length: 24 }, (_, i) => i).filter(i => i % 2 === 0).map(i => `${i.toString().padStart(2, "0")}:00`)
                : undefined
            }
        />
        <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => value.toFixed(1)} // just the number
            label={{
                value:
                yAxisKey === "temp"
                    ? "°F"
                    : yAxisKey === "ph"
                    ? "pH"
                    : yAxisKey === "moisture"
                    ? "% VWC"
                    : yAxisKey === "light"
                    ? "lux"
                    : "",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fontSize: 12, fill: "#555" },
            }}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === "number" ? formatValue(value, yAxisKey) : value
          }
        />
        <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineGraph;
