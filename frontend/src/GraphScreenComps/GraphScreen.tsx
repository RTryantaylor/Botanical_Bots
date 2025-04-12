import React, { useEffect, useState } from "react";
import axios from "axios";

import LineGraph from "./LineGraph";

type SensorEntry = {
    timestamp: string;
    temp: number | null;
    ph: number | null;
    moisture: number | null;
    light: number | null;
};
  

function GraphScreen() {
    // check boxes for which graphs are visible
    const [visibleGraphs, setVisibleGraphs] = useState({
        temp: true,
        ph: false,
        moisture: false,
        light: false,
    });

    // check box for two types of graphs
    const [graphType, setGraphType] = useState<"today" | "week">("today");

    // lists of entries for each type of graph
    const [tempGraphEntries, setTempGraphEntries] = useState<{ timestamp: string; temp: number | null }[]>([]);
    const [phGraphEntries, setPhGraphEntries] = useState<{ timestamp: string; ph: number | null }[]>([]);
    const [moistureGraphEntries, setMoistureGraphEntries] = useState<{ timestamp: string; moisture: number | null }[]>([]);
    const [lightGraphEntries, setLightGraphEntries] = useState<{ timestamp: string; light: number | null }[]>([]);    

    useEffect(() => {
        const fetchData = () => {
          const url =
            graphType === "today"
              ? "http://192.168.1.197:8085/get_today_graph"
              : "http://192.168.1.197:8085/get_week_graph";
      
          axios.get(url)
            .then(res => {
              const data = res.data;
              const entries = data.entries || {};
      
              // Generate the correct list of timestamps
              const expectedTimestamps =
                graphType === "today"
                    ? Array.from({ length: 24 }, (_, i) =>
                        `${i.toString().padStart(2, "0")}:00`
                    )
                  : Array.from({ length: 7 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i)); // last 7 days
                        const mm = (date.getMonth() + 1).toString().padStart(2, "0");
                        const dd = date.getDate().toString().padStart(2, "0");
                        return `${mm}-${dd}`; // this matches backend keys
                    });
      
              // Format the data from backend
              const parsed: SensorEntry[] = Object.entries(entries).map(([timestamp, entry]) => {
                const sensorEntry = entry as SensorEntry;
                const formattedTimestamp =
                  graphType === "today"
                    ? `${timestamp.padStart(2, "0")}:00`
                    : timestamp; // already like "Mon""
      
                return {
                  timestamp: formattedTimestamp,
                  temp: sensorEntry.temp,
                  ph: sensorEntry.ph,
                  moisture: sensorEntry.moisture,
                  light: sensorEntry.light,
                };
              });
      
              // Fill in missing timestamps
              const entryMap = new Map(parsed.map(entry => [entry.timestamp, entry]));
              const fullEntries: SensorEntry[] = expectedTimestamps.map(ts => {
                const entry = entryMap.get(ts);
                return {
                  timestamp: ts,
                  temp: entry?.temp ?? null,
                  ph: entry?.ph ?? null,
                  moisture: entry?.moisture ?? null,
                  light: entry?.light ?? null,
                };
              });
      
              // Set individual sensor states
              setTempGraphEntries(fullEntries.map(({ timestamp, temp }) => ({ timestamp, temp })));
              setPhGraphEntries(fullEntries.map(({ timestamp, ph }) => ({ timestamp, ph })));
              setMoistureGraphEntries(fullEntries.map(({ timestamp, moisture }) => ({ timestamp, moisture })));
              setLightGraphEntries(fullEntries.map(({ timestamp, light }) => ({ timestamp, light })));
            })
            .catch(err => console.error("Error fetching sensor data:", err));
        };
      
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [graphType]);

    return(
        <>  
            <div>
                <b>Select Graphs: </b>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                    {Object.entries(visibleGraphs).map(([key, value]) => (
                        <label key={key}>
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={() =>
                            setVisibleGraphs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                            }
                        />
                        {key}
                        </label>
                    ))}
                </div>
                <div>
                    <b>Graph Type:</b>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <label>
                        <input
                            type="radio"
                            name="graphType"
                            value="today"
                            checked={graphType === "today"}
                            onChange={() => setGraphType("today")}
                        />
                        Today
                        </label>
                        <label>
                        <input
                            type="radio"
                            name="graphType"
                            value="week"
                            checked={graphType === "week"}
                            onChange={() => setGraphType("week")}
                        />
                        Week
                        </label>
                    </div>
                </div>
            </div>
            {visibleGraphs.temp && (
                <LineGraph data={tempGraphEntries} yAxisKey="temp" graphType={graphType} color="#ff7300" />
            )}
            {visibleGraphs.ph && (
                <LineGraph data={phGraphEntries} yAxisKey="ph" graphType={graphType} color="#387908" />
            )}
            {visibleGraphs.moisture && (
                <LineGraph data={moistureGraphEntries} yAxisKey="moisture" graphType={graphType} color="#0066cc" />
            )}
            {visibleGraphs.light && (
                <LineGraph data={lightGraphEntries} yAxisKey="light" graphType={graphType} color="#ffaa00" />
            )}
        </>
    )
}

export default GraphScreen;