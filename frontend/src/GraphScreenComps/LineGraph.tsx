import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type LineGraphProps = {
  data: { timestamp: string; [key: string]: any }[];
  yAxisKey: string;
  graphType: "today" | "week";
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
      return `${formatted} %`;
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
          tickFormatter={(value: string) => {
            if (graphType === "week") {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
              });
            }
            return value;
          }}
        />
        <YAxis tickFormatter={(value: number) => formatValue(value, yAxisKey)} />
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
