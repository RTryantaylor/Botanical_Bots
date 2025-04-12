import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const sensorData = [
    { timestamp: "10:00", temperature: 23.5 },
    { timestamp: "10:01", temperature: 23.6 },
    { timestamp: "10:02", temperature: 23.7 },
];

function RandomGraph() {
    return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
}

export default RandomGraph;