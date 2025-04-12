import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type LineGraphProps = {
    data: { timestamp: string; [key: string]: any }[];
    yAxisKey: string;
    color?: string;
};

function LineGraph({ data, yAxisKey, color = "#8884d8" }: LineGraphProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yAxisKey} stroke={color} />
        </LineChart>
        </ResponsiveContainer>
    );
}

export default LineGraph;
