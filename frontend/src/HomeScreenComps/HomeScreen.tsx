import React from 'react';
import { useState, useEffect } from 'react';
import axios from "axios";

import "./HomeScreen.css"
import PlantSelector from './PlantSelector';

function HomeScreen() {
  const [sensorData, setSensorData] = useState({
    temp: 0,
    ph: 0,
    moisture: 0,
    light: 0,
  })
  
  useEffect(() => {
    const fetchData = () => {
      axios.get("http://192.168.1.197:8085/get_sensor_data")
        .then(res => setSensorData(res.data))
        .catch(err => console.error("Error fetching sensor data:", err));
    };

    fetchData(); // Get immediately on mount
    const interval = setInterval(fetchData, 5000); // Every 5s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])

  return (
    <div className="whole-screen-flex">
      <div className="right-screen-flex">
        <PlantSelector />
      </div>
      <div className="left-screen-flex">
        <div>Temperature:{sensorData.temp}</div>
        <div>PH:{sensorData.ph}</div>
        <div>Moisture:{sensorData.moisture}</div>
        <div>Light:{sensorData.light}</div>
      </div>
    </div>
  );
}

export default HomeScreen;
