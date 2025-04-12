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

type VariableGraphEntry = {
    timestamp: string;
    value: number | null;
}
  

function GraphScreen() {
    const [tempGraphEntries, setTempGraphEntries] = useState<{ timestamp: string; temp: number | null }[]>([]);
    const [phGraphEntries, setPhGraphEntries] = useState<{ timestamp: string; ph: number | null }[]>([]);
    const [moistureGraphEntries, setMoistureGraphEntries] = useState<{ timestamp: string; moisture: number | null }[]>([]);
    const [lightGraphEntries, setLightGraphEntries] = useState<{ timestamp: string; light: number | null }[]>([]);    

    useEffect(() => {
        const fetchData = () => {
            console.log(tempGraphEntries);
            axios.get("http://192.168.1.197:8085/get_today_graph")
                .then(res => {
                    const data = res.data;
                    const entries = data.entries || {};

                    // timestamp values for every hour in the day formatted
                    const fullDayTimestamps = Array.from({ length: 24 }, (_, i) =>
                        `${i.toString().padStart(2, "0")}:00`
                    );                  

                    // map the all of today's sensor entries
                    const parsed: SensorEntry[] = Object.entries(entries).map(([timestamp, entry]) => {
                        const sensorEntry = entry as SensorEntry;
                        const formattedTimestamp = `${timestamp.padStart(2, "0")}:00`;

                        return {
                            timestamp: formattedTimestamp,
                            temp: sensorEntry.temp,
                            ph: sensorEntry.ph,
                            moisture: sensorEntry.moisture,
                            light: sensorEntry.light,
                        };
                    });

                    const entryMap = new Map(parsed.map(entry => [entry.timestamp, entry]));
                    const fullDayEntries: SensorEntry[] = fullDayTimestamps.map(hour => {
                        const entry = entryMap.get(hour);
                        return {
                        timestamp: hour,
                        temp: entry?.temp ?? null,
                        ph: entry?.ph ?? null,
                        moisture: entry?.moisture ?? null,
                        light: entry?.light ?? null,
                        };
                    });
                    
                    // extract today's sensor entries for each variable
                    setTempGraphEntries(fullDayEntries.map(({ timestamp, temp }) => ({ timestamp, temp })));
                    setPhGraphEntries(fullDayEntries.map(({ timestamp, ph }) => ({ timestamp, ph })));
                    setMoistureGraphEntries(fullDayEntries.map(({ timestamp, moisture }) => ({ timestamp, moisture })));
                    setLightGraphEntries(fullDayEntries.map(({ timestamp, light }) => ({ timestamp, light })));

                })
                .catch(err => console.error("Error fetching sensor data:", err));
            };

        fetchData(); // Get immediately on mount
        const interval = setInterval(fetchData, 5000); // Every 5s

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return(
        <>
            <LineGraph data={tempGraphEntries} yAxisKey="temp" color="#ff7300" />
            <LineGraph data={phGraphEntries} yAxisKey="ph" color="#387908" />
            <LineGraph data={moistureGraphEntries} yAxisKey="moisture" />
            <LineGraph data={lightGraphEntries} yAxisKey="light" />

        </>
    )
}

export default GraphScreen;