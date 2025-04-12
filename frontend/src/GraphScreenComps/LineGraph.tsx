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
                    }); // "Apr 06"
                    }
                    return value; // Just "00:00", "01:00", etc.
                }}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yAxisKey} stroke={color} />
        </LineChart>
        </ResponsiveContainer>
    );
}

export default LineGraph;
